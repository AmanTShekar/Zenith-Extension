//! # OtEngine — Intent-Aware Operational Transform (v2.6 12-Rule Matrix)
//!
//! Implements two layers of structural conflict resolution:
//!
//! 1. **Layer Reordering** (v2.0): Photoshop-style layer reordering on the JSX AST
//!    with a two-pass Extract-then-Insert algorithm that guarantees zero node loss.
//!
//! 2. **Intent-Aware OT** (v2.6): 12-Rule transform matrix for resolving concurrent
//!    Human vs AI structural mutations.
//!
//! ## v2.6 12-Rule Transform Matrix
//!
//! When a conflict is detected (two intents touch overlapping subtrees), the
//! `transform()` function applies one of 12 rules:
//!
//! | # | Human Intent | AI Intent | Resolution |
//! |---|---|---|---|
//! | 1 | Reorder | ExtractComponent | Rebase reorder inside new component |
//! | 2 | DeleteNode | Reparent | Escalate to human review |
//! | 3 | PropertyChange | PropertyChange | LWW (no OT needed) |
//! | 4 | InsertNode | InsertNode | Order by actor priority |
//! | 5 | DeleteNode | DeleteNode | Deduplicate (no-op) |
//! | 6 | Reorder | Reorder | Compose permutations |
//! | 7 | Reparent | Reparent | Escalate (ambiguous target) |
//! | 8 | ExtractComponent | ExtractComponent | Escalate (overlapping boundaries) |
//! | 9 | InsertNode | ExtractComponent | Rebase insert inside new component |
//! | 10 | DeleteNode | ExtractComponent | Remove from extraction set |
//! | 11 | InlineComponent | * | Escalate (destructive) |
//! | 12 | * | * (non-overlapping) | NoConflict |

use std::collections::{HashSet, HashMap};

use serde::{Deserialize, Serialize};
use tracing::{debug, warn};

use crate::types::ZenithId;

// ---------------------------------------------------------------------------
// Layer node (simplified JSX tree for reordering)
// ---------------------------------------------------------------------------

/// A node in the layer tree. This is a lightweight projection of the JSX AST
/// for reordering purposes.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayerNode {
    /// Ghost-ID for this element.
    pub zenith_id: ZenithId,
    /// Display name for the Layer Tree UI (e.g., "<Button>", "<div>").
    pub display_name: String,
    /// Child nodes in source-order.
    pub children: Vec<LayerNode>,
    /// Whether this node has a soft-lock (.map(), ternary, etc.).
    pub soft_locked: bool,
}

impl LayerNode {
    /// Collect all ZenithIds in this subtree (for integrity checking).
    pub fn collect_ids(&self, out: &mut HashSet<ZenithId>) {
        out.insert(self.zenith_id.clone());
        for child in &self.children {
            child.collect_ids(out);
        }
    }

    /// Count all nodes in this subtree.
    pub fn count(&self) -> usize {
        1 + self.children.iter().map(|c| c.count()).sum::<usize>()
    }
}

// ---------------------------------------------------------------------------
// Reorder / Reparent operations (v2.0)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReorderOp {
    pub node_id: ZenithId,
    pub parent_id: ZenithId,
    pub target_index: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReparentOp {
    pub node_id: ZenithId,
    pub old_parent_id: ZenithId,
    pub new_parent_id: ZenithId,
    pub target_index: usize,
}

// ---------------------------------------------------------------------------
// Operation result (v2.0)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub enum OtResult {
    Success {
        old_order: Vec<ZenithId>,
        new_order: Vec<ZenithId>,
    },
    SoftLocked {
        locked_node: ZenithId,
        reason: String,
    },
    IntegrityViolation {
        expected_ids: HashSet<ZenithId>,
        actual_ids: HashSet<ZenithId>,
    },
    NotFound { node_id: ZenithId },
}

// ===========================================================================
// v2.6: Intent-Aware OT — 12-Rule Transform Matrix
// ===========================================================================

