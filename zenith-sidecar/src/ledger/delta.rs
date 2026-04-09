//! # Delta Context Generator
//!
//! Generates minimal AI context from the Change Ledger.
//! Instead of sending full files (~2000 tokens each), we send only the
//! delta (~50-200 tokens). This achieves ~97% token cost reduction.

use std::collections::HashSet;
use std::path::PathBuf;

use serde::Serialize;

use super::{ChangeLedger, LedgerChange, LedgerEntry};

/// The minimal context sent to the AI Agent.
#[derive(Debug, Clone, Serialize)]
pub struct DeltaContext {
    /// Human-readable summary of what changed.
    pub summary: String,
    /// Affected AST node identifiers (zenith-ids).
    pub affected_nodes: Vec<String>,
    /// Affected files.
    pub affected_files: Vec<PathBuf>,
    /// The structured changes (for the agent to parse).
    pub changes: Vec<DeltaChange>,
    /// Total number of changes summarized.
    pub change_count: usize,
}

/// A simplified change record for the AI.
#[derive(Debug, Clone, Serialize)]
pub struct DeltaChange {
    pub zenith_id: String,
    pub change_type: String,
    pub description: String,
}

impl ChangeLedger {
    /// Generate a delta context for an AI agent invocation.
    ///
    /// - `since`: Only include changes after this ledger entry ID.
    /// - `scope`: Only include changes to these files.
    pub fn generate_delta_context(
        &self,
        since: u64,
        scope: &[PathBuf],
    ) -> DeltaContext {
        let entries = self.since(since);

        // Filter to only changes within scope
        let relevant: Vec<&LedgerEntry> = entries
            .iter()
            .filter(|e| {
                if scope.is_empty() {
                    return true; // No scope filter
                }
                match &e.change {
                    LedgerChange::PropertyPatch { zenith_id, .. }
                    | LedgerChange::ClassSwap { zenith_id, .. }
                    | LedgerChange::NodeMove { zenith_id, .. }
                    | LedgerChange::NodeToggleVisibility { zenith_id, .. } => {
                        scope.iter().any(|f| {
                            zenith_id.starts_with(&f.display().to_string())
                        })
                    }
                    LedgerChange::CssModulePatch { file, .. } => {
                        scope.contains(file)
                    }
                    _ => false,
                }
            })
            .collect();
        
        // v3.8: Prioritize recency by reversing the chronological order
        let mut relevant = relevant;
        relevant.reverse();

        let mut affected_nodes = HashSet::new();
        let mut affected_files = HashSet::new();
        let mut changes = Vec::new();
        let mut summary_parts = Vec::new();

        for entry in &relevant {
            match &entry.change {
                LedgerChange::PropertyPatch {
                    zenith_id,
                    property,
                    old_value,
                    new_value,
                } => {
                    affected_nodes.insert(zenith_id.clone());
                    if let Some(file) = zenith_id.split(':').next() {
                        affected_files.insert(PathBuf::from(file));
                    }
                    summary_parts.push(format!(
                        "{property} on {zenith_id}: {old_value} → {new_value}"
                    ));
                    changes.push(DeltaChange {
                        zenith_id: zenith_id.clone(),
                        change_type: "property_patch".into(),
                        description: format!("{property}: {old_value} → {new_value}"),
                    });
                }
                LedgerChange::ClassSwap {
                    zenith_id,
                    old_class,
                    new_class,
                } => {
                    affected_nodes.insert(zenith_id.clone());
                    if let Some(file) = zenith_id.split(':').next() {
                        affected_files.insert(PathBuf::from(file));
                    }
                    summary_parts.push(format!(
                        "class on {zenith_id}: {old_class} → {new_class}"
                    ));
                    changes.push(DeltaChange {
                        zenith_id: zenith_id.clone(),
                        change_type: "class_swap".into(),
                        description: format!("{old_class} → {new_class}"),
                    });
                }
                LedgerChange::NodeMove {
                    zenith_id,
                    old_index,
                    new_index,
                } => {
                    affected_nodes.insert(zenith_id.clone());
                    summary_parts.push(format!(
                        "moved {zenith_id}: index {old_index} → {new_index}"
                    ));
                    changes.push(DeltaChange {
                        zenith_id: zenith_id.clone(),
                        change_type: "node_move".into(),
                        description: format!("index {old_index} → {new_index}"),
                    });
                }
                LedgerChange::CssModulePatch {
                    file,
                    selector,
                    property,
                    old_value,
                    new_value,
                } => {
                    affected_files.insert(file.clone());
                    summary_parts.push(format!(
                        "{property} in {selector} ({file:?}): {old_value} → {new_value}"
                    ));
                    changes.push(DeltaChange {
                        zenith_id: format!("{}:{}", file.display(), selector),
                        change_type: "css_module_patch".into(),
                        description: format!("{property}: {old_value} → {new_value}"),
                    });
                }
                _ => {}
            }
        }

        let summary = if summary_parts.is_empty() {
            "No changes since last sync.".to_string()
        } else {
            summary_parts.join("; ")
        };

        DeltaContext {
            summary,
            affected_nodes: affected_nodes.into_iter().collect(),
            affected_files: affected_files.into_iter().collect(),
            changes,
            change_count: relevant.len(),
        }
    }
}
