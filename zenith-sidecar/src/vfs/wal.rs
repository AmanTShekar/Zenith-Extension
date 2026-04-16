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
use std::io::{self, BufReader, BufWriter, Read, Write, Seek, SeekFrom};
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
        timestamp: u64,
    },
    /// A checkpoint — entries before this can be safely ignored on replay.
    Checkpoint {
        timestamp: u64,
    },
}

impl WalEntry {
    pub fn new_patch(tx_id: crate::types::TransactionId, file: PathBuf, edits: Vec<TextEdit>) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        Self::Patch {
            tx_id,
            file,
            edits,
            timestamp,
        }
    }
}

// ---------------------------------------------------------------------------
// WAL Writer
// ---------------------------------------------------------------------------

pub struct WalWriter {
    path: PathBuf,
    file: Option<BufWriter<File>>,
    entries_since_sync: usize,
}

impl WalWriter {
    /// Open or create the WAL file.
    pub fn open(path: &Path) -> io::Result<Self> {
        let file = OpenOptions::new()
            .create(true)
            .write(true)
            .append(true)
            .open(path)?;
        
        Ok(Self {
            path: path.to_path_buf(),
            file: Some(BufWriter::new(file)),
            entries_since_sync: 0,
        })
    }

    /// Append a new entry to the WAL.
    pub fn append(&mut self, entry: &WalEntry) -> io::Result<()> {
        let writer = self.file.as_mut().ok_or_else(|| {
            io::Error::new(io::ErrorKind::Other, "WAL file not open")
        })?;

        // Format as JSON line for simplicity and crash-resilience
        let serialized = serde_json::to_vec(entry)
            .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;
        writer.write_all(&serialized)?;
        writer.write_all(b"\n")?;

        self.entries_since_sync += 1;
        
        // v3.14: We rely on explicit sync_all() from the higher level commit()
        // for performance, but we still flush to OS buffers here.
        writer.flush()?;
        
        Ok(())
    }

    /// Guarantee durability to disk (fdatasync).
    pub fn sync_all(&mut self) -> io::Result<()> {
        if let Some(ref mut writer) = self.file {
            writer.flush()?;
            writer.get_ref().sync_all()?;
            self.entries_since_sync = 0;
            debug!("WAL synced to disk: {}", self.path.display());
        }
        Ok(())
    }

    /// Truncate the WAL (after a successful snapshot checkpoint).
    /// v3.14: Uses in-place truncation for 100% Windows stability (v11.7.6 Hardening).
    pub fn truncate(&mut self) -> io::Result<()> {
        let mut file = if let Some(writer) = self.file.take() {
            // 1. Flush and recover the raw file handle
            match writer.into_inner() {
                Ok(f) => f,
                Err(e) => {
                    // Restoration logic: If flushing failed, we MUST put the handle back
                    // so the WAL doesn't stay closed forever.
                    self.file = Some(e.into_inner());
                    return Err(io::Error::new(io::ErrorKind::Other, "Failed to flush WAL during truncation"));
                }
            }
        } else {
            return Err(io::Error::new(io::ErrorKind::Other, "WAL file not open"));
        };

        // 2. In-place truncation with Retry Loop (Windows Lock Resilience)
        let mut attempts = 0;
        let mut success = false;
        while attempts < 5 && !success {
            match file.set_len(0) {
                Ok(_) => {
                    if let Err(e) = file.seek(std::io::SeekFrom::Start(0)) {
                        self.file = Some(BufWriter::new(file));
                        return Err(e);
                    }
                    success = true;
                }
                Err(e) if e.kind() == std::io::ErrorKind::PermissionDenied || e.raw_os_error() == Some(5) => {
                    attempts += 1;
                    warn!("  ⚠️ WAL truncation blocked by Windows file-lock. Retrying in 100ms... (Attempt {})", attempts);
                    std::thread::sleep(std::time::Duration::from_millis(100));
                }
                Err(e) => {
                    self.file = Some(BufWriter::new(file));
                    return Err(e);
                }
            }
        }

        // 3. Re-initialize the Buffered writer regardless of truncation success
        // if truncation failed after all retries, we still have a working file handle
        // and can continue staging in-memory and logging to the tail of the wal.
        if success {
            self.file = Some(BufWriter::new(file));
            self.entries_since_sync = 0;
            info!("WAL truncated in-place (v11.7.6 Windows hardening)");
            Ok(())
        } else {
            warn!("  ⚠️ WAL truncation failed after 5 attempts. Attempting Fresh Start strategy...");

            // 4. Fresh Start Strategy: Close current handle, rename-move the bloat, and create new
            drop(file); // Release handle explicitly
            self.file = None;

            let timestamp = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs();
            let bloat_path = self.path.with_extension(format!("bloat-{}", timestamp));

            if let Err(e) = std::fs::rename(&self.path, &bloat_path) {
                warn!("  ❌ Fresh Start failed: Could not rename locked WAL: {}", e);
                // Last ditch: Re-open the original file so we can at least continue logging
                let file = OpenOptions::new().write(true).append(true).open(&self.path)?;
                self.file = Some(BufWriter::new(file));
                Ok(())
            } else {
                info!("  ✅ Fresh Start success: Moved bloated WAL to {}. Starting fresh.", bloat_path.display());
                let file = OpenOptions::new().create(true).write(true).append(true).open(&self.path)?;
                self.file = Some(BufWriter::new(file));
                Ok(())
            }
        }
    }
}

// ---------------------------------------------------------------------------
// WAL Reader
// ---------------------------------------------------------------------------

pub struct WalReader;

impl WalReader {
    /// Read all entries from the WAL, handling partial writes.
    pub fn read_all(path: &Path) -> io::Result<(Vec<WalEntry>, bool)> {
        let file = File::open(path)?;
        let reader = BufReader::new(file);
        let mut entries = Vec::new();
        let mut had_truncation = false;

        use std::io::BufRead;
        for line in reader.lines() {
            let line = match line {
                Ok(l) => l,
                Err(_) => {
                    had_truncation = true;
                    break;
                }
            };
            
            if let Ok(entry) = serde_json::from_str(&line) {
                entries.push(entry);
            } else {
                had_truncation = true;
                break;
            }
        }

        Ok((entries, had_truncation))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_wal_roundtrip() -> io::Result<()> {
        let dir = tempdir()?;
        let wal_path = dir.path().join("test.wal");
        
        let mut writer = WalWriter::open(&wal_path)?;
        let entry = WalEntry::new_patch(
            "tx1".into(),
            "test.js".into(),
            vec![TextEdit { range: 0..0, new_text: "hello".into() }]
        );
        writer.append(&entry)?;
        writer.sync_all()?;

        let (entries, truncated) = WalReader::read_all(&wal_path)?;
        assert_eq!(entries.len(), 1);
        assert!(!truncated);
        
        Ok(())
    }

    #[test]
    fn test_wal_truncate() -> io::Result<()> {
        let dir = tempdir()?;
        let wal_path = dir.path().join("test.wal");
        
        let mut writer = WalWriter::open(&wal_path)?;
        writer.append(&WalEntry::Checkpoint { timestamp: 0 })?;
        writer.truncate()?;

        let (entries, _) = WalReader::read_all(&wal_path)?;
        assert_eq!(entries.len(), 0);
        
        Ok(())
    }
}
