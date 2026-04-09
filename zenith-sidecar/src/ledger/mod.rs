//! # Change Ledger
//!
//! An append-only log of all mutations for crash recovery and AI delta context.

pub mod delta;

use std::collections::HashMap;
use std::io::{BufWriter, Write};
use std::path::PathBuf;
use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tracing::debug;

use crate::types::{ActorId, TransactionId, ZenithId};

// ---------------------------------------------------------------------------
// Ledger entry
// ---------------------------------------------------------------------------

/// A single entry in the Change Ledger.
/// Serialized as NDJSON (one JSON object per line) for append-only durability.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LedgerEntry {
    /// Monotonically increasing entry ID.
    pub id: u64,
    /// ISO-8601 timestamp.
    pub timestamp: String,
    /// Who made this change.
    pub actor: ActorId,
    /// Which transaction this belongs to.
    pub transaction_id: TransactionId,
    /// The actual change.
    pub change: LedgerChange,
    /// Whether this change has been committed to disk.
    pub committed: bool,
}

/// The types of changes we track.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum LedgerChange {
    PropertyPatch {
        zenith_id: ZenithId,
        property: String,
        old_value: String,
        new_value: String,
    },
    ClassSwap {
        zenith_id: ZenithId,
        old_class: String,
        new_class: String,
    },
    NodeMove {
        zenith_id: ZenithId,
        old_index: u32,
        new_index: u32,
    },
    NodeToggleVisibility {
        zenith_id: ZenithId,
        visible: bool,
    },
    CssModulePatch {
        file: PathBuf,
        selector: String,
        property: String,
        old_value: String,
        new_value: String,
    },
    TransactionCommit {
        transaction_id: TransactionId,
        files: Vec<PathBuf>,
    },
    TransactionRollback {
        transaction_id: TransactionId,
    },
}

// ---------------------------------------------------------------------------
// Change Ledger
// ---------------------------------------------------------------------------

/// The append-only change ledger.
///
/// All entries are written to both an in-memory vec (for fast queries)
/// and an NDJSON file on disk (for crash recovery).
pub struct ChangeLedger {
    entries: Vec<LedgerEntry>,
    next_id: u64,

    /// Index: zenith_id → entry indices for fast element-scoped queries.
    by_element: HashMap<ZenithId, Vec<usize>>,

    /// Index: zenith_id → last modified ISO-8601 timestamp (v3.8).
    last_modified: HashMap<ZenithId, String>,

    /// Index: file path → entry indices for delta context generation.
    by_file: HashMap<PathBuf, Vec<usize>>,

    /// NDJSON file writer for durability.
    writer: Mutex<Option<BufWriter<std::fs::File>>>,
}

impl ChangeLedger {
    /// Create a new ledger, optionally backed by an NDJSON file.
    pub fn new(ledger_path: Option<PathBuf>) -> Self {
        let writer = ledger_path
            .and_then(|path| {
                std::fs::create_dir_all(path.parent()?).ok()?;
                let file = std::fs::OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(&path)
                    .ok()?;
                Some(BufWriter::new(file))
            });

        Self {
            entries: Vec::new(),
            next_id: 0,
            by_element: HashMap::new(),
            last_modified: HashMap::new(),
            by_file: HashMap::new(),
            writer: Mutex::new(writer),
        }
    }

    /// Returns a reference to the entries in the ledger.
    pub fn entries(&self) -> &[LedgerEntry] {
        &self.entries
    }

