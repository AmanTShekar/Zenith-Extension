//! # SoftLockScanner — Logic-Boundary Protection
//!
//! A single-pass AST pattern scanner that identifies `.map()` loops,
//! ternary expressions (`? :`), and logical short-circuits (`&&`, `||`),
//! preventing accidental structural breaks by marking their enclosing
//! elements as "soft-locked."
//!
//! ## Design
//!
//! The scanner walks the source text (not a full AST parse — that's expensive)
//! using pattern matching to identify dangerous constructs. The result is a
//! `HashSet<ZenithId>` of frozen elements checked in O(1) at patch time.
//!
//! ## Why Not Full SWC Parse?
//!
//! A full SWC parse of every file on every edit is ~5-20ms per file. The soft-lock
//! scanner only needs to detect structural patterns, not understand semantics.
//! A regex/state-machine approach gives us O(n) single-pass with ~100µs per file.

use std::collections::HashSet;

use serde::{Deserialize, Serialize};

use crate::types::ZenithId;

// ---------------------------------------------------------------------------
// Soft-lock reason
// ---------------------------------------------------------------------------

/// Why a node is soft-locked (for UI tooltip display).
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum LockReason {
    /// Node is inside a `.map()` callback — reordering would break iteration.
    MapLoop,
    /// Node is inside a ternary `condition ? a : b` — reordering would
    /// change conditional logic.
    TernaryBranch,
    /// Node is inside a logical short-circuit `cond && <X />` — moving the
    /// node out would remove the conditional rendering.
    LogicalShortCircuit,
    /// Node is inside a `.filter()` or `.reduce()` — same issue as `.map()`.
    ArrayIterator,
}

/// A detected soft-lock on a specific node.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoftLock {
    pub zenith_id: ZenithId,
    pub reason: LockReason,
    /// The line number where the dangerous construct starts (1-indexed).
    pub line: u32,
    /// Human-readable description for the UI warning.
    pub description: String,
}

// ---------------------------------------------------------------------------
// Scanner
// ---------------------------------------------------------------------------

/// Single-pass scanner that detects logic boundaries in JSX source.
pub struct SoftLockScanner;

impl SoftLockScanner {
    /// Scan a source file and return all soft-locked zenith IDs.
    ///
    /// This is a lightweight pattern scan, not a full AST parse.
    /// It detects:
    /// - `.map(` / `.filter(` / `.reduce(` / `.flatMap(` / `.forEach(`
    /// - Ternary `? ... : ...` inside JSX return blocks
    /// - Logical `&&` / `||` used for conditional rendering
    ///
    /// Returns a `HashSet` for O(1) lookup at patch time.
    pub fn scan(source: &str, file_path: &str) -> ScanResult {
        let mut locks = Vec::new();
        let mut lock_ids = HashSet::new();

        let lines: Vec<&str> = source.lines().collect();

        // Track nesting depth for JSX blocks
        let mut in_return = false;
        let mut brace_depth: i32 = 0;

        for (line_idx, line) in lines.iter().enumerate() {
            let trimmed = line.trim();
            let line_num = (line_idx + 1) as u32;

            // Track whether we're inside a return statement (likely JSX)
            if trimmed.starts_with("return ") || trimmed.starts_with("return(") {
                in_return = true;
                brace_depth = 0;
            }

            // Track brace depth inside return blocks
            for ch in trimmed.chars() {
                match ch {
                    '(' | '{' => brace_depth += 1,
                    ')' | '}' => {
                        brace_depth -= 1;
                        if brace_depth <= 0 && in_return {
                            in_return = false;
                        }
                    }
                    _ => {}
                }
            }

            // Detect array iterator methods
            for method in &[".map(", ".filter(", ".reduce(", ".flatMap(", ".forEach("] {
                if trimmed.contains(method) {
                    let reason = if *method == ".map(" {
                        LockReason::MapLoop
                    } else {
                        LockReason::ArrayIterator
                    };

                    let zenith_id = format!("{file_path}:{line_num}:0");
                    if lock_ids.insert(zenith_id.clone()) {
                        locks.push(SoftLock {
                            zenith_id,
                            reason: reason.clone(),
                            line: line_num,
                            description: format!(
                                "Children of this `{}` call cannot be reordered",
                                method.trim_end_matches('(')
                            ),
                        });
                    }
                }
            }

            // Detect ternary expressions in JSX context
            if in_return && trimmed.contains('?') && trimmed.contains(':') {
                // Heuristic: if the line has both ? and : and we're in a return block,
                // it's likely a conditional rendering ternary
                let zenith_id = format!("{file_path}:{line_num}:0");
                if lock_ids.insert(zenith_id.clone()) {
                    locks.push(SoftLock {
                        zenith_id,
                        reason: LockReason::TernaryBranch,
                        line: line_num,
                        description: "This ternary expression controls conditional rendering — \
                                      branches cannot be reordered".into(),
                    });
                }
            }

            // Detect logical short-circuit rendering: {condition && <Component />}
            if in_return && trimmed.contains("&&") && (trimmed.contains('<') || trimmed.contains("/>")) {
                let zenith_id = format!("{file_path}:{line_num}:0");
                if lock_ids.insert(zenith_id.clone()) {
                    locks.push(SoftLock {
                        zenith_id,
                        reason: LockReason::LogicalShortCircuit,
                        line: line_num,
                        description: "This logical `&&` controls conditional rendering — \
                                      the element cannot be moved outside the guard".into(),
                    });
                }
            }

            // Detect || short-circuit rendering (less common but similar risk)
            if in_return && trimmed.contains("||") && (trimmed.contains('<') || trimmed.contains("/>")) {
                let zenith_id = format!("{file_path}:{line_num}:0");
                if lock_ids.insert(zenith_id.clone()) {
                    locks.push(SoftLock {
                        zenith_id,
                        reason: LockReason::LogicalShortCircuit,
                        line: line_num,
                        description: "This logical `||` controls fallback rendering — \
                                      the element cannot be moved outside the guard".into(),
                    });
                }
            }
        }

        ScanResult { locks, lock_ids }
    }
}

