//! # HMR Conductor — Fiber-Probe Guard (v2.6)
//!
//! Emits HMR signals to the frontend via WebSocket to trigger
//! hot updates without full page reloads.
//!
//! ## v2.6 Upgrade: Runtime Fiber Probing
//!
//! **The Problem:** Static AST scanning misses transitive side effects
//! (libraries patching globals like `window.__MY_SDK__`).
//!
//! **The Solution:** Abandon static analysis for Runtime Probing.
//! Use `__REACT_DEVTOOLS_GLOBAL_HOOK__` to walk the live React Fiber Tree.
//! If a component has `PassiveUnmountPending` or `ChildDeletion` flags,
//! trigger a Safe Reload instead of an HMR patch.

use serde::{Deserialize, Serialize};
use tracing::{debug, warn};

// ---------------------------------------------------------------------------
// HMR Signal (existing)
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize, Deserialize)]
pub struct HmrSignal {
    pub file: String,
    pub patch: String,
    pub __zenith_origin: bool,
    /// v2.6: Fiber probe decision attached to every HMR signal.
    pub decision: HmrDecision,
}

/// The decision made by the Fiber-Probe Guard.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum HmrDecision {
    /// Safe to apply HMR patch — no dangerous fiber flags detected.
    SafeToHmr,
    /// Must perform a full Safe Reload — dangerous flags detected.
    RequiresSafeReload { reason: String },
}

pub struct HmrConductor;

impl HmrConductor {
    pub fn create_signal(file: &str, patch: &str) -> HmrSignal {
        HmrSignal {
            file: file.to_string(),
            patch: patch.to_string(),
            __zenith_origin: true,
            decision: HmrDecision::SafeToHmr,
        }
    }

    /// Create an HMR signal with a Fiber-Probe guard check.
    ///
    /// The fiber tree is probed for dangerous flags. If any are found,
    /// the signal will carry `RequiresSafeReload` instead of `SafeToHmr`.
    pub fn create_guarded_signal(
        file: &str,
        patch: &str,
        fiber_tree: &FiberNode,
    ) -> HmrSignal {
        let probe_result = FiberProbeGuard::probe_tree(fiber_tree);
        HmrSignal {
            file: file.to_string(),
            patch: patch.to_string(),
            __zenith_origin: true,
            decision: probe_result,
        }
    }
}

// ---------------------------------------------------------------------------
// React Fiber Flags (mirrors React internals)
// ---------------------------------------------------------------------------

/// React Fiber effect flags that indicate unsafe-to-HMR states.
///
/// These map to React's internal `flags` field on Fiber nodes.
/// When present, they indicate the component has pending side effects
/// that HMR patching would corrupt.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FiberFlag {
    /// Passive effects (useEffect cleanup) are pending unmount.
    /// HMR patching over this would leak the old effect.
    PassiveUnmountPending,

    /// Child deletion is scheduled. HMR would leave orphaned DOM nodes.
    ChildDeletion,

    /// Layout effects (useLayoutEffect) are pending.
    LayoutEffectPending,

    /// Ref detach is pending. HMR would leave stale refs.
    RefDetach,

    /// Component is in a Suspense boundary fallback state.
    SuspenseFallback,
}

impl FiberFlag {
    /// Human-readable description for the Safe Reload reason.
    pub fn reason(&self) -> &'static str {
        match self {
            Self::PassiveUnmountPending => "Passive effect cleanup pending (useEffect teardown)",
            Self::ChildDeletion => "Child deletion scheduled (orphaned DOM risk)",
            Self::LayoutEffectPending => "Layout effect pending (useLayoutEffect)",
            Self::RefDetach => "Ref detach pending (stale ref risk)",
            Self::SuspenseFallback => "Component in Suspense fallback state",
        }
    }
}

// ---------------------------------------------------------------------------
// Fiber Node (simplified model)
// ---------------------------------------------------------------------------

/// A simplified model of a React Fiber node.
///
/// In production, this is populated by walking the fiber tree via
/// `__REACT_DEVTOOLS_GLOBAL_HOOK__` from the browser extension bridge.
/// The sidecar receives this data over the WebSocket IPC channel.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FiberNode {
    /// Component display name (e.g., "Button", "Header").
    pub display_name: String,
    /// Active flags on this fiber node.
    pub flags: Vec<u32>,
    /// Child fibers.
    pub children: Vec<FiberNode>,
}

// ---------------------------------------------------------------------------
// Fiber-Probe Guard
// ---------------------------------------------------------------------------

/// The Fiber-Probe Guard walks the live React Fiber tree and checks
/// for dangerous flags that would make HMR patching unsafe.
pub struct FiberProbeGuard;

impl FiberProbeGuard {
    /// Probe the fiber tree for dangerous flags.
    ///
    /// Returns `SafeToHmr` if no dangerous flags are found,
    /// or `RequiresSafeReload` with a reason if any are found.
    pub fn probe_tree(root: &FiberNode) -> HmrDecision {
        let mut dangerous_flags = Vec::new();
        Self::walk_tree(root, &mut dangerous_flags);

        if dangerous_flags.is_empty() {
            debug!("Fiber probe: tree is clean — safe to HMR");
            HmrDecision::SafeToHmr
        } else {
            let reasons: Vec<String> = dangerous_flags
                .iter()
                .map(|(name, flag)| format!("{}: {}", name, flag.reason()))
                .collect();
            let combined = reasons.join("; ");
            warn!("Fiber probe: dangerous flags detected — requiring Safe Reload: {}", combined);
            HmrDecision::RequiresSafeReload { reason: combined }
        }
    }

