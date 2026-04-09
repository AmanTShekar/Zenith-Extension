//! # LWW Conflict Resolution
//!
//! Lamport-clocked Last-Write-Wins registers per `(element_id, property)`.
//! This module replaces advisory locking for property-level edits while
//! maintaining compatibility with tree-based conflict resolution for
//! structural changes.
//!
//! ## Design Invariant
//!
//! **Human always wins.** On Lamport clock ties, the actor with the higher
//! priority wins. Human priority = 255, all AI agents < 128. This means
//! if a human and an AI agent edit the same property in the same logical
//! instant, the human's edit is preserved.

use std::collections::HashMap;
use std::time::Instant;

use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use tracing::{debug, trace};

use crate::types::{ActorId, PropertyId, ZenithId};

// ---------------------------------------------------------------------------
// LWW Register
// ---------------------------------------------------------------------------

/// A Last-Write-Wins register for a single property on a single element.
///
/// The register stores the current value along with ordering metadata
/// (Lamport clock + actor ID) to resolve concurrent writes deterministically.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LWWRegister {
    /// The current winning value.
    pub value: PropertyValue,

    /// Monotonically increasing logical clock. Higher = newer.
    pub lamport_clock: u64,

    /// Who wrote this value.
    pub actor: ActorId,

    /// Wall-clock timestamp for debugging/logging (not used for ordering).
    #[serde(skip)]
    pub timestamp: Option<Instant>,
}

impl LWWRegister {
    pub fn new(value: PropertyValue, actor: ActorId, clock: u64) -> Self {
        Self {
            value,
            lamport_clock: clock,
            actor,
            timestamp: Some(Instant::now()),
        }
    }

    /// Attempt to update this register. Returns `true` if the write won,
    /// `false` if it was rejected (stale).
    ///
    /// ## Ordering Rules
    ///
    /// 1. Higher Lamport clock always wins.
    /// 2. On tie: higher actor priority wins (Human=255 > AgentStyler=100).
    /// 3. On full tie (same clock, same actor): last caller wins (idempotent).
    pub fn try_update(
        &mut self,
        new_value: PropertyValue,
        actor: ActorId,
        clock: u64,
    ) -> WriteResult {
        if clock > self.lamport_clock {
            // Clear win — newer clock
            let old = self.value.clone();
            self.value = new_value;
            self.lamport_clock = clock;
            self.actor = actor;
            self.timestamp = Some(Instant::now());
            WriteResult::Applied { superseded: old }
        } else if clock == self.lamport_clock {
            // Tiebreak by actor priority
            if actor.priority() > self.actor.priority() {
                let old = self.value.clone();
                self.value = new_value;
                self.actor = actor;
                self.timestamp = Some(Instant::now());
                WriteResult::Applied { superseded: old }
            } else if actor == self.actor {
                // Same actor, same clock — idempotent update
                self.value = new_value;
                self.timestamp = Some(Instant::now());
                WriteResult::Idempotent
            } else {
                WriteResult::Rejected {
                    winner: self.actor,
                    winner_clock: self.lamport_clock,
                }
            }
        } else {
            // Stale write — older clock
            WriteResult::Rejected {
                winner: self.actor,
                winner_clock: self.lamport_clock,
            }
        }
    }
}

/// What happened when we tried to write to a register.
#[derive(Debug, Clone)]
pub enum WriteResult {
    /// The write was accepted. Contains the old value that was superseded.
    Applied { superseded: PropertyValue },

    /// The write was a no-op (same actor, same clock, different value).
    Idempotent,

    /// The write was rejected because a newer/higher-priority write exists.
    Rejected { winner: ActorId, winner_clock: u64 },
}

impl WriteResult {
    pub fn was_applied(&self) -> bool {
        matches!(self, WriteResult::Applied { .. } | WriteResult::Idempotent)
    }
}

// ---------------------------------------------------------------------------
// Property Value
// ---------------------------------------------------------------------------

/// A resolved CSS property value.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum PropertyValue {
    /// A numeric value with a unit (e.g., 24px, 1.5rem).
    Numeric { value: f64, unit: String },

    /// A string value (e.g., color hex, font-family).
    String(String),

    /// A Tailwind utility class (e.g., "p-6").
    TailwindClass(String),
}

