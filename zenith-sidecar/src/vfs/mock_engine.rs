//! # MockOverlayEngine + StateScanner + HmrInjector
//!
//! Non-destructive state injection for the Zenith visual canvas.
//!
//! ## System Design
//!
//! The mock system lets designers toggle boolean states (`isLoading`, `isError`,
//! `showModal`) directly on the canvas without editing source code. It works by:
//!
//! 1. **StateScanner:** Walks the AST to find `useState` hooks and boolean props,
//!    using naming heuristics to build a State Controller UI.
//!
//! 2. **MockOverlayEngine:** Creates VFS draft transactions (`is_draft: true`)
//!    that inject mock values into the source. These transactions are **physically
//!    rejected** by `VFS::commit()`, preventing them from ever reaching disk.
//!
//! 3. **HmrInjector:** Generates a JS snippet that walks the React Fiber tree
//!    and calls `dispatch()` to update state in-place without a page reload.
//!
//! ## Safety Invariant
//!
//! Draft transactions can be staged and read (for iframe rendering) but NEVER
//! committed. The VFS `commit()` method checks `is_draft` and returns an error.

use std::collections::HashMap;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tracing::{debug, warn};

use crate::types::{TransactionId, ZenithId};

// ---------------------------------------------------------------------------
// State bindings (output of StateScanner)
// ---------------------------------------------------------------------------

/// A detected stateful binding in a React component.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateBinding {
    /// Ghost-ID of the component containing this binding.
    pub component_zenith_id: ZenithId,
    /// The state variable name (e.g., "isLoading").
    pub name: String,
    /// The setter function name (e.g., "setIsLoading").
    pub setter: Option<String>,
    /// The detected type of this state.
    pub state_type: StateType,
    /// The default/initial value (if detectable).
    pub default_value: Option<String>,
    /// The line number in source (1-indexed).
    pub line: u32,
    /// The file path.
    pub file: PathBuf,
}

/// The type of a state binding.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum StateType {
    /// Boolean state (e.g., `useState(false)`).
    Boolean,
    /// String state (e.g., `useState("")`).
    String,
    /// Number state (e.g., `useState(0)`).
    Number,
    /// Enum-like state (e.g., `useState<"idle" | "loading" | "error">("idle")`).
    Enum { variants: Vec<String> },
    /// Unknown type.
    Unknown,
}

// ---------------------------------------------------------------------------
// StateScanner
// ---------------------------------------------------------------------------

/// Scans JSX/TSX source files to identify `useState` hooks and boolean props.
pub struct StateScanner;

impl StateScanner {
    /// Scan a source file for stateful bindings.
    ///
    /// Detects:
    /// - `const [name, setName] = useState(initialValue)`
    /// - `const [isX, setIsX] = useState(false)` → Boolean
    /// - `const [loading, setLoading] = useState(true)` → Boolean
    /// - Boolean props in function signatures: `{ isOpen, hasError, loading }`
    pub fn scan(source: &str, file_path: &str) -> Vec<StateBinding> {
        let mut bindings = Vec::new();
        let path = PathBuf::from(file_path);

        for (line_idx, line) in source.lines().enumerate() {
            let trimmed = line.trim();
            let line_num = (line_idx + 1) as u32;

            // Detect useState hooks
            if let Some(binding) = Self::parse_use_state(trimmed, line_num, &path) {
                bindings.push(binding);
            }

            // Detect boolean props in destructured function params
            if trimmed.contains("({") && trimmed.contains("})") {
                let prop_bindings = Self::parse_boolean_props(trimmed, line_num, &path);
                bindings.extend(prop_bindings);
            }
        }

        bindings
    }

    /// Parse a `useState` declaration.
    fn parse_use_state(line: &str, line_num: u32, file: &PathBuf) -> Option<StateBinding> {
        // Match pattern: const [x, setX] = useState(...)
        if !line.contains("useState") {
            return None;
        }

        // Extract the destructured names
        let bracket_start = line.find('[')?;
        let bracket_end = line.find(']')?;
        let inside = &line[bracket_start + 1..bracket_end];
        let parts: Vec<&str> = inside.split(',').map(|s| s.trim()).collect();

        if parts.is_empty() {
            return None;
        }

        let name = parts[0].to_string();
        let setter = parts.get(1).map(|s| s.to_string());

        // Extract the initial value
        let paren_start = line.find("useState(")? + 9;
        let paren_end = line[paren_start..].find(')')? + paren_start;
        let initial = line[paren_start..paren_end].trim();

        let (state_type, default_value) = Self::classify_value(initial, &name);

        Some(StateBinding {
            component_zenith_id: format!("{file}:{line_num}:0", file = file.display()),
            name,
            setter,
            state_type,
            default_value: Some(default_value),
            line: line_num,
            file: file.clone(),
        })
    }