/// A mutation intent — captures WHAT the user/AI intended, not just the diff.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum MutationIntent {
    /// Property change — handled by LWW, no OT needed.
    #[serde(rename_all = "camelCase")]
    PropertyChange {
        element: ZenithId,
        property: String,
        value: String,
        timestamp: u64,
    },

    /// Batch property changes (v5.5 Optimized for Resize/Drag)
    #[serde(rename_all = "camelCase")]
    BatchPropertyChange {
        element: ZenithId,
        styles: HashMap<String, String>,
        timestamp: u64,
    },


    /// Reorder children within a parent.
    #[serde(rename_all = "camelCase")]
    Reorder {
        parent: ZenithId,
        old_order: Vec<ZenithId>,
        new_order: Vec<ZenithId>,
        timestamp: u64,
    },

    /// Move node to a different parent.
    #[serde(rename_all = "camelCase")]
    Reparent {
        node: ZenithId,
        old_parent: ZenithId,
        new_parent: ZenithId,
        timestamp: u64,
    },

    /// Extract subtree into a new component.
    #[serde(rename_all = "camelCase")]
    ExtractComponent {
        nodes: Vec<ZenithId>,
        new_component_name: String,
        timestamp: u64,
    },

    /// Inline a component back into the parent.
    #[serde(rename_all = "camelCase")]
    InlineComponent {
        component: ZenithId,
        timestamp: u64,
    },

    /// Insert new node.
    #[serde(rename_all = "camelCase")]
    InsertNode {
        parent: ZenithId,
        index: usize,
        node_type: String,
        timestamp: u64,
    },

    /// Delete node.
    #[serde(rename_all = "camelCase")]
    DeleteNode {
        node: ZenithId,
        timestamp: u64,
    },

    /// Direct text content change.
    #[serde(rename_all = "camelCase")]
    TextChange {
        element: ZenithId,
        new_text: String,
        timestamp: u64,
    },

    /// Duplicate node. (v5.0)
    #[serde(rename_all = "camelCase")]
    DuplicateNode {
        node: ZenithId,
        timestamp: u64,
    },

    /// Group nodes (wrap in container). (v5.0)
    #[serde(rename_all = "camelCase")]
    GroupNode {
        node: ZenithId,
        container_tag: String,
        timestamp: u64,
    },

    /// Ungroup nodes (remove container). (v5.0)
    #[serde(rename_all = "camelCase")]
    UngroupNode {
        node: ZenithId,
        timestamp: u64,
    },
}

impl MutationIntent {
    /// Get the Lamport timestamp for this intent.
    pub fn timestamp(&self) -> u64 {
        match self {
            Self::PropertyChange { timestamp, .. } => *timestamp,
            Self::BatchPropertyChange { timestamp, .. } => *timestamp,
            Self::Reorder { timestamp, .. } => *timestamp,
            Self::Reparent { timestamp, .. } => *timestamp,
            Self::ExtractComponent { timestamp, .. } => *timestamp,
            Self::InlineComponent { timestamp, .. } => *timestamp,
            Self::InsertNode { timestamp, .. } => *timestamp,
            Self::DeleteNode { timestamp, .. } => *timestamp,
            Self::TextChange { timestamp, .. } => *timestamp,
            Self::DuplicateNode { timestamp, .. } => *timestamp,
            Self::GroupNode { timestamp, .. } => *timestamp,
            Self::UngroupNode { timestamp, .. } => *timestamp,
        }
    }

    /// Get all ZenithIds affected by this intent.
    pub fn affected_ids(&self) -> Vec<&ZenithId> {
        match self {
            Self::PropertyChange { element, .. } => vec![element],
            Self::BatchPropertyChange { element, .. } => vec![element],
            Self::Reorder { parent, old_order, new_order, .. } => {
                let mut ids: Vec<&ZenithId> = vec![parent];
                ids.extend(old_order.iter());
                ids.extend(new_order.iter());
                ids
            }
            Self::Reparent { node, old_parent, new_parent, .. } => {
                vec![node, old_parent, new_parent]
            }
            Self::ExtractComponent { nodes, .. } => nodes.iter().collect(),
            Self::InlineComponent { component, .. } => vec![component],
            Self::InsertNode { parent, .. } => vec![parent],
            Self::DeleteNode { node, .. } => vec![node],
            Self::TextChange { element, .. } => vec![element],
            Self::DuplicateNode { node, .. } => vec![node],
            Self::GroupNode { node, .. } => vec![node],
            Self::UngroupNode { node, .. } => vec![node],
        }
    }
}

/// The result of the OT transform.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransformResult {
    /// No conflict — intents don't overlap.
    NoConflict,

    /// Both intents can be merged automatically.
    AutoMerge {
        /// The merged sequence of intents to apply.
        steps: Vec<MutationIntent>,
        /// Human-readable description of the merge.
        description: String,
    },

    /// Ambiguous — escalate to the Conflict Resolution UI.
    HumanReview {
        /// Why this needs human review.
        reason: String,
        /// The human's intent.
        human_intent: MutationIntent,
        /// The AI's intent.
        ai_intent: MutationIntent,
        /// Rule number that triggered the escalation.
        rule: u8,
    },
}

// ---------------------------------------------------------------------------
// OT Engine (v2.6)
// ---------------------------------------------------------------------------

pub struct OtEngine;

impl OtEngine {
    // -----------------------------------------------------------------------
    // v2.0: Layer reorder/reparent (preserved)
    // -----------------------------------------------------------------------

