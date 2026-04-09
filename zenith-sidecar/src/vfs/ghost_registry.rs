// ---------------------------------------------------------------------------
// Ghost Registry — Manifest Support for Surgical Visual Editing
// ---------------------------------------------------------------------------

use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use tracing::{debug, info};
use sha2::{Sha256, Digest};

use crate::types::ZenithId;

pub fn normalize_path(path: &str) -> String {
    path.replace('\\', "/").trim_start_matches('/').to_string()
}

/// v3.7 Base62 Encoder — Maps 72 bits (9 bytes) to 12 base62 characters.
pub fn encode_base62(bytes: &[u8]) -> String {
    const CHARS: &[u8] = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    // M2 Fix: Removed the dead first-pass computation that was calculating and discarding
    // a result before the real computation. Only one pass is needed.
    let mut v = 0u128;
    for &b in bytes {
        v = (v << 8) | (b as u128);
    }

    let mut res = String::new();
    while v > 0 {
        let rem = (v % 62) as usize;
        res.insert(0, CHARS[rem] as char);
        v /= 62;
    }

    while res.len() < 12 {
        res.insert(0, '0');
    }

    res.split_at(res.len().saturating_sub(12)).1.to_string()
}

/// v3.7 Ghost-ID Generation (Collision-Safe)
/// SHA-256 (File:Line:Col) -> 72-bit prefix -> Base62
pub fn generate_ghost_id(file: &str, line: u32, col: u32) -> ZenithId {
    let mut hasher = Sha256::new();
    hasher.update(file.as_bytes());
    hasher.update(b":");
    hasher.update(line.to_string().as_bytes());
    hasher.update(b":");
    hasher.update(col.to_string().as_bytes());
    let digest = hasher.finalize();
    encode_base62(&digest[..9])
}

/// A single entry in the ghost-id manifest.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GhostEntry {
    /// The unique ghost ID (e.g., "src/App.tsx:14:6").
    pub id: ZenithId,
    /// The JSX element tag name.
    #[serde(rename = "tagName")]
    pub tag_name: String,
    /// Relative file path.
    pub file: String,
    /// 1-indexed line number.
    pub line: u32,
    /// 0-indexed column.
    pub column: u32,
    /// Whether this element is within a dynamic logic zone.
    #[serde(rename = "isLogicLocked", default)]
    pub is_logic_locked: bool,
}

/// The Ghost Registry loads and watches the `.zenith/manifest.json`.
#[derive(Debug, Default)]
pub struct GhostRegistry {
    /// Map of GhostId → GhostEntry
    entries: HashMap<ZenithId, GhostEntry>,
}

impl GhostRegistry {
    pub fn new() -> Self {
        Self {
            entries: HashMap::new(),
        }
    }

    /// Load the manifest and the incremental index (v3.10)
    pub fn load_from_root<P: AsRef<Path>>(&mut self, root: P, custom_index: Option<PathBuf>) -> anyhow::Result<()> {
        let root_ref = root.as_ref();
        let zenith_dir = root_ref.join(".zenith");
        let manifest_path = zenith_dir.join("manifest.json");

        if !manifest_path.exists() {
            debug!("No manifest found at {}", manifest_path.display());
            return Ok(());
        }

        // Try to load from incremental index first for speed
        if let Ok(index) = GhostIndex::load(&zenith_dir, custom_index) {
            for (_, entry) in index.files {
                for g in entry.entries {
                    self.entries.insert(g.id.clone(), g);
                }
            }
            info!("Ghost registry loaded incrementally: {} entries", self.entries.len());
        } else {
            // Fallback to full manifest parse
            let content = fs::read_to_string(&manifest_path)?;
            let data: HashMap<ZenithId, GhostEntry> = serde_json::from_str(&content)?;
            self.validate_and_set_entries(data)?;
        }

        Ok(())
    }

    /// Internal helper to validate entries for collisions before setting them.
    pub fn validate_and_set_entries(&mut self, mut data: HashMap<ZenithId, GhostEntry>) -> anyhow::Result<()> {
        let mut reverse_map: HashMap<(String, u32, u32), ZenithId> = HashMap::new();
        for (id, entry) in data.iter_mut() {
            entry.file = normalize_path(&entry.file);
            let key = (entry.file.clone(), entry.line, entry.column);
            if let Some(existing_id) = reverse_map.get(&key) {
                if existing_id != id {
                    anyhow::bail!("Ghost-ID Collision Detected: both {} and {} map to {:?} (File: {:?}, Line: {}, Col: {})", 
                        existing_id, id, key, entry.file, entry.line, entry.column);
                }
            }
            reverse_map.insert(key, id.clone());
        }

        self.entries = data;
        info!("[SIDECAR] Manifest received — total {} entries (Validated)", self.entries.len());
        Ok(())
    }

    /// Look up an entry by its Ghost ID.
    pub fn lookup(&self, id: &ZenithId) -> Option<&GhostEntry> {
        let result = self.entries.get(id);
        info!("[SIDECAR] element.select — ghost_id={}, resolved={:?}", id, result.is_some());
        result
    }

    /// Register or update entries in the registry (v3.10 RPC support).
    /// v3.10 Infrastructure Hardening: Clear all entries for a specific file.
    /// This prevents registry drift when files are deleted or refactored.
    pub fn clear_for_file(&mut self, file_path: &str) {
        let norm_path = normalize_path(file_path);
        self.entries.retain(|_, v| {
            let entry_path = normalize_path(&v.file);
            if cfg!(windows) {
                entry_path.to_lowercase() != norm_path.to_lowercase()
            } else {
                entry_path != norm_path
            }
        });
        debug!("Cleared registry entries for file: {}", norm_path);
    }

