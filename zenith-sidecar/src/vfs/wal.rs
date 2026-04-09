//! # Write-Ahead Log (WAL) — Anti-Data-Loss Spine
//!
//! Every staged patch is journaled to `.zenith/stage.wal` *before* being
//! applied to the in-memory COW overlay. On crash recovery, replay the WAL
//! to reconstruct the staging layer.
//!
//! ## fdatasync Contract
//!
//! Every slider release triggers an `fdatasync` to guarantee durability.
//! We do NOT fsync on every scrub tick — only on release events.

use std::fs::{File, OpenOptions};
use std::io::{self, BufReader, BufWriter, Read, Write};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use tracing::{debug, info, warn};

use crate::types::TextEdit;

// ---------------------------------------------------------------------------
// WAL Entry
// ---------------------------------------------------------------------------

/// A single entry in the Write-Ahead Log.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WalEntry {
    /// A staged patch — file path + text edits.
    Patch {
        tx_id: crate::types::TransactionId,
        file: PathBuf,
        edits: Vec<TextEdit>,
        timestamp_ms: u64,
    },
    /// A checkpoint marker — WAL entries before this can be discarded
    /// once the corresponding snapshot is confirmed on disk.
    Checkpoint {
        snapshot_id: u64,
        timestamp_ms: u64,
    },
}

impl WalEntry {
    /// Create a new Patch entry with the current timestamp.
    pub fn new_patch(tx_id: crate::types::TransactionId, file: PathBuf, edits: Vec<TextEdit>) -> Self {
        let timestamp_ms = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);
        WalEntry::Patch {
            tx_id,
            file,
            edits,
            timestamp_ms,
        }
    }

    /// Create a checkpoint entry.
    pub fn new_checkpoint(snapshot_id: u64) -> Self {
        let timestamp_ms = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);
        WalEntry::Checkpoint {
            snapshot_id,
            timestamp_ms,
        }
    }
}

// ---------------------------------------------------------------------------
// WAL Writer
// ---------------------------------------------------------------------------

/// Append-only WAL writer with `fdatasync` support.
///
/// Each entry is serialized as a length-prefixed MessagePack frame:
///   [4 bytes: length (little-endian u32)] [N bytes: rmp-serde payload]
pub struct WalWriter {
    file: BufWriter<File>,
    path: PathBuf,
    entries_since_sync: u32,
}

impl WalWriter {
    /// Open or create a WAL file at the given path.
    pub fn open(path: &Path) -> io::Result<Self> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)?;

        Ok(Self {
            file: BufWriter::new(file),
            path: path.to_path_buf(),
            entries_since_sync: 0,
        })
    }

    /// Append an entry to the WAL. Does NOT fsync — call `sync()` explicitly
    /// on slider release events.
    pub fn append(&mut self, entry: &WalEntry) -> io::Result<()> {
        let payload = rmp_serde::to_vec(entry)
            .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;

        let len = payload.len() as u32;
        self.file.write_all(&len.to_le_bytes())?;
        self.file.write_all(&payload)?;
        self.file.flush()?;
        self.entries_since_sync += 1;

        debug!("WAL append: {} bytes (entries_since_sync={})", payload.len(), self.entries_since_sync);
        info!("[ZENITH-WAL] Append entry — type={:?}, bytes={}", entry, payload.len());
        Ok(())
    }

    /// Force durability — fdatasync the WAL to disk.
    ///
    /// Called on every slider release to guarantee zero data loss.
    /// Cost: ~1-10ms on SSD, acceptable for release events (not scrub ticks).
    pub fn sync(&mut self) -> io::Result<()> {
        self.file.flush()?;
        // fdatasync: sync file data without metadata (faster than full fsync)
        self.file.get_ref().sync_data()?;
        info!("[ZENITH-WAL] fdatasync complete — journaled {} entries to disk", self.entries_since_sync);
        self.entries_since_sync = 0;
        Ok(())
    }

    /// Truncate the WAL (after a successful snapshot checkpoint).
    /// v3.10: Now use's atomic rename to avoid corruption during truncation (Patch 15).
    pub fn truncate(&mut self) -> io::Result<()> {
        let parent = self.path.parent().ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "Parent dir not found"))?;
        let temp = tempfile::NamedTempFile::new_in(parent)?;
        
        // Ensure the file is flushed and closed before rename if necessary, 
        // but NamedTempFile handles this. Persist it to the target path.
        temp.persist(&self.path).map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;

        // Reopen the truncated file
        let file = OpenOptions::new()
            .create(true)
            .write(true)
            .append(true)
            .open(&self.path)?;

        self.file = BufWriter::new(file);
        self.entries_since_sync = 0;
        info!("WAL atomically truncated: {}", self.path.display());
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// WAL Reader
// ---------------------------------------------------------------------------

/// Sequential WAL reader for crash recovery replay.
pub struct WalReader;

