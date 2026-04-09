//! # Draft State
//!
//! Visual feedback for AI-streamed changes. Elements under AI modification
//! get a "Void Cyan" glowing border and pulsing animation.

use serde::Serialize;

use crate::types::ZenithId;

/// Events sent to the webview to control Draft State visual indicators.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "action")]
pub enum DraftStateEvent {
    /// Enter draft mode for a subtree — shows cyan glow.
    Enter {
        zenith_id: ZenithId,
        label: String,
    },
    /// Update the draft label (e.g., "Refactoring...", "Applying styles...").
    UpdateLabel {
        zenith_id: ZenithId,
        label: String,
    },
    /// Finalize — show "Accept / Reject" controls.
    Finalize {
        zenith_id: ZenithId,
        summary: String,
        patch_count: u32,
    },
    /// Exit draft mode (accepted or rejected).
    Exit {
        zenith_id: ZenithId,
    },
}

/// CSS rules injected into the iframe for draft state indicators.
/// These are injected once per session and use data attributes for targeting.
pub const DRAFT_STATE_CSS: &str = r#"
[data-zenith-draft="pending"] {
    outline: 2px solid #00F0FF;
    outline-offset: 2px;
    animation: zenith-draft-pulse 2s ease-in-out infinite;
    position: relative;
}

[data-zenith-draft="pending"]::after {
    content: attr(data-zenith-draft-label);
    position: absolute;
    top: -22px;
    right: 4px;
    font-size: 10px;
    color: #00F0FF;
    background: rgba(5, 5, 5, 0.85);
    padding: 2px 8px;
    border-radius: 3px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    letter-spacing: 0.02em;
    pointer-events: none;
    white-space: nowrap;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(0, 240, 255, 0.2);
}

[data-zenith-draft="finalized"] {
    outline: 2px solid #00F0FF;
    outline-offset: 2px;
    animation: none;
}

@keyframes zenith-draft-pulse {
    0%, 100% { outline-color: rgba(0, 240, 255, 0.3); }
    50%      { outline-color: rgba(0, 240, 255, 1.0); }
}
"#;
