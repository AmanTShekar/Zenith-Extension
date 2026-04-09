//! Core types shared across all modules.

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use uuid::Uuid;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/// Agent Cyan — the signature overlay color for all Zenith visual indicators.
pub const AGENT_CYAN: &str = "#00F0FF";

// ---------------------------------------------------------------------------
// Identifiers
// ---------------------------------------------------------------------------

/// A Ghost-ID string: "src/components/Button.tsx:14:6"
pub type ZenithId = String;

/// Dual FNV-1a hash of a ZenithId for SAB ring buffer (64-bit).
pub type ZenithIdHash = u64;

/// Unique transaction identifier.
pub type TransactionId = Uuid;

// ---------------------------------------------------------------------------
// Actor model
// ---------------------------------------------------------------------------

/// Who is making a change.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ActorId {
    Human,
    AgentStyler,
    AgentArchitect,
    AgentAuditor,
}

impl ActorId {
    /// Deterministic tiebreak priority. Human always wins.
    pub fn priority(self) -> u8 {
        match self {
            ActorId::Human => 255,
            ActorId::AgentStyler => 100,
            ActorId::AgentArchitect => 90,
            ActorId::AgentAuditor => 80,
        }
    }
}

// ---------------------------------------------------------------------------
// Patch types
// ---------------------------------------------------------------------------

/// A single text edit within a file (byte-precise range).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextEdit {
    pub start_line: u32,
    pub start_col: u32,
    pub end_line: u32,
    pub end_col: u32,
    pub old_text: String,
    pub new_text: String,
}

/// The styling paradigm the patcher detected and used.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PatchStrategy {
    Tailwind,
    InlineStyle,
    CssModule,
}

/// A fully resolved patch ready for VFS staging.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResolvedPatch {
    pub file: PathBuf,
    pub edits: Vec<TextEdit>,
    pub strategy: PatchStrategy,
    pub css_overrides: Vec<CssOverride>,
}

/// A CSS override for ghost preview (Tier 1 — injected via CSS variables).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CssOverride {
    pub zenith_id: ZenithId,
    pub property: String,    // CSS property name
    pub value: String,       // CSS value
}

// ---------------------------------------------------------------------------
// Property enumeration (for SAB ring buffer — fits in u16)
// ---------------------------------------------------------------------------

/// Numeric property IDs for the hot path. Must stay in sync with TypeScript.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[repr(u16)]
pub enum PropertyId {
    Padding = 0,
    PaddingTop = 1,
    PaddingRight = 2,
    PaddingBottom = 3,
    PaddingLeft = 4,
    Margin = 5,
    MarginTop = 6,
    MarginRight = 7,
    MarginBottom = 8,
    MarginLeft = 9,
    Width = 10,
    Height = 11,
    Gap = 12,
    FontSize = 13,
    FontWeight = 14,
    BorderRadius = 15,
    Opacity = 16,
    LetterSpacing = 17,
    LineHeight = 18,
    BorderWidth = 19,
}

impl PropertyId {
    pub fn from_u16(val: u16) -> Option<Self> {
        if val <= 19 {
            // SAFETY: all values 0..=19 are defined variants with repr(u16)
            Some(unsafe { std::mem::transmute(val) })
        } else {
            None
        }
    }

    /// Map to CSS property name.
    pub fn css_name(self) -> &'static str {
        match self {
            Self::Padding => "padding",
            Self::PaddingTop => "padding-top",
            Self::PaddingRight => "padding-right",
            Self::PaddingBottom => "padding-bottom",
            Self::PaddingLeft => "padding-left",
            Self::Margin => "margin",
            Self::MarginTop => "margin-top",
            Self::MarginRight => "margin-right",
            Self::MarginBottom => "margin-bottom",
            Self::MarginLeft => "margin-left",
            Self::Width => "width",
            Self::Height => "height",
            Self::Gap => "gap",
            Self::FontSize => "font-size",
            Self::FontWeight => "font-weight",
            Self::BorderRadius => "border-radius",
            Self::Opacity => "opacity",
            Self::LetterSpacing => "letter-spacing",
            Self::LineHeight => "line-height",
            Self::BorderWidth => "border-width",
        }
    }

    /// Map to Tailwind utility prefix.
    pub fn tw_prefix(self) -> &'static str {
        match self {
            Self::Padding => "p",
            Self::PaddingTop => "pt",
            Self::PaddingRight => "pr",
            Self::PaddingBottom => "pb",
            Self::PaddingLeft => "pl",
            Self::Margin => "m",
            Self::MarginTop => "mt",
            Self::MarginRight => "mr",
            Self::MarginBottom => "mb",
            Self::MarginLeft => "ml",
            Self::Width => "w",
            Self::Height => "h",
            Self::Gap => "gap",
            Self::FontSize => "text",
            Self::FontWeight => "font",
            Self::BorderRadius => "rounded",
            Self::Opacity => "opacity",
            Self::LetterSpacing => "tracking",
            Self::LineHeight => "leading",
            Self::BorderWidth => "border",
        }
    }
}

/// CSS value units for the SAB ring buffer.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[repr(u32)]
pub enum Unit {
    Px = 0,
    Rem = 1,
    Percent = 2,
    Em = 3,
    Unitless = 4,
    TailwindStep = 5,
}

impl Unit {
    pub fn from_u32(val: u32) -> Option<Self> {
        if val <= 5 {
            Some(unsafe { std::mem::transmute(val) })
        } else {
            None
        }
    }

    pub fn format(self, value: f64) -> String {
        match self {
            Self::Px => format!("{value}px"),
            Self::Rem => format!("{value}rem"),
            Self::Percent => format!("{value}%"),
            Self::Em => format!("{value}em"),
            Self::Unitless => format!("{value}"),
            Self::TailwindStep => format!("{value}"),
        }
    }
}

// ---------------------------------------------------------------------------
// SAB Ring Buffer Message
// ---------------------------------------------------------------------------

/// Decoded scrub message from the SAB ring buffer.
/// This is the zero-alloc hot-path message format.
#[derive(Debug, Clone, Copy)]
pub struct ScrubMessage {
    pub sequence: u32,
    pub msg_type: ScrubMsgType,
    pub timestamp_us: u64,
    pub zenith_id_hash: ZenithIdHash,
    pub zenith_id_raw: [u8; 12],      // Full base62 ID (exact match)
    pub property_id: u16,
    pub value: f64,
    pub unit: Unit,
    pub velocity_hint: f32,           // v3.8 Scrub velocity (delta over time)
    pub flags: ScrubFlags,
    pub transaction_id_lo: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u32)]
pub enum ScrubMsgType {
    Scrub = 1,
    Release = 2,
    Ack = 3,
}

bitflags::bitflags! {
    #[derive(Debug, Clone, Copy)]
    pub struct ScrubFlags: u32 {
        const SHIFT = 0b0001;
        const ALT   = 0b0010;
        const CTRL  = 0b0100;
        const META  = 0b1000;
    }
}