    /// Register multiple entries at once, ensuring forward-slash normalization.
    pub fn register_entries(&mut self, entries: Vec<GhostEntry>) {
        for mut entry in entries {
            entry.file = normalize_path(&entry.file);
            debug!("Registering Ghost ID: {} (File: {})", entry.id, entry.file);
            self.entries.insert(entry.id.clone(), entry);
        }
        info!("[SIDECAR] Manifest received (incremental RPC) — total {} entries", self.entries.len());
    }

    /// Get all registered entries.
    pub fn entries(&self) -> &HashMap<ZenithId, GhostEntry> {
        &self.entries
    }

    /// Unregister ghost entries (e.g. from a file deleted event).
    pub fn remove_entries(&mut self, ids: &[ZenithId]) {
        for id in ids {
            self.entries.remove(id);
        }
    }


    /// Clear the registry.
    pub fn clear(&mut self) {
        self.entries.clear();
    }
}

// ---------------------------------------------------------------------------
// Ghost Index — Incremental Loading (v2.6)
// ---------------------------------------------------------------------------

/// Persistent Ghost-ID Index for incremental loading.
///
/// Stores `mtime` alongside each file's ghost entries. On startup, only
/// files whose `mtime` has changed since the last index are re-scanned.
/// This drops startup from ~750ms (full scan) to ~15ms (incremental).
///
/// Serialized as MessagePack to `.zenith/ghost_index.msgpack`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GhostIndex {
    /// File path → (mtime_ms, ghost entries)
    pub files: HashMap<String, GhostIndexEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GhostIndexEntry {
    /// File modification time (milliseconds since UNIX epoch).
    pub mtime_ms: u64,
    /// Content-aware hash (Issue 9).
    pub content_hash: u64,
    /// Ghost entries for this file.
    pub entries: Vec<GhostEntry>,
}

impl GhostIndex {
    pub fn new() -> Self {
        Self {
            files: HashMap::new(),
        }
    }

    /// Load the index from disk (MessagePack).
    /// M5 Fix: Returns Err when the file doesn't exist (previously returned Ok(empty)),
    /// which caused load_from_root to skip the manifest fallback on first run.
    pub fn load(zenith_dir: &Path, custom_path: Option<PathBuf>) -> anyhow::Result<Self> {
        let index_path = custom_path.unwrap_or_else(|| zenith_dir.join("ghost_index.msgpack"));
        if !index_path.exists() {
            return Err(anyhow::anyhow!("Ghost index not found at {} — will use manifest fallback", index_path.display()));
        }

        let data = fs::read(&index_path)?;
        let index: GhostIndex = rmp_serde::from_slice(&data)
            .map_err(|e| anyhow::anyhow!("Failed to deserialize ghost index: {}", e))?;

        info!("Loaded ghost index: {} files tracked", index.files.len());
        Ok(index)
    }

    /// Save the index to disk (MessagePack).
    pub fn save(&self, zenith_dir: &Path, custom_path: Option<PathBuf>) -> anyhow::Result<()> {
        let index_path = custom_path.unwrap_or_else(|| zenith_dir.join("ghost_index.msgpack"));
        if let Some(parent) = index_path.parent() {
            fs::create_dir_all(parent)?;
        }

        let data = rmp_serde::to_vec(self)
            .map_err(|e| anyhow::anyhow!("Failed to serialize ghost index: {}", e))?;
        fs::write(&index_path, &data)?;

        info!("Saved ghost index: {} files tracked", self.files.len());
        Ok(())
    }

    /// Check if a file needs re-scanning based on its mtime or content hash.
    ///
    /// Returns `true` if the file is new or modified.
    pub fn needs_rescan(&self, file: &str, current_mtime_ms: u64, current_hash: u64) -> bool {
        match self.files.get(file) {
            Some(entry) => entry.mtime_ms != current_mtime_ms || entry.content_hash != current_hash,
            None => true, // New file
        }
    }

    /// Update the index for a file.
    pub fn update_file(&mut self, file: String, mtime_ms: u64, hash: u64, entries: Vec<GhostEntry>) {
        self.files.insert(file, GhostIndexEntry { mtime_ms, content_hash: hash, entries });
    }

    /// Get the cached entries for a file (if mtime and hash match).
    pub fn get_cached(&self, file: &str, current_mtime_ms: u64, current_hash: u64) -> Option<&[GhostEntry]> {
        self.files.get(file).and_then(|entry| {
            if entry.mtime_ms == current_mtime_ms && entry.content_hash == current_hash {
                Some(entry.entries.as_slice())
            } else {
                None
            }
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    use std::io::Write;

    #[test]
    fn test_load_manifest() {
        let dir = tempdir().unwrap();
        let zenith_dir = dir.path().join(".zenith");
        fs::create_dir(&zenith_dir).unwrap();

        let manifest_path = zenith_dir.join("manifest.json");
        let mut file = fs::File::create(manifest_path).unwrap();

        let json = r#"{
            "src/App.tsx:10:5": {
                "id": "src/App.tsx:10:5",
                "tagName": "div",
                "file": "src/App.tsx",
                "line": 10,
                "column": 5
            }
        }"#;
        file.write_all(json.as_bytes()).unwrap();

        let mut registry = GhostRegistry::new();
        registry.load_from_root(dir.path()).unwrap();

        let entry = registry.lookup(&"src/App.tsx:10:5".to_string()).unwrap();
        assert_eq!(entry.tag_name, "div");
        assert_eq!(entry.line, 10);
    }
}