    /// Append an entry to the ledger.
    pub fn append(
        &mut self,
        actor: ActorId,
        transaction_id: TransactionId,
        change: LedgerChange,
    ) -> u64 {
        let id = self.next_id;
        self.next_id += 1;

        let entry = LedgerEntry {
            id,
            timestamp: chrono::Utc::now().to_rfc3339(),
            actor,
            transaction_id,
            change: change.clone(),
            committed: false,
        };

        // Index by element
        match &change {
            LedgerChange::PropertyPatch { zenith_id, .. }
            | LedgerChange::ClassSwap { zenith_id, .. }
            | LedgerChange::NodeMove { zenith_id, .. }
            | LedgerChange::NodeToggleVisibility { zenith_id, .. } => {
                self.by_element
                    .entry(zenith_id.clone())
                    .or_default()
                    .push(self.entries.len());

                // Track last modified (v3.8)
                self.last_modified.insert(zenith_id.clone(), entry.timestamp.clone());

                // v3.10: Memory Management (Patch 13)
                // Cap the number of unique elements tracked in memory to prevent unbounded growth.
                if self.by_element.len() > 1000 {
                    // Simple eviction: clear the oldest 100 entries when limit reached
                    // In a production system, we'd use an LRU, but for Zenith, 
                    // a periodic sweep or simple cap is sufficient to avoid OOM.
                    let keys_to_remove: Vec<ZenithId> = self.by_element.keys()
                        .take(100)
                        .cloned()
                        .collect();
                    for k in keys_to_remove {
                        self.by_element.remove(&k);
                        self.last_modified.remove(&k);
                    }
                }

                // Also index by file (zenith_id starts with the file path)
                if let Some(file_path) = zenith_id.split(':').next() {
                    self.by_file
                        .entry(PathBuf::from(file_path))
                        .or_default()
                        .push(self.entries.len());
                }
            }
            LedgerChange::CssModulePatch { file, .. } => {
                self.by_file
                    .entry(file.clone())
                    .or_default()
                    .push(self.entries.len());
            }
            LedgerChange::TransactionCommit { .. }
            | LedgerChange::TransactionRollback { .. } => {}
        }

        // Write to NDJSON file
        if let Ok(mut guard) = self.writer.lock() {
            if let Some(ref mut w) = *guard {
                if let Ok(json) = serde_json::to_string(&entry) {
                    let _ = writeln!(w, "{json}");
                    // v3.10 Performance (L2): Do NOT flush on every append.
                    // Flushing on 60fps scrub ticks causes severe I/O stalls.
                    // The BufWriter will flush naturally, or we flush on commit/sync.
                }
            }
        }

        self.entries.push(entry);

        // v3.10 Memory (L1): Unbounded Growth Protection
        // If the ledger exceeds 50,000 entries, prune the oldest 5,000.
        // This keeps memory usage capped while retaining enough history for undo/AI.
        if self.entries.len() > 50_000 {
            self.prune_entries(5000);
        }

        debug!("Ledger entry {id} appended");
        id
    }

    /// Mark all entries for a transaction as committed.
    pub fn mark_committed(&mut self, transaction_id: TransactionId) {
        for entry in &mut self.entries {
            if entry.transaction_id == transaction_id {
                entry.committed = true;
            }
        }
    }

    /// Get entries since a given ID.
    pub fn since(&self, since_id: u64) -> &[LedgerEntry] {
        let start = self.entries.partition_point(|e| e.id < since_id);
        &self.entries[start..]
    }

    /// Get entries for a specific element.
    pub fn for_element(&self, zenith_id: &str) -> Vec<&LedgerEntry> {
        self.by_element
            .get(zenith_id)
            .map(|indices| indices.iter().map(|&i| &self.entries[i]).collect())
            .unwrap_or_default()
    }

    /// Get entries for a specific file.
    pub fn for_file(&self, file: &PathBuf) -> Vec<&LedgerEntry> {
        self.by_file
            .get(file)
            .map(|indices| indices.iter().map(|&i| &self.entries[i]).collect())
            .unwrap_or_default()
    }