    /// Reorder a child within its parent's children list.
    pub fn reorder(parent: &mut LayerNode, op: &ReorderOp) -> OtResult {
        let mut pre_ids = HashSet::new();
        for child in &parent.children {
            pre_ids.insert(child.zenith_id.clone());
        }
        let old_order: Vec<ZenithId> =
            parent.children.iter().map(|c| c.zenith_id.clone()).collect();

        let current_index = match parent
            .children
            .iter()
            .position(|c| c.zenith_id == op.node_id)
        {
            Some(idx) => idx,
            None => return OtResult::NotFound { node_id: op.node_id.clone() },
        };

        if parent.soft_locked {
            return OtResult::SoftLocked {
                locked_node: parent.zenith_id.clone(),
                reason: "Parent is inside a .map() or ternary — reordering disabled".into(),
            };
        }
        if let Some(locked) = parent.children.iter().find(|c| c.soft_locked) {
            return OtResult::SoftLocked {
                locked_node: locked.zenith_id.clone(),
                reason: "Sibling is inside a .map() or ternary — reordering disabled".into(),
            };
        }

        let target_index = op.target_index.min(parent.children.len().saturating_sub(1));

        if current_index == target_index {
            return OtResult::Success {
                old_order: old_order.clone(),
                new_order: old_order,
            };
        }

        let extracted = parent.children.remove(current_index);
        debug!("OT Pass 1: Extracted {:?} from index {current_index}", extracted.zenith_id);

        let insert_at = target_index.min(parent.children.len());
        parent.children.insert(insert_at, extracted);
        debug!("OT Pass 2: Inserted at index {insert_at}");

        let mut post_ids = HashSet::new();
        for child in &parent.children {
            post_ids.insert(child.zenith_id.clone());
        }

        if pre_ids != post_ids {
            warn!("OT integrity violation: pre={pre_ids:?} post={post_ids:?}");
            return OtResult::IntegrityViolation {
                expected_ids: pre_ids,
                actual_ids: post_ids,
            };
        }

        let new_order: Vec<ZenithId> =
            parent.children.iter().map(|c| c.zenith_id.clone()).collect();

        debug!("OT reorder complete: {old_order:?} → {new_order:?}");
        OtResult::Success { old_order, new_order }
    }

    /// Reparent a node: move it from one parent to another.
    pub fn reparent(
        old_parent: &mut LayerNode,
        new_parent: &mut LayerNode,
        op: &ReparentOp,
    ) -> OtResult {
        let mut pre_ids = HashSet::new();
        for child in &old_parent.children {
            pre_ids.insert(child.zenith_id.clone());
        }
        for child in &new_parent.children {
            pre_ids.insert(child.zenith_id.clone());
        }
        let old_order: Vec<ZenithId> =
            old_parent.children.iter().map(|c| c.zenith_id.clone()).collect();

        if new_parent.soft_locked {
            return OtResult::SoftLocked {
                locked_node: new_parent.zenith_id.clone(),
                reason: "Target parent is soft-locked — cannot reparent into it".into(),
            };
        }

        let current_index = match old_parent
            .children
            .iter()
            .position(|c| c.zenith_id == op.node_id)
        {
            Some(idx) => idx,
            None => return OtResult::NotFound { node_id: op.node_id.clone() },
        };

        let extracted = old_parent.children.remove(current_index);
        let insert_at = op.target_index.min(new_parent.children.len());
        new_parent.children.insert(insert_at, extracted);

        let mut post_ids = HashSet::new();
        for child in &old_parent.children {
            post_ids.insert(child.zenith_id.clone());
        }
        for child in &new_parent.children {
            post_ids.insert(child.zenith_id.clone());
        }

        if pre_ids != post_ids {
            return OtResult::IntegrityViolation {
                expected_ids: pre_ids,
                actual_ids: post_ids,
            };
        }

        let new_order: Vec<ZenithId> =
            new_parent.children.iter().map(|c| c.zenith_id.clone()).collect();

        OtResult::Success { old_order, new_order }
    }

    // -----------------------------------------------------------------------
    // v2.6: Intent-Aware OT Transform — 12-Rule Matrix
    // -----------------------------------------------------------------------