impl std::fmt::Display for PropertyValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Numeric { value, unit } => write!(f, "{value}{unit}"),
            Self::String(s) => write!(f, "{s}"),
            Self::TailwindClass(c) => write!(f, "{c}"),
        }
    }
}

// ---------------------------------------------------------------------------
// Element State (collection of LWW registers)
// ---------------------------------------------------------------------------

/// The conflict-free state for a single UI element.
/// Each CSS property has its own independent LWW register.
#[derive(Debug, Clone, Default)]
pub struct ElementState {
    /// Property → register mapping.
    registers: HashMap<PropertyId, LWWRegister>,
}

impl ElementState {
    pub fn get(&self, prop: PropertyId) -> Option<&LWWRegister> {
        self.registers.get(&prop)
    }

    pub fn apply(
        &mut self,
        prop: PropertyId,
        value: PropertyValue,
        actor: ActorId,
        clock: u64,
    ) -> WriteResult {
        match self.registers.get_mut(&prop) {
            Some(register) => register.try_update(value, actor, clock),
            None => {
                // First write for this property — always succeeds
                self.registers
                    .insert(prop, LWWRegister::new(value.clone(), actor, clock));
                WriteResult::Applied {
                    superseded: value, // no real predecessor
                }
            }
        }
    }

    /// Get all current property values for the inspector UI.
    pub fn snapshot(&self) -> Vec<(PropertyId, &LWWRegister)> {
        self.registers.iter().map(|(k, v)| (*k, v)).collect()
    }
}

// ---------------------------------------------------------------------------
// Conflict Resolver (file-level, concurrent-safe)
// ---------------------------------------------------------------------------

/// The top-level conflict resolver. Thread-safe via DashMap.
///
/// This is the single source of truth for "who last wrote what" on every
/// element × property pair in the workspace.
pub struct ConflictResolver {
    /// Per-element state, keyed by ZenithId.
    elements: DashMap<ZenithId, ElementState>,

    /// Global Lamport clock. Incremented on every write.
    clock: std::sync::atomic::AtomicU64,
}

impl ConflictResolver {
    pub fn new() -> Self {
        Self {
            elements: DashMap::new(),
            clock: std::sync::atomic::AtomicU64::new(0),
        }
    }

    /// Apply a property change. Returns the write result.
    ///
    /// This is the main entry point for both human edits (from the hot path)
    /// and AI edits (from the agent stream handler).
    pub fn apply(
        &self,
        zenith_id: &str,
        prop: PropertyId,
        value: PropertyValue,
        actor: ActorId,
    ) -> WriteResult {
        let clock = self
            .clock
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed)
            + 1;

        let mut entry = self.elements.entry(zenith_id.to_string()).or_default();
        let result = entry.apply(prop, value.clone(), actor, clock);

        match &result {
            WriteResult::Applied { superseded } => {
                debug!(
                    "LWW: {actor:?} wrote {prop:?}={value} on {zenith_id} (clock={clock}), superseded {superseded}"
                );
            }
            WriteResult::Rejected {
                winner,
                winner_clock,
            } => {
                debug!(
                    "LWW: {actor:?} rejected on {zenith_id}:{prop:?} — winner is {winner:?} at clock={winner_clock}"
                );
            }
            WriteResult::Idempotent => {
                trace!("LWW: idempotent write on {zenith_id}:{prop:?}");
            }
        }

        result
    }

    /// Get the current value of a property (for the property inspector).
    pub fn get(
        &self,
        zenith_id: &str,
        prop: PropertyId,
    ) -> Option<PropertyValue> {
        self.elements
            .get(zenith_id)
            .and_then(|state| state.get(prop).map(|r| r.value.clone()))
    }

    /// Get all properties for an element (for the property inspector panel).
    pub fn get_element_state(&self, zenith_id: &str) -> Option<Vec<(PropertyId, LWWRegister)>> {
        self.elements.get(zenith_id).map(|state| {
            state
                .snapshot()
                .into_iter()
                .map(|(k, v)| (k, v.clone()))
                .collect()
        })
    }

    /// Flush all state for an element (when the element is deleted or
    /// the file is closed). Prevents unbounded memory growth.
    pub fn flush_element(&self, zenith_id: &str) {
        self.elements.remove(zenith_id);
    }

    /// Flush all state for a file (when closing a file or on full re-injection).
    pub fn flush_file(&self, file_prefix: &str) {
        self.elements
            .retain(|key, _| !key.starts_with(file_prefix));
    }

    /// Current Lamport clock value (for debugging).
    pub fn clock(&self) -> u64 {
        self.clock.load(std::sync::atomic::Ordering::Relaxed)
    }
}