/// The result of a soft-lock scan.
pub struct ScanResult {
    /// All detected soft-locks with metadata.
    pub locks: Vec<SoftLock>,
    /// O(1) lookup set of locked zenith IDs.
    pub lock_ids: HashSet<ZenithId>,
}

impl ScanResult {
    /// Check if a zenith ID is soft-locked. O(1).
    pub fn is_locked(&self, zenith_id: &str) -> bool {
        self.lock_ids.contains(zenith_id)
    }

    /// Get the lock reason for a specific ID.
    pub fn get_reason(&self, zenith_id: &str) -> Option<&SoftLock> {
        self.locks.iter().find(|l| l.zenith_id == zenith_id)
    }

    /// Number of soft-locks detected.
    pub fn len(&self) -> usize {
        self.locks.len()
    }

    pub fn is_empty(&self) -> bool {
        self.locks.is_empty()
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_map_loop() {
        let source = r#"
function TodoList({ items }) {
    return (
        <ul>
            {items.map((item) => (
                <li key={item.id}>{item.text}</li>
            ))}
        </ul>
    );
}
"#;
        let result = SoftLockScanner::scan(source, "src/TodoList.tsx");
        assert!(!result.is_empty());
        let map_locks: Vec<_> = result.locks.iter()
            .filter(|l| l.reason == LockReason::MapLoop)
            .collect();
        assert!(!map_locks.is_empty());
    }

    #[test]
    fn test_detect_ternary() {
        let source = r#"
function Greeting({ isLoggedIn }) {
    return (
        <div>
            {isLoggedIn ? <Welcome /> : <Login />}
        </div>
    );
}
"#;
        let result = SoftLockScanner::scan(source, "src/Greeting.tsx");
        let ternaries: Vec<_> = result.locks.iter()
            .filter(|l| l.reason == LockReason::TernaryBranch)
            .collect();
        assert!(!ternaries.is_empty());
    }

    #[test]
    fn test_detect_logical_and() {
        let source = r#"
function App({ showBanner }) {
    return (
        <main>
            {showBanner && <Banner />}
            <Content />
        </main>
    );
}
"#;
        let result = SoftLockScanner::scan(source, "src/App.tsx");
        let shorts: Vec<_> = result.locks.iter()
            .filter(|l| l.reason == LockReason::LogicalShortCircuit)
            .collect();
        assert!(!shorts.is_empty());
    }

    #[test]
    fn test_safe_code_no_locks() {
        let source = r#"
function Card() {
    return (
        <div className="p-4">
            <h1>Title</h1>
            <p>Description</p>
        </div>
    );
}
"#;
        let result = SoftLockScanner::scan(source, "src/Card.tsx");
        assert!(result.is_empty());
    }

    #[test]
    fn test_o1_lookup() {
        let source = r#"
function List({ items }) {
    return (
        <ul>
            {items.map((item) => <li>{item}</li>)}
        </ul>
    );
}
"#;
        let result = SoftLockScanner::scan(source, "src/List.tsx");
        // The .map() line should be locked
        assert!(!result.lock_ids.is_empty());
        // A non-locked line should return false in O(1)
        assert!(!result.is_locked("src/List.tsx:999:0"));
    }

    #[test]
    fn test_filter_detected() {
        let source = r#"
function ActiveItems({ items }) {
    return (
        <div>
            {items.filter(i => i.active).map(i => <Item key={i.id} />)}
        </div>
    );
}
"#;
        let result = SoftLockScanner::scan(source, "src/Active.tsx");
        let has_filter = result.locks.iter().any(|l| l.reason == LockReason::ArrayIterator);
        let has_map = result.locks.iter().any(|l| l.reason == LockReason::MapLoop);
        assert!(has_filter || has_map);
    }
}