    /// Given two concurrent intents (human + AI), produce a merged result
    /// or escalate to human review if semantically ambiguous.
    pub fn transform(
        human_intent: &MutationIntent,
        ai_intent: &MutationIntent,
    ) -> TransformResult {
        // Rule 12: Non-overlapping subtrees → no conflict
        if !Self::intents_overlap(human_intent, ai_intent) {
            return TransformResult::NoConflict;
        }

        match (human_intent, ai_intent) {
            // Rule 1: Reorder + ExtractComponent → Rebase reorder inside new component
            (
                MutationIntent::Reorder { parent: _, new_order, old_order, timestamp: h_ts, .. },
                MutationIntent::ExtractComponent { nodes, new_component_name, timestamp: a_ts },
            ) => {
                if new_order.iter().all(|n| nodes.contains(n)) {
                    TransformResult::AutoMerge {
                        steps: vec![
                            ai_intent.clone(),
                            MutationIntent::Reorder {
                                parent: format!("__component_{new_component_name}"),
                                old_order: old_order.clone(),
                                new_order: new_order.clone(),
                                timestamp: *h_ts,
                            },
                        ],
                        description: format!(
                            "Extract into <{new_component_name}> then reorder inside it"
                        ),
                    }
                } else {
                    TransformResult::HumanReview {
                        reason: "Reorder spans nodes both inside and outside the extraction boundary".into(),
                        human_intent: human_intent.clone(),
                        ai_intent: ai_intent.clone(),
                        rule: 1,
                    }
                }
            }

            // Rule 2: DeleteNode + Reparent → Escalate
            (
                MutationIntent::DeleteNode { node: h_node, .. },
                MutationIntent::Reparent { node: a_node, .. },
            ) if h_node == a_node => {
                TransformResult::HumanReview {
                    reason: "Human deleted a node that AI wants to move".into(),
                    human_intent: human_intent.clone(),
                    ai_intent: ai_intent.clone(),
                    rule: 2,
                }
            }

            // Rule 3: PropertyChange / BatchPropertyChange → LWW
            (
                MutationIntent::PropertyChange { element: h_el, timestamp: h_ts, .. },
                MutationIntent::PropertyChange { element: a_el, timestamp: a_ts, .. },
            ) if h_el == a_el => {
                let winner = if h_ts >= a_ts { human_intent.clone() } else { ai_intent.clone() };
                TransformResult::AutoMerge {
                    steps: vec![winner], 
                    description: format!("Property conflict resolved via LWW (timestamp: {})", if h_ts >= a_ts { "human" } else { "ai" }),
                }
            }

            (
                MutationIntent::BatchPropertyChange { element: h_el, timestamp: h_ts, .. },
                MutationIntent::PropertyChange { element: a_el, timestamp: a_ts, .. },
            ) if h_el == a_el => {
                let winner = if h_ts >= a_ts { human_intent.clone() } else { ai_intent.clone() };
                TransformResult::AutoMerge {
                    steps: vec![winner],
                    description: "Batch property conflict vs single property resolved via LWW".into(),
                }
            }

            (
                MutationIntent::PropertyChange { element: h_el, timestamp: h_ts, .. },
                MutationIntent::BatchPropertyChange { element: a_el, timestamp: a_ts, .. },
            ) if h_el == a_el => {
                let winner = if h_ts >= a_ts { human_intent.clone() } else { ai_intent.clone() };
                TransformResult::AutoMerge {
                    steps: vec![winner],
                    description: "Property conflict vs batch property resolved via LWW".into(),
                }
            }

            (
                MutationIntent::BatchPropertyChange { element: h_el, timestamp: h_ts, .. },
                MutationIntent::BatchPropertyChange { element: a_el, timestamp: a_ts, .. },
            ) if h_el == a_el => {
                let winner = if h_ts >= a_ts { human_intent.clone() } else { ai_intent.clone() };
                TransformResult::AutoMerge {
                    steps: vec![winner],
                    description: "Batch property conflict resolved via LWW".into(),
                }
            }


            // Rule 4: InsertNode + InsertNode at same parent → Deterministic Order
            (
                MutationIntent::InsertNode { parent: h_parent, index: h_idx, timestamp: h_ts, .. },
                MutationIntent::InsertNode { parent: a_parent, index: a_idx, timestamp: a_ts, .. },
            ) if h_parent == a_parent => {
                if h_ts <= a_ts {
                    TransformResult::AutoMerge {
                        steps: vec![
                            human_intent.clone(),
                            MutationIntent::InsertNode {
                                parent: a_parent.clone(),
                                index: if h_idx <= a_idx { a_idx + 1 } else { *a_idx },
                                node_type: match ai_intent {
                                    MutationIntent::InsertNode { node_type, .. } => node_type.clone(),
                                    _ => unreachable!(),
                                },
                                timestamp: *a_ts,
                            },
                        ],
                        description: "Both inserts applied — deterministic order via timestamp".into(),
                    }
                } else {
                    TransformResult::AutoMerge {
                        steps: vec![
                            ai_intent.clone(),
                            MutationIntent::InsertNode {
                                parent: h_parent.clone(),
                                index: if a_idx <= h_idx { h_idx + 1 } else { *h_idx },
                                node_type: match human_intent {
                                    MutationIntent::InsertNode { node_type, .. } => node_type.clone(),
                                    _ => unreachable!(),
                                },
                                timestamp: *h_ts,
                            },
                        ],
                        description: "Both inserts applied — deterministic order via timestamp (AI first)".into(),
                    }
                }
            }

            // Rule 5: DeleteNode + DeleteNode → Deduplicate
            (
                MutationIntent::DeleteNode { node: h_node, .. },
                MutationIntent::DeleteNode { node: a_node, .. },
            ) if h_node == a_node => {
                TransformResult::AutoMerge {
                    steps: vec![human_intent.clone()],
                    description: "Duplicate deletion — applied once".into(),
                }
            }

            // Rule 6: Reorder + Reorder → Compose permutations
            (
                MutationIntent::Reorder { parent: h_parent, new_order: h_new, old_order: h_old, timestamp: h_ts, .. },
                MutationIntent::Reorder { parent: a_parent, .. },
            ) if h_parent == a_parent => {
                TransformResult::AutoMerge {
                    steps: vec![MutationIntent::Reorder {
                        parent: h_parent.clone(),
                        old_order: h_old.clone(),
                        new_order: h_new.clone(),
                        timestamp: *h_ts,
                    }],
                    description: "Concurrent reorders — human ordering takes priority".into(),
                }
            }

            // Rule 7: Reparent + Reparent → Escalate
            (
                MutationIntent::Reparent { node: h_node, .. },
                MutationIntent::Reparent { node: a_node, .. },
            ) if h_node == a_node => {
                TransformResult::HumanReview {
                    reason: "Both human and AI want to move the same node to different parents".into(),
                    human_intent: human_intent.clone(),
                    ai_intent: ai_intent.clone(),
                    rule: 7,
                }
            }

            // Rule 8: ExtractComponent + ExtractComponent → Escalate
            (
                MutationIntent::ExtractComponent { nodes: h_nodes, .. },
                MutationIntent::ExtractComponent { nodes: a_nodes, .. },
            ) => {
                let h_set: std::collections::HashSet<_> = h_nodes.iter().collect();
                let a_set: std::collections::HashSet<_> = a_nodes.iter().collect();
                if h_set.intersection(&a_set).count() > 0 {
                    TransformResult::HumanReview {
                        reason: "Overlapping extraction boundaries".into(),
                        human_intent: human_intent.clone(),
                        ai_intent: ai_intent.clone(),
                        rule: 8,
                    }
                } else {
                    TransformResult::NoConflict
                }
            }

            // Rule 9: InsertNode + ExtractComponent → Rebase insert inside component
            (
                MutationIntent::InsertNode { parent: h_parent, index, node_type, timestamp: h_ts },
                MutationIntent::ExtractComponent { nodes, new_component_name, timestamp: a_ts },
            ) if nodes.contains(h_parent) => {
                TransformResult::AutoMerge {
                    steps: vec![
                        ai_intent.clone(),
                        MutationIntent::InsertNode {
                            parent: format!("__component_{new_component_name}"),
                            index: *index,
                            node_type: node_type.clone(),
                            timestamp: *h_ts,
                        },
                    ],
                    description: format!("Insert rebased inside <{new_component_name}> after extraction"),
                }
            }

            // Rule 10: DeleteNode + ExtractComponent → Remove from extraction set
            (
                MutationIntent::DeleteNode { node: h_node, timestamp: h_ts },
                MutationIntent::ExtractComponent { nodes, new_component_name, timestamp: a_ts },
            ) if nodes.contains(h_node) => {
                let filtered: Vec<ZenithId> = nodes
                    .iter()
                    .filter(|n| *n != h_node)
                    .cloned()
                    .collect();

                if filtered.is_empty() {
                    TransformResult::AutoMerge {
                        steps: vec![human_intent.clone()],
                        description: "Deletion nullifies extraction".into(),
                    }
                } else {
                    TransformResult::AutoMerge {
                        steps: vec![
                            human_intent.clone(),
                            MutationIntent::ExtractComponent {
                                nodes: filtered,
                                new_component_name: new_component_name.clone(),
                                timestamp: *a_ts,
                            },
                        ],
                        description: format!("Deleted node removed from <{new_component_name}> extraction set"),
                    }
                }
            }

            // Rule 11: InlineComponent + any structural → Escalate
            (MutationIntent::InlineComponent { .. }, _) | (_, MutationIntent::InlineComponent { .. }) => {
                TransformResult::HumanReview {
                    reason: "InlineComponent is destructive".into(),
                    human_intent: human_intent.clone(),
                    ai_intent: ai_intent.clone(),
                    rule: 11,
                }
            }

            // v3.10 Hardening (OT1): Rule 13 — Ancestor-Descendant Conflict (Delete vs Modify)
            (
                MutationIntent::DeleteNode { node: h_node, .. },
                MutationIntent::PropertyChange { element: a_node, .. },
            ) if a_node.starts_with(h_node) && a_node.len() > h_node.len() && a_node.as_bytes()[h_node.len()] == b':' => {
                TransformResult::AutoMerge {
                    steps: vec![human_intent.clone()], // Deletion wins, AI modification is dropped
                    description: "Descendant modified after ancestor deleted — dropping modification".into(),
                }
            }

            // Default: escalate
            _ => {
                TransformResult::HumanReview {
                    reason: "Complex structural overlap detected".into(),
                    human_intent: human_intent.clone(),
                    ai_intent: ai_intent.clone(),
                    rule: 12,
                }
            }
        }
    }