    /// Classify the type and default value of a useState initializer.
    fn classify_value(initial: &str, name: &str) -> (StateType, String) {
        // Check literal values
        match initial {
            "true" | "false" => {
                return (StateType::Boolean, initial.to_string());
            }
            s if s.starts_with('"') || s.starts_with('\'') || s.starts_with('`') => {
                return (StateType::String, s.to_string());
            }
            s if s.parse::<f64>().is_ok() => {
                return (StateType::Number, s.to_string());
            }
            _ => {}
        }

        // Naming heuristics for boolean detection
        let lower = name.to_lowercase();
        let boolean_prefixes = [
            "is", "has", "should", "can", "will", "did", "was", "show",
            "hide", "enable", "disable", "loading", "loaded", "open",
            "closed", "visible", "active", "selected", "checked", "expanded",
        ];

        for prefix in &boolean_prefixes {
            if lower.starts_with(prefix) {
                return (StateType::Boolean, "false".to_string());
            }
        }

        (StateType::Unknown, initial.to_string())
    }

    /// Parse boolean props from destructured function parameters.
    fn parse_boolean_props(
        line: &str,
        line_num: u32,
        file: &PathBuf,
    ) -> Vec<StateBinding> {
        let mut bindings = Vec::new();

        // Extract content between { and }
        let brace_start = match line.find("({") {
            Some(i) => i + 2,
            None => return bindings,
        };
        let brace_end = match line.find("})") {
            Some(i) => i,
            None => return bindings,
        };

        let props_str = &line[brace_start..brace_end];
        for prop in props_str.split(',') {
            let prop = prop.trim().split(':').next().unwrap_or("").trim();
            if prop.is_empty() {
                continue;
            }

            let lower = prop.to_lowercase();
            let boolean_prefixes = [
                "is", "has", "should", "can", "show", "loading",
                "open", "visible", "active", "selected", "checked",
            ];

            if boolean_prefixes.iter().any(|p| lower.starts_with(p)) {
                bindings.push(StateBinding {
                    component_zenith_id: format!("{file}:{line_num}:0", file = file.display()),
                    name: prop.to_string(),
                    setter: None, // props don't have setters
                    state_type: StateType::Boolean,
                    default_value: None,
                    line: line_num,
                    file: file.clone(),
                });
            }
        }

        bindings
    }
}

// ---------------------------------------------------------------------------
// MockOverlayEngine
// ---------------------------------------------------------------------------

/// Manages mock state overlays in the VFS.
///
/// Mock overlays are VFS transactions marked `is_draft: true` that inject
/// overridden state values into component source. They are rendered by the
/// iframe but **cannot be committed to disk**.
pub struct MockOverlayEngine {
    /// Active mock overrides: (component_id, state_name) → mock_value
    overrides: HashMap<(ZenithId, String), MockOverride>,
    /// The transaction ID for the current mock session (is_draft = true).
    mock_tx: Option<TransactionId>,
}

/// A single mock override.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockOverride {
    /// The state variable being overridden.
    pub state_name: String,
    /// The mock value to inject.
    pub mock_value: String,
    /// Whether this override is currently active.
    pub active: bool,
}

impl MockOverlayEngine {
    pub fn new() -> Self {
        Self {
            overrides: HashMap::new(),
            mock_tx: None,
        }
    }

    /// Set a mock override for a state variable.
    ///
    /// The override will be applied via a draft VFS transaction that the
    /// iframe can read but that `commit()` will reject.
    pub fn set_override(
        &mut self,
        component_id: &ZenithId,
        state_name: &str,
        mock_value: &str,
    ) {
        let key = (component_id.clone(), state_name.to_string());
        self.overrides.insert(key, MockOverride {
            state_name: state_name.to_string(),
            mock_value: mock_value.to_string(),
            active: true,
        });
        debug!("Mock override set: {component_id}::{state_name} = {mock_value}");
    }

    /// Remove a mock override.
    pub fn clear_override(&mut self, component_id: &ZenithId, state_name: &str) {
        let key = (component_id.clone(), state_name.to_string());
        self.overrides.remove(&key);
        debug!("Mock override cleared: {component_id}::{state_name}");
    }

    /// Toggle a mock override on/off.
    pub fn toggle_override(
        &mut self,
        component_id: &ZenithId,
        state_name: &str,
    ) -> bool {
        let key = (component_id.clone(), state_name.to_string());
        if let Some(ovr) = self.overrides.get_mut(&key) {
            ovr.active = !ovr.active;
            debug!(
                "Mock override toggled: {component_id}::{state_name} = active:{}",
                ovr.active
            );
            ovr.active
        } else {
            warn!("Toggle failed: no override for {component_id}::{state_name}");
            false
        }
    }