    /// Recursively walk the fiber tree, collecting dangerous flags.
    fn walk_tree<'a>(node: &'a FiberNode, dangerous: &mut Vec<(&'a str, FiberFlag)>) {
        for flag_value in &node.flags {
            if let Some(flag) = Self::decode_flag(*flag_value) {
                dangerous.push((&node.display_name, flag));
            }
        }

        for child in &node.children {
            Self::walk_tree(child, dangerous);
        }
    }

    /// Decode a raw React fiber flag value into our enum.
    ///
    /// These values mirror React's internal effect tag constants:
    /// - 0x0200: Passive (PassiveUnmountPending)
    /// - 0x0010: ChildDeletion
    /// - 0x0004: Update with layout effect
    /// - 0x0080: Ref
    /// - 0x4000: SuspenseComponent in fallback
    fn decode_flag(value: u32) -> Option<FiberFlag> {
        match value {
            0x0200 => Some(FiberFlag::PassiveUnmountPending),
            0x0010 => Some(FiberFlag::ChildDeletion),
            0x0004 => Some(FiberFlag::LayoutEffectPending),
            0x0080 => Some(FiberFlag::RefDetach),
            0x4000 => Some(FiberFlag::SuspenseFallback),
            _ => None,
        }
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn clean_fiber(name: &str, children: Vec<FiberNode>) -> FiberNode {
        FiberNode {
            display_name: name.to_string(),
            flags: vec![],
            children,
        }
    }

    fn flagged_fiber(name: &str, flags: Vec<u32>) -> FiberNode {
        FiberNode {
            display_name: name.to_string(),
            flags,
            children: vec![],
        }
    }

    #[test]
    fn test_safe_to_hmr_clean_tree() {
        let tree = clean_fiber("App", vec![
            clean_fiber("Header", vec![]),
            clean_fiber("Main", vec![
                clean_fiber("Button", vec![]),
            ]),
        ]);

        let result = FiberProbeGuard::probe_tree(&tree);
        assert_eq!(result, HmrDecision::SafeToHmr);
    }

    #[test]
    fn test_requires_reload_on_passive_unmount() {
        let tree = clean_fiber("App", vec![
            clean_fiber("Header", vec![]),
            flagged_fiber("DataFetcher", vec![0x0200]), // PassiveUnmountPending
        ]);

        let result = FiberProbeGuard::probe_tree(&tree);
        match result {
            HmrDecision::RequiresSafeReload { reason } => {
                assert!(reason.contains("Passive effect cleanup"));
                assert!(reason.contains("DataFetcher"));
            }
            _ => panic!("Expected RequiresSafeReload"),
        }
    }

    #[test]
    fn test_requires_reload_on_child_deletion() {
        let tree = clean_fiber("App", vec![
            flagged_fiber("DynamicList", vec![0x0010]), // ChildDeletion
        ]);

        let result = FiberProbeGuard::probe_tree(&tree);
        match result {
            HmrDecision::RequiresSafeReload { reason } => {
                assert!(reason.contains("Child deletion"));
            }
            _ => panic!("Expected RequiresSafeReload"),
        }
    }

    #[test]
    fn test_deep_nested_flag_detected() {
        let tree = clean_fiber("App", vec![
            clean_fiber("Layout", vec![
                clean_fiber("Sidebar", vec![
                    flagged_fiber("Widget", vec![0x4000]), // SuspenseFallback
                ]),
            ]),
        ]);

        let result = FiberProbeGuard::probe_tree(&tree);
        match result {
            HmrDecision::RequiresSafeReload { reason } => {
                assert!(reason.contains("Suspense fallback"));
                assert!(reason.contains("Widget"));
            }
            _ => panic!("Expected RequiresSafeReload"),
        }
    }

    #[test]
    fn test_multiple_dangerous_flags() {
        let tree = clean_fiber("App", vec![
            flagged_fiber("Timer", vec![0x0200]),     // PassiveUnmountPending
            flagged_fiber("Modal", vec![0x0010]),     // ChildDeletion
            flagged_fiber("Chart", vec![0x0004]),     // LayoutEffectPending
        ]);

        let result = FiberProbeGuard::probe_tree(&tree);
        match result {
            HmrDecision::RequiresSafeReload { reason } => {
                assert!(reason.contains("Timer"));
                assert!(reason.contains("Modal"));
                assert!(reason.contains("Chart"));
            }
            _ => panic!("Expected RequiresSafeReload"),
        }
    }

    #[test]
    fn test_unknown_flags_ignored() {
        let tree = clean_fiber("App", vec![
            flagged_fiber("Normal", vec![0xFFFF]), // Unknown flag
        ]);

        let result = FiberProbeGuard::probe_tree(&tree);
        assert_eq!(result, HmrDecision::SafeToHmr);
    }

    #[test]
    fn test_create_guarded_signal_safe() {
        let tree = clean_fiber("App", vec![]);
        let signal = HmrConductor::create_guarded_signal("src/App.tsx", "patch_data", &tree);
        assert_eq!(signal.decision, HmrDecision::SafeToHmr);
        assert!(signal.__zenith_origin);
    }

    #[test]
    fn test_create_guarded_signal_unsafe() {
        let tree = clean_fiber("App", vec![
            flagged_fiber("Leaker", vec![0x0200]),
        ]);
        let signal = HmrConductor::create_guarded_signal("src/App.tsx", "patch_data", &tree);
        assert!(matches!(signal.decision, HmrDecision::RequiresSafeReload { .. }));
    }
}
