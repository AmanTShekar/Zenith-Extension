//! # Pencil-Stream — Live AI Patch Streaming
//!
//! Receives incremental semantic patches from the AI Agent and applies
//! them to the VFS in real-time, emitting Draft State events to the canvas.

pub mod draft_state;

use serde::{Deserialize, Serialize};

use crate::types::{TransactionId, ZenithId};

// ---------------------------------------------------------------------------
// Stream protocol messages
// ---------------------------------------------------------------------------

/// A stream event from the AI Agent.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum StreamEvent {
    /// AI begins working on a component subtree.
    Begin {
        transaction_id: TransactionId,
        scope: ZenithId,
        description: String,
    },

    /// An incremental semantic patch.
    Patch {
        transaction_id: TransactionId,
        patch: SemanticPatch,
    },

    /// AI finished its task. Canvas shows "Accept / Reject".
    End {
        transaction_id: TransactionId,
    },

    /// AI encountered an error mid-stream.
    Error {
        transaction_id: TransactionId,
        message: String,
    },
}

/// A semantic patch — higher-level than a text edit.
/// The Rust sidecar resolves these into actual AST text edits.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind")]
pub enum SemanticPatch {
    /// Change a CSS property on an element.
    PropertyChange {
        zenith_id: ZenithId,
        property: String,
        old_value: Option<String>,
        new_value: String,
    },

    /// Swap a Tailwind class on an element.
    ClassSwap {
        zenith_id: ZenithId,
        old_class: String,
        new_class: String,
    },

    /// Insert a new JSX node as a child.
    NodeInsert {
        parent_zenith_id: ZenithId,
        index: u32,
        jsx_source: String,
    },

    /// Remove a JSX node.
    NodeDelete {
        zenith_id: ZenithId,
    },

    /// Move a JSX node to a new position.
    NodeMove {
        zenith_id: ZenithId,
        new_parent: ZenithId,
        new_index: u32,
    },

    /// Extract part of a component into a new component.
    ExtractComponent {
        source_zenith_id: ZenithId,
        new_component_name: String,
        new_file: Option<String>,
    },

    /// A raw text edit (fallback for complex changes).
    RawEdit {
        file: String,
        start_line: u32,
        start_col: u32,
        end_line: u32,
        end_col: u32,
        new_text: String,
    },
}

/// The state of an active AI stream.
#[derive(Debug, Clone)]
pub struct ActiveStream {
    pub transaction_id: TransactionId,
    pub scope: ZenithId,
    pub description: String,
    pub patches_received: u32,
    pub status: StreamStatus,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum StreamStatus {
    Active,
    Completed,
    Error(String),
}