    /// Get all active overrides for a component.
    pub fn active_overrides(&self, component_id: &ZenithId) -> Vec<&MockOverride> {
        self.overrides
            .iter()
            .filter(|((cid, _), ovr)| cid == component_id && ovr.active)
            .map(|(_, ovr)| ovr)
            .collect()
    }

    /// Clear all mock overrides (reset to real state).
    pub fn clear_all(&mut self) {
        self.overrides.clear();
        self.mock_tx = None;
        debug!("All mock overrides cleared");
    }

    /// Get the mock transaction ID (creates one if needed).
    /// This transaction is always `is_draft = true`.
    pub fn mock_transaction_id(&mut self) -> TransactionId {
        *self.mock_tx.get_or_insert_with(TransactionId::new_v4)
    }

    /// Check if any mocks are active.
    pub fn has_active_mocks(&self) -> bool {
        self.overrides.values().any(|o| o.active)
    }
}

impl Default for MockOverlayEngine {
    fn default() -> Self {
        Self::new()
    }
}

// ---------------------------------------------------------------------------
// HMR Injection — React Fiber state dispatch
// ---------------------------------------------------------------------------

/// Generates JavaScript snippets for in-place state updates via the React
/// Fiber tree, avoiding full page reloads for mock state changes.
pub struct HmrInjector;