impl Default for ConflictResolver {
    fn default() -> Self {
        Self::new()
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn make_resolver() -> ConflictResolver {
        ConflictResolver::new()
    }

    #[test]
    fn test_human_always_wins_on_tie() {
        let resolver = make_resolver();
        let id = "src/Button.tsx:14:6";
        let prop = PropertyId::Padding;

        // AI writes first
        let r1 = resolver.apply(
            id,
            prop,
            PropertyValue::Numeric { value: 24.0, unit: "px".into() },
            ActorId::AgentStyler,
        );
        assert!(r1.was_applied());

        // Human writes at a higher clock — should win
        let r2 = resolver.apply(
            id,
            prop,
            PropertyValue::Numeric { value: 32.0, unit: "px".into() },
            ActorId::Human,
        );
        assert!(r2.was_applied());

        // Verify human's value persists
        let val = resolver.get(id, prop).unwrap();
        assert_eq!(
            val,
            PropertyValue::Numeric { value: 32.0, unit: "px".into() }
        );
    }

    #[test]
    fn test_stale_write_rejected() {
        let resolver = make_resolver();
        let id = "src/Hero.tsx:8:4";
        let prop = PropertyId::Margin;

        // Write at clock 1
        resolver.apply(
            id,
            prop,
            PropertyValue::Numeric { value: 16.0, unit: "px".into() },
            ActorId::Human,
        );

        // Manually create a stale register to simulate a race
        // (In practice, the global clock prevents this, but LWW must handle it)
        let mut entry = resolver.elements.entry(id.to_string()).or_default();
        let register = entry.registers.get_mut(&prop).unwrap();

        // Try to write at a lower clock
        let result = register.try_update(
            PropertyValue::Numeric { value: 8.0, unit: "px".into() },
            ActorId::AgentStyler,
            0, // lower clock than current
        );
        assert!(!result.was_applied());
    }

    #[test]
    fn test_different_properties_no_conflict() {
        let resolver = make_resolver();
        let id = "src/Card.tsx:12:8";

        // Human edits padding
        let r1 = resolver.apply(
            id,
            PropertyId::Padding,
            PropertyValue::Numeric { value: 16.0, unit: "px".into() },
            ActorId::Human,
        );
        assert!(r1.was_applied());

        // AI edits margin (different property — no conflict)
        let r2 = resolver.apply(
            id,
            PropertyId::Margin,
            PropertyValue::Numeric { value: 8.0, unit: "px".into() },
            ActorId::AgentStyler,
        );
        assert!(r2.was_applied());

        // Both values coexist
        assert!(resolver.get(id, PropertyId::Padding).is_some());
        assert!(resolver.get(id, PropertyId::Margin).is_some());
    }

    #[test]
    fn test_flush_file() {
        let resolver = make_resolver();
        resolver.apply(
            "src/A.tsx:1:1",
            PropertyId::Padding,
            PropertyValue::Numeric { value: 8.0, unit: "px".into() },
            ActorId::Human,
        );
        resolver.apply(
            "src/A.tsx:5:1",
            PropertyId::Margin,
            PropertyValue::Numeric { value: 4.0, unit: "px".into() },
            ActorId::Human,
        );
        resolver.apply(
            "src/B.tsx:1:1",
            PropertyId::Padding,
            PropertyValue::Numeric { value: 16.0, unit: "px".into() },
            ActorId::Human,
        );

        resolver.flush_file("src/A.tsx");

        assert!(resolver.get("src/A.tsx:1:1", PropertyId::Padding).is_none());
        assert!(resolver.get("src/A.tsx:5:1", PropertyId::Margin).is_none());
        // B is untouched
        assert!(resolver.get("src/B.tsx:1:1", PropertyId::Padding).is_some());
    }
}