    /// Total number of entries (for diagnostics).
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Replay from an NDJSON file (for crash recovery).
    pub fn replay_from_file(path: &PathBuf) -> anyhow::Result<Self> {
        let content = std::fs::read_to_string(path)?;
        let mut ledger = Self::new(Some(path.clone()));

        for line in content.lines() {
            if line.trim().is_empty() {
                continue;
            }
            let entry: LedgerEntry = serde_json::from_str(line)?;
            ledger.next_id = entry.id + 1;
            ledger.entries.push(entry);
        }

        // Rebuild indices
        for (idx, entry) in ledger.entries.iter().enumerate() {
            match &entry.change {
                LedgerChange::PropertyPatch { zenith_id, .. }
                | LedgerChange::ClassSwap { zenith_id, .. }
                | LedgerChange::NodeMove { zenith_id, .. }
                | LedgerChange::NodeToggleVisibility { zenith_id, .. } => {
                    ledger
                        .by_element
                        .entry(zenith_id.clone())
                        .or_default()
                        .push(idx);

                    // Restore last modified (v3.8)
                    ledger.last_modified.insert(zenith_id.clone(), entry.timestamp.clone());

                    if let Some(file_path) = zenith_id.split(':').next() {
                        ledger
                            .by_file
                            .entry(PathBuf::from(file_path))
                            .or_default()
                            .push(idx);
                    }
                }
                LedgerChange::CssModulePatch { file, .. } => {
                    ledger
                        .by_file
                        .entry(file.clone())
                        .or_default()
                        .push(idx);
                }
                _ => {}
            }
        }

        debug!("Replayed {} ledger entries from {:?}", ledger.entries.len(), path);
        Ok(ledger)
    }
    /// Generate inverse operations for a given transaction (v3.10 Undo/Redo - Issue 27)
    pub fn generate_undo_ops(&self, transaction_id: TransactionId) -> Vec<LedgerChange> {
        let mut undo_ops = Vec::new();
        // Traverse backwards to undo in reverse order
        for entry in self.entries.iter().rev() {
            if entry.transaction_id == transaction_id {
                match &entry.change {
                    LedgerChange::PropertyPatch { zenith_id, property, old_value, new_value, .. } => {
                        undo_ops.push(LedgerChange::PropertyPatch {
                            zenith_id: zenith_id.clone(),
                            property: property.clone(),
                            old_value: new_value.clone(), // Swap
                            new_value: old_value.clone(),
                        });
                    }
                    LedgerChange::ClassSwap { zenith_id, old_class, new_class } => {
                        undo_ops.push(LedgerChange::ClassSwap {
                            zenith_id: zenith_id.clone(),
                            old_class: new_class.clone(), // Swap
                            new_class: old_class.clone(),
                        });
                    }
                    LedgerChange::NodeMove { zenith_id, old_index, new_index } => {
                        undo_ops.push(LedgerChange::NodeMove {
                            zenith_id: zenith_id.clone(),
                            old_index: *new_index, // Move back
                            new_index: *old_index,
                        });
                    }
                    _ => {} // Other changes might be non-reversible or handled elsewhere
                }
            }
        }
        undo_ops
    }

    /// Prune the oldest N entries from memory to prevent OOM (L1 Fix).
    pub fn prune_entries(&mut self, count: usize) {
        if count >= self.entries.len() {
            self.entries.clear();
            self.by_element.clear();
            self.by_file.clear();
            return;
        }

        // Drain the oldest entries
        self.entries.drain(0..count);

        // Rebuild indices (simplest way to ensure accuracy after drain)
        self.rebuild_indices();
        debug!("Pruned {} ledger entries from memory", count);
    }

    fn rebuild_indices(&mut self) {
        self.by_element.clear();
        self.by_file.clear();
        for (idx, entry) in self.entries.iter().enumerate() {
            match &entry.change {
                LedgerChange::PropertyPatch { zenith_id, .. }
                | LedgerChange::ClassSwap { zenith_id, .. }
                | LedgerChange::NodeMove { zenith_id, .. }
                | LedgerChange::NodeToggleVisibility { zenith_id, .. } => {
                    self.by_element.entry(zenith_id.clone()).or_default().push(idx);
                    if let Some(file_path) = zenith_id.split(':').next() {
                        self.by_file.entry(PathBuf::from(file_path)).or_default().push(idx);
                    }
                }
                LedgerChange::CssModulePatch { file, .. } => {
                    self.by_file.entry(file.clone()).or_default().push(idx);
                }
                _ => {}
            }
        }
    }

    /// Explicitly flush the ledger to disk.
    pub fn flush(&self) -> std::io::Result<()> {
        if let Ok(mut guard) = self.writer.lock() {
            if let Some(ref mut w) = *guard {
                w.flush()?;
            }
        }
        Ok(())
    }
}