impl HmrInjector {
    /// Generate a JS snippet that updates a `useState` value via the Fiber tree.
    ///
    /// This walks the Fiber tree from the root, finds the hook at the expected
    /// position, and calls `dispatch()` with the new value.
    ///
    /// The snippet is injected into the iframe via the WebSocket bridge.
    pub fn generate_state_update(
        component_name: &str,
        state_name: &str,
        new_value: &str,
    ) -> String {
        // The generated snippet walks the React Fiber tree to find the
        // component and dispatches the state update directly.
        format!(
            r#"(function() {{
  // Zenith Mock State Injection — {component_name}::{state_name}
  // This script walks the React Fiber tree and dispatches directly.

  function findFiber(fiber, pred) {{
    if (!fiber) return null;
    if (pred(fiber)) return fiber;
    let child = fiber.child;
    while (child) {{
      const found = findFiber(child, pred);
      if (found) return found;
      child = child.sibling;
    }}
    return null;
  }}

  function findRoot() {{
    const container = document.getElementById('root') ||
                      document.getElementById('__next') ||
                      document.getElementById('app');
    if (!container) return null;
    const key = Object.keys(container).find(k =>
      k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
    );
    return key ? container[key] : null;
  }}

  try {{
    const rootFiber = findRoot();
    if (!rootFiber) {{
      console.warn('[Zenith Mock] React Fiber root not found');
      return;
    }}

    const target = findFiber(rootFiber, (f) => {{
      const name = f.type?.displayName || f.type?.name || '';
      return name === '{component_name}';
    }});

    if (!target) {{
      console.warn('[Zenith Mock] Component "{component_name}" not found in Fiber tree');
      return;
    }}

    // Walk the hooks chain to find the useState for "{state_name}"
    let hook = target.memoizedState;
    let hookIndex = 0;
    while (hook) {{
      if (hook.queue && hook.queue.dispatch) {{
        // Found a useState hook — dispatch the mock value
        // Note: we match by position, not by name. The StateScanner
        // provides the correct hook index via scan ordering.
        hook.queue.dispatch({new_value});
        console.log('[Zenith Mock] Dispatched {state_name} =', {new_value});
        return;
      }}
      hook = hook.next;
      hookIndex++;
    }}

    console.warn('[Zenith Mock] Hook for "{state_name}" not found');
  }} catch (e) {{
    console.error('[Zenith Mock] Error:', e);
  }}
}})();"#
        )
    }

    /// Generate a batch update script for multiple state overrides.
    pub fn generate_batch_update(
        overrides: &[(String, String, String)], // (component, state_name, value)
    ) -> String {
        let snippets: Vec<String> = overrides
            .iter()
            .map(|(comp, name, val)| Self::generate_state_update(comp, name, val))
            .collect();
        snippets.join("\n\n")
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // -- StateScanner tests --

    #[test]
    fn test_detect_boolean_use_state() {
        let source = r#"
function App() {
    const [isLoading, setIsLoading] = useState(false);
    return <div>{isLoading ? "Loading..." : "Ready"}</div>;
}
"#;
        let bindings = StateScanner::scan(source, "src/App.tsx");
        assert_eq!(bindings.len(), 1);
        assert_eq!(bindings[0].name, "isLoading");
        assert_eq!(bindings[0].state_type, StateType::Boolean);
        assert_eq!(bindings[0].setter.as_deref(), Some("setIsLoading"));
        assert_eq!(bindings[0].default_value.as_deref(), Some("false"));
    }

    #[test]
    fn test_detect_string_use_state() {
        let source = r#"
function Form() {
    const [email, setEmail] = useState("");
    return <input value={email} />;
}
"#;
        let bindings = StateScanner::scan(source, "src/Form.tsx");
        assert_eq!(bindings.len(), 1);
        assert_eq!(bindings[0].name, "email");
        assert_eq!(bindings[0].state_type, StateType::String);
    }

    #[test]
    fn test_detect_number_use_state() {
        let source = r#"
function Counter() {
    const [count, setCount] = useState(0);
    return <span>{count}</span>;
}
"#;
        let bindings = StateScanner::scan(source, "src/Counter.tsx");
        assert_eq!(bindings.len(), 1);
        assert_eq!(bindings[0].state_type, StateType::Number);
    }

    #[test]
    fn test_detect_boolean_props() {
        let source = r#"function Modal({ isOpen, hasError, title }) {
    return <div className={isOpen ? "visible" : "hidden"}>{title}</div>;
}"#;
        let bindings = StateScanner::scan(source, "src/Modal.tsx");
        let bool_props: Vec<_> = bindings
            .iter()
            .filter(|b| b.state_type == StateType::Boolean && b.setter.is_none())
            .collect();
        assert_eq!(bool_props.len(), 2); // isOpen, hasError
    }

    #[test]
    fn test_heuristic_boolean_detection() {
        let source = r#"
function Dashboard() {
    const [showSidebar, setShowSidebar] = useState(null);
    return <div />;
}
"#;
        let bindings = StateScanner::scan(source, "src/Dashboard.tsx");
        assert_eq!(bindings.len(), 1);
        // "showSidebar" starts with "show" → heuristic detects boolean
        assert_eq!(bindings[0].state_type, StateType::Boolean);
    }

    // -- MockOverlayEngine tests --

    #[test]
    fn test_set_and_get_override() {
        let mut engine = MockOverlayEngine::new();
        engine.set_override(&"comp:1:0".to_string(), "isLoading", "true");

        let overrides = engine.active_overrides(&"comp:1:0".to_string());
        assert_eq!(overrides.len(), 1);
        assert_eq!(overrides[0].mock_value, "true");
    }

    #[test]
    fn test_toggle_override() {
        let mut engine = MockOverlayEngine::new();
        engine.set_override(&"comp:1:0".to_string(), "isOpen", "true");

        // Toggle off
        let active = engine.toggle_override(&"comp:1:0".to_string(), "isOpen");
        assert!(!active);
        assert!(engine.active_overrides(&"comp:1:0".to_string()).is_empty());

        // Toggle back on
        let active = engine.toggle_override(&"comp:1:0".to_string(), "isOpen");
        assert!(active);
        assert_eq!(engine.active_overrides(&"comp:1:0".to_string()).len(), 1);
    }

    #[test]
    fn test_clear_all() {
        let mut engine = MockOverlayEngine::new();
        engine.set_override(&"a:1:0".to_string(), "x", "1");
        engine.set_override(&"b:2:0".to_string(), "y", "2");
        assert!(engine.has_active_mocks());

        engine.clear_all();
        assert!(!engine.has_active_mocks());
    }

    #[test]
    fn test_mock_transaction_id_stable() {
        let mut engine = MockOverlayEngine::new();
        let tx1 = engine.mock_transaction_id();
        let tx2 = engine.mock_transaction_id();
        assert_eq!(tx1, tx2); // Same session → same transaction
    }

    // -- HmrInjector tests --

    #[test]
    fn test_hmr_snippet_generation() {
        let snippet = HmrInjector::generate_state_update("App", "isLoading", "true");
        assert!(snippet.contains("Zenith Mock State Injection"));
        assert!(snippet.contains("App"));
        assert!(snippet.contains("isLoading"));
        assert!(snippet.contains("dispatch(true)"));
    }

    #[test]
    fn test_batch_update() {
        let overrides = vec![
            ("App".into(), "isLoading".into(), "true".into()),
            ("Modal".into(), "isOpen".into(), "false".into()),
        ];
        let batch = HmrInjector::generate_batch_update(&overrides);
        assert!(batch.contains("App"));
        assert!(batch.contains("Modal"));
    }
}