    /// Check if two intents affect overlapping subtrees.
    fn intents_overlap(a: &MutationIntent, b: &MutationIntent) -> bool {
        let a_ids: HashSet<&ZenithId> = a.affected_ids().into_iter().collect();
        let b_ids: HashSet<&ZenithId> = b.affected_ids().into_iter().collect();
        a_ids.intersection(&b_ids).count() > 0
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn node(id: &str, children: Vec<LayerNode>) -> LayerNode {
        LayerNode {
            zenith_id: id.to_string(),
            display_name: format!("<{id}>"),
            children,
            soft_locked: false,
        }
    }

    fn locked_node(id: &str) -> LayerNode {
        LayerNode {
            zenith_id: id.to_string(),
            display_name: format!("<{id}>"),
            children: vec![],
            soft_locked: true,
        }
    }

    fn leaf(id: &str) -> LayerNode {
        node(id, vec![])
    }

    // --- v2.0 Layer reorder tests (preserved) ---

    #[test]
    fn test_reorder_move_to_end() {
        let mut parent = node("parent", vec![leaf("a"), leaf("b"), leaf("c")]);
        let op = ReorderOp { node_id: "a".into(), parent_id: "parent".into(), target_index: 2 };
        match OtEngine::reorder(&mut parent, &op) {
            OtResult::Success { old_order, new_order } => {
                assert_eq!(old_order, vec!["a", "b", "c"]);
                assert_eq!(new_order, vec!["b", "c", "a"]);
            }
            other => panic!("Expected Success, got {other:?}"),
        }
    }

    #[test]
    fn test_reorder_move_to_front() {
        let mut parent = node("parent", vec![leaf("a"), leaf("b"), leaf("c")]);
        let op = ReorderOp { node_id: "c".into(), parent_id: "parent".into(), target_index: 0 };
        match OtEngine::reorder(&mut parent, &op) {
            OtResult::Success { new_order, .. } => assert_eq!(new_order, vec!["c", "a", "b"]),
            other => panic!("Expected Success, got {other:?}"),
        }
    }

    #[test]
    fn test_reorder_preserves_all_nodes() {
        let mut parent = node("parent", vec![leaf("a"), leaf("b"), leaf("c"), leaf("d"), leaf("e")]);
        let op = ReorderOp { node_id: "b".into(), parent_id: "parent".into(), target_index: 4 };
        OtEngine::reorder(&mut parent, &op);
        let ids: HashSet<String> = parent.children.iter().map(|c| c.zenith_id.clone()).collect();
        assert_eq!(ids.len(), 5);
    }

    #[test]
    fn test_reorder_same_position_is_noop() {
        let mut parent = node("parent", vec![leaf("a"), leaf("b"), leaf("c")]);
        let op = ReorderOp { node_id: "b".into(), parent_id: "parent".into(), target_index: 1 };
        match OtEngine::reorder(&mut parent, &op) {
            OtResult::Success { old_order, new_order } => assert_eq!(old_order, new_order),
            other => panic!("Expected Success (noop), got {other:?}"),
        }
    }

    #[test]
    fn test_reorder_not_found() {
        let mut parent = node("parent", vec![leaf("a"), leaf("b")]);
        let op = ReorderOp { node_id: "nonexistent".into(), parent_id: "parent".into(), target_index: 0 };
        assert!(matches!(OtEngine::reorder(&mut parent, &op), OtResult::NotFound { .. }));
    }

    #[test]
    fn test_reorder_refused_on_soft_lock() {
        let mut parent = node("parent", vec![leaf("a"), locked_node("b"), leaf("c")]);
        let op = ReorderOp { node_id: "a".into(), parent_id: "parent".into(), target_index: 2 };
        assert!(matches!(OtEngine::reorder(&mut parent, &op), OtResult::SoftLocked { .. }));
    }

    #[test]
    fn test_reparent_across_parents() {
        let mut old_parent = node("old", vec![leaf("a"), leaf("b"), leaf("c")]);
        let mut new_parent = node("new", vec![leaf("x"), leaf("y")]);
        let op = ReparentOp {
            node_id: "b".into(), old_parent_id: "old".into(),
            new_parent_id: "new".into(), target_index: 1,
        };
        match OtEngine::reparent(&mut old_parent, &mut new_parent, &op) {
            OtResult::Success { .. } => {
                let old_ids: Vec<_> = old_parent.children.iter().map(|c| c.zenith_id.as_str()).collect();
                assert_eq!(old_ids, vec!["a", "c"]);
                let new_ids: Vec<_> = new_parent.children.iter().map(|c| c.zenith_id.as_str()).collect();
                assert_eq!(new_ids, vec!["x", "b", "y"]);
            }
            other => panic!("Expected Success, got {other:?}"),
        }
    }

    #[test]
    fn test_reparent_into_locked_parent() {
        let mut old_parent = node("old", vec![leaf("a")]);
        let mut new_parent = LayerNode {
            zenith_id: "new".into(), display_name: "<new>".into(),
            children: vec![], soft_locked: true,
        };
        let op = ReparentOp {
            node_id: "a".into(), old_parent_id: "old".into(),
            new_parent_id: "new".into(), target_index: 0,
        };
        assert!(matches!(OtEngine::reparent(&mut old_parent, &mut new_parent, &op), OtResult::SoftLocked { .. }));
    }

    // --- v2.6 12-Rule OT Matrix tests ---

    #[test]
    fn test_rule_1_reorder_plus_extract_auto_merge() {
        let human = MutationIntent::Reorder {
            parent: "nav".into(),
            old_order: vec!["a".into(), "b".into(), "c".into()],
            new_order: vec!["b".into(), "a".into(), "c".into()],
            timestamp: 0,
        };
        let ai = MutationIntent::ExtractComponent {
            nodes: vec!["a".into(), "b".into(), "c".into()],
            new_component_name: "NavBar".into(),
            timestamp: 0,
        };
        match OtEngine::transform(&human, &ai) {
            TransformResult::AutoMerge { steps, description } => {
                assert_eq!(steps.len(), 2);
                assert!(description.contains("NavBar"));
            }
            other => panic!("Expected AutoMerge, got {other:?}"),
        }
    }

    #[test]
    fn test_rule_1_reorder_plus_extract_escalate() {
        let human = MutationIntent::Reorder {
            parent: "nav".into(),
            old_order: vec!["a".into(), "b".into(), "c".into(), "d".into()],
            new_order: vec!["b".into(), "a".into(), "c".into(), "d".into()],
            timestamp: 0,
        };
        let ai = MutationIntent::ExtractComponent {
            nodes: vec!["a".into(), "b".into()], // Only extracts 2 of 4
            new_component_name: "NavBar".into(),
            timestamp: 0,
        };
        match OtEngine::transform(&human, &ai) {
            TransformResult::HumanReview { rule, .. } => assert_eq!(rule, 1),
            other => panic!("Expected HumanReview, got {other:?}"),
        }
    }

    #[test]
    fn test_rule_2_delete_plus_reparent() {
        let human = MutationIntent::DeleteNode { node: "btn".into(), timestamp: 0 };
        let ai = MutationIntent::Reparent {
            node: "btn".into(), old_parent: "old".into(), new_parent: "new".into(), timestamp: 0,
        };
        match OtEngine::transform(&human, &ai) {
            TransformResult::HumanReview { rule, .. } => assert_eq!(rule, 2),
            other => panic!("Expected HumanReview, got {other:?}"),
        }
    }

    #[test]
    fn test_rule_3_property_lww() {
        let human = MutationIntent::PropertyChange {
            element: "hero".into(), property: "padding".into(), value: "20px".into(), timestamp: 0,
        };
        let ai = MutationIntent::PropertyChange {
            element: "hero".into(), property: "padding".into(), value: "40px".into(), timestamp: 0,
        };
        match OtEngine::transform(&human, &ai) {
            TransformResult::AutoMerge { steps, .. } => {
                assert_eq!(steps.len(), 1); // Human wins
            }
            other => panic!("Expected AutoMerge (LWW), got {other:?}"),
        }
    }

    #[test]
    fn test_rule_4_insert_plus_insert() {
        let human = MutationIntent::InsertNode {
            parent: "list".into(), index: 1, node_type: "li".into(), timestamp: 0,
        };
        let ai = MutationIntent::InsertNode {
            parent: "list".into(), index: 2, node_type: "li".into(), timestamp: 0,
        };
        match OtEngine::transform(&human, &ai) {
            TransformResult::AutoMerge { steps, .. } => {
                assert_eq!(steps.len(), 2);
                // AI index should be shifted
                match &steps[1] {
                    MutationIntent::InsertNode { index, .. } => assert_eq!(*index, 3),
                    other => panic!("Expected InsertNode, got {other:?}"),
                }
            }
            other => panic!("Expected AutoMerge, got {other:?}"),
        }
    }

    #[test]
    fn test_rule_5_delete_plus_delete() {
        let human = MutationIntent::DeleteNode { node: "trash".into(), timestamp: 0 };
        let ai = MutationIntent::DeleteNode { node: "trash".into(), timestamp: 0 };
        match OtEngine::transform(&human, &ai) {
            TransformResult::AutoMerge { steps, .. } => assert_eq!(steps.len(), 1),
            other => panic!("Expected AutoMerge (dedup), got {other:?}"),
        }
    }

    #[test]
    fn test_rule_6_reorder_plus_reorder() {
        let human = MutationIntent::Reorder {
            parent: "list".into(),
            old_order: vec!["a".into(), "b".into()],
            new_order: vec!["b".into(), "a".into()],
            timestamp: 0,
        };
        let ai = MutationIntent::Reorder {
            parent: "list".into(),
            old_order: vec!["a".into(), "b".into()],
            new_order: vec!["a".into(), "b".into()],
            timestamp: 0,
        };
        match OtEngine::transform(&human, &ai) {
            TransformResult::AutoMerge { steps, description } => {
                assert!(description.contains("human"));
                assert_eq!(steps.len(), 1);
            }
            other => panic!("Expected AutoMerge, got {other:?}"),
        }
    }

    #[test]
    fn test_rule_7_reparent_plus_reparent() {
        let human = MutationIntent::Reparent {
            node: "btn".into(), old_parent: "a".into(), new_parent: "b".into(), timestamp: 0,
        };
        let ai = MutationIntent::Reparent {
            node: "btn".into(), old_parent: "a".into(), new_parent: "c".into(), timestamp: 0,
        };
        match OtEngine::transform(&human, &ai) {
            TransformResult::HumanReview { rule, .. } => assert_eq!(rule, 7),
            other => panic!("Expected HumanReview, got {other:?}"),
        }
    }

    #[test]
    fn test_rule_8_extract_plus_extract_overlap() {
        let human = MutationIntent::ExtractComponent {
            nodes: vec!["a".into(), "b".into()],
            new_component_name: "Panel".into(),
            timestamp: 0,
        };
        let ai = MutationIntent::ExtractComponent {
            nodes: vec!["b".into(), "c".into()], // "b" overlaps
            new_component_name: "Card".into(),
            timestamp: 0,
        };
        match OtEngine::transform(&human, &ai) {
            TransformResult::HumanReview { rule, .. } => assert_eq!(rule, 8),
            other => panic!("Expected HumanReview, got {other:?}"),
        }
    }

    #[test]
    fn test_rule_10_delete_from_extraction() {
        let human = MutationIntent::DeleteNode { node: "b".into(), timestamp: 0 };
        let ai = MutationIntent::ExtractComponent {
            nodes: vec!["a".into(), "b".into(), "c".into()],
            new_component_name: "Group".into(),
            timestamp: 0,
        };
        match OtEngine::transform(&human, &ai) {
            TransformResult::AutoMerge { steps, .. } => {
                assert_eq!(steps.len(), 2);
                // Second step should be extract without "b"
                match &steps[1] {
                    MutationIntent::ExtractComponent { nodes, .. } => {
                        assert!(!nodes.contains(&"b".to_string()));
                        assert_eq!(nodes.len(), 2);
                    }
                    other => panic!("Expected ExtractComponent, got {other:?}"),
                }
            }
            other => panic!("Expected AutoMerge, got {other:?}"),
        }
    }

    #[test]
    fn test_rule_11_inline_escalates() {
        let human = MutationIntent::InlineComponent { component: "Nav".into(), timestamp: 0 };
        let ai = MutationIntent::Reorder {
            parent: "Nav".into(),
            old_order: vec!["a".into()],
            new_order: vec!["a".into()],
            timestamp: 0,
        };
        match OtEngine::transform(&human, &ai) {
            TransformResult::HumanReview { rule, .. } => assert_eq!(rule, 11),
            other => panic!("Expected HumanReview, got {other:?}"),
        }
    }

    #[test]
    fn test_rule_12_non_overlapping() {
        let human = MutationIntent::PropertyChange {
            element: "hero".into(), property: "padding".into(), value: "20px".into(), timestamp: 0,
        };
        let ai = MutationIntent::PropertyChange {
            element: "footer".into(), property: "margin".into(), value: "10px".into(), timestamp: 0,
        };
        assert!(matches!(OtEngine::transform(&human, &ai), TransformResult::NoConflict));
    }
}