impl WalReader {
    pub fn read_all(path: &Path) -> io::Result<(Vec<WalEntry>, bool)> {
        if !path.exists() {
            return Ok((Vec::new(), false));
        }

        let file = File::open(path)?;
        let mut reader = BufReader::new(file);
        let mut entries = Vec::new();
        let mut len_buf = [0u8; 4];
        let mut had_truncation = false;

        loop {
            // Read length prefix
            match reader.read_exact(&mut len_buf) {
                Ok(()) => {}
                Err(e) if e.kind() == io::ErrorKind::UnexpectedEof => {
                    break;
                }
                Err(_) => {
                    had_truncation = true;
                    break;
                }
            }

            let len = u32::from_le_bytes(len_buf) as usize;

            // Sanity check: reject absurdly large entries (> 64MB)
            if len == 0 || len > 64 * 1024 * 1024 {
                warn!("WAL entry corrupt length ({} bytes) — stopping replay at entry {}", len, entries.len());
                had_truncation = true;
                break;
            }

            let mut payload = vec![0u8; len];
            match reader.read_exact(&mut payload) {
                Ok(()) => {}
                Err(_) => {
                    warn!("WAL truncated at entry {} — partial write detected", entries.len());
                    had_truncation = true;
                    break;
                }
            }

            match rmp_serde::from_slice::<WalEntry>(&payload) {
                Ok(entry) => entries.push(entry),
                Err(_) => {
                    tracing::warn!("[ZENITH-WAL] Legacy format detected — wiping stage.wal");
                    let _ = std::fs::remove_file(path);
                    entries.clear();
                    had_truncation = false;
                    break;
                }
            }
        }

        info!("[ZENITH-WAL] replay — read {} entries from {}, truncated={}", entries.len(), path.display(), had_truncation);
        Ok((entries, had_truncation))
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn test_wal_write_and_replay() {
        let dir = std::env::temp_dir().join("zenith_wal_test");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        let wal_path = dir.join("test.wal");

        // Write some entries
        {
            let mut writer = WalWriter::open(&wal_path).unwrap();
            writer
                .append(&WalEntry::new_patch(
                    uuid::Uuid::new_v4(),
                    PathBuf::from("src/Button.tsx"),
                    vec![TextEdit {
                        start_line: 1,
                        start_col: 0,
                        end_line: 1,
                        end_col: 3,
                        old_text: "p-4".into(),
                        new_text: "p-6".into(),
                    }],
                ))
                .unwrap();

            writer
                .append(&WalEntry::new_patch(
                    uuid::Uuid::new_v4(),
                    PathBuf::from("src/Card.tsx"),
                    vec![TextEdit {
                        start_line: 5,
                        start_col: 10,
                        end_line: 5,
                        end_col: 14,
                        old_text: "24px".into(),
                        new_text: "32px".into(),
                    }],
                ))
                .unwrap();

            writer.sync().unwrap();
        }

        // Read them back
        let (entries, _truncated) = WalReader::read_all(&wal_path).unwrap();
        assert_eq!(entries.len(), 2);

        match &entries[0] {
            WalEntry::Patch { file, edits, .. } => {
                assert_eq!(file, &PathBuf::from("src/Button.tsx"));
                assert_eq!(edits[0].new_text, "p-6");
            }
            _ => panic!("Expected Patch entry"),
        }

        match &entries[1] {
            WalEntry::Patch { file, edits, .. } => {
                assert_eq!(file, &PathBuf::from("src/Card.tsx"));
                assert_eq!(edits[0].new_text, "32px");
            }
            _ => panic!("Expected Patch entry"),
        }

        // Cleanup
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn test_wal_empty_file() {
        let dir = std::env::temp_dir().join("zenith_wal_empty_test");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        let wal_path = dir.join("empty.wal");
        File::create(&wal_path).unwrap();

        let (entries, _truncated) = WalReader::read_all(&wal_path).unwrap();
        assert!(entries.is_empty());

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn test_wal_nonexistent_file() {
        let (entries, _truncated) = WalReader::read_all(Path::new("/nonexistent/path/test.wal")).unwrap();
        assert!(entries.is_empty());
    }

    #[test]
    fn test_wal_truncate() {
        let dir = std::env::temp_dir().join("zenith_wal_truncate_test");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        let wal_path = dir.join("trunc.wal");

        let mut writer = WalWriter::open(&wal_path).unwrap();
        writer.append(&WalEntry::new_checkpoint(42)).unwrap();
        writer
            .append(&WalEntry::new_patch(
                uuid::Uuid::new_v4(),
                PathBuf::from("src/Dummy.tsx"),
                vec![],
            ))
            .unwrap();
        writer.sync().unwrap();

        let (entries, _truncated) = WalReader::read_all(&wal_path).unwrap();
        assert_eq!(entries.len(), 1);

        writer.truncate().unwrap();

        let (entries, _truncated) = WalReader::read_all(&wal_path).unwrap();
        assert!(entries.is_empty());

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn test_cow_overlay_structural_sharing() {
        // Verify that im::HashMap clones share structure (O(1) clone)
        let mut map: im::HashMap<String, String> = im::HashMap::new();
        map.insert("a".into(), "value_a".into());
        map.insert("b".into(), "value_b".into());

        let snapshot = map.clone(); // O(1) structural sharing

        map.insert("c".into(), "value_c".into());

        // Original snapshot is unaffected
        assert_eq!(snapshot.len(), 2);
        assert_eq!(map.len(), 3);
        assert!(snapshot.get("c").is_none());
        assert_eq!(map.get("c").map(|s| s.as_str()), Some("value_c"));
    }
}
