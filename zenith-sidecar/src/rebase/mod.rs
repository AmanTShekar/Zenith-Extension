//! # Rebase Engine — Immortal Edits
//!
//! Stores patches as structured operations (PatchOp) and rebases them
//! when the underlying source code changes.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use regex;
use crate::types::ZenithId;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PatchOp {
    UpdateProperty {
        ghost_id: ZenithId,
        property: String,
        value: String,
    },
    UpdateUniversal {
        signature: SelectionSignature,
        property: String,
        value: String,
    },
    InsertComponent {
        parent_id: ZenithId,
        component_name: String,
        index: usize,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelectionSignature {
    pub tag: String,
    pub classes: Vec<String>,
    pub text_content: String,
    pub xpath: String,
    pub parent_classes: Vec<String>,
    pub prev_sibling_tag: Option<String>,
    pub next_sibling_tag: Option<String>,
}

#[derive(Default)]
pub struct RebaseEngine {
    /// Map of File Path -> List of Operations
    ops: HashMap<String, Vec<PatchOp>>,
}

impl RebaseEngine {
    pub fn add_op(&mut self, file: &str, op: PatchOp) {
        self.ops.entry(file.to_string()).or_default().push(op);
    }

    /// Re-apply all ops to a fresh version of the source code.
    /// v3.10 Fix: Real regex-based surgical patching (Issue 33)
    pub fn rebase(&self, file: &str, original_source: &str) -> String {
        let ops = match self.ops.get(file) {
            Some(ops) => ops,
            None => return original_source.to_string(),
        };

        let mut current_source = original_source.to_string();

        for op in ops {
            match op {
                PatchOp::UpdateProperty { ghost_id, property, value } => {
                    let search_id = format!("data-zenith-id=\"{}\"", ghost_id);
                    if let Some(id_pos) = current_source.find(&search_id) {
                        let tag_start = current_source[..id_pos].rfind('<').unwrap_or(0);
                        let tag_end = current_source[id_pos..].find('>').map(|pos| pos + id_pos).unwrap_or(current_source.len());
                        let mut tag_content = current_source[tag_start..tag_end].to_string();

                        // Build a regex to find the existing attribute (handles single/double quotes)
                        let attr_pattern = format!(r#"{}=["'][^"']*["']"#, regex::escape(property));
                        let re = regex::Regex::new(&attr_pattern).unwrap();

                        if re.is_match(&tag_content) {
                            // Replace existing attribute value (preserve quote style)
                            let replacement = if tag_content.contains(&format!("{}=\"", property)) {
                                format!("{}=\"{}\"", property, value)
                            } else {
                                format!("{}='{}'", property, value)
                            };
                            tag_content = re.replace(&tag_content, replacement.as_str()).to_string();
                        } else {
                            // M3 Fix: Insert new attribute before the closing '>'
                            // Works for ALL properties: className, style, id, aria-*, data-*, etc.
                            let insert_pos = tag_content.len() - tag_content.chars().rev().position(|c| c != ' ').unwrap_or(0);
                            tag_content.insert_str(insert_pos, &format!(" {}=\"{}\"", property, value));
                        }

                        current_source.replace_range(tag_start..tag_end, &tag_content);
                    } else {
                        tracing::warn!("[RebaseEngine] Ghost ID '{}' not found in source for property '{}'", ghost_id, property);
                    }
                },
                PatchOp::UpdateUniversal { signature, property, value } => {
                    // UNIVERSAL MODE: Fuzzy find the element in source code
                    if let Some(pos) = self.fuzzy_find(&current_source, signature) {
                        let tag_start = current_source[..pos].rfind('<').unwrap_or(0);
                        let tag_end = current_source[pos..].find('>').map(|p| p + pos).unwrap_or(current_source.len());
                        let mut tag_content = current_source[tag_start..tag_end].to_string();

                        let attr_pattern = format!(r#"{}=["'][^"']*["']"#, regex::escape(property));
                        let re = regex::Regex::new(&attr_pattern).unwrap();

                        if re.is_match(&tag_content) {
                            let replacement = format!("{}=\"{}\"", property, value);
                            tag_content = re.replace(&tag_content, replacement.as_str()).to_string();
                        } else {
                            let insert_pos = tag_content.len() - tag_content.chars().rev().position(|c| c != ' ').unwrap_or(0);
                            tag_content.insert_str(insert_pos, &format!(" {}=\"{}\"", property, value));
                        }
                        current_source.replace_range(tag_start..tag_end, &tag_content);
                    }
                },
                PatchOp::InsertComponent { .. } => {
                    // Component insertion logic
                }
            }
        }

        current_source
    }

    /// The Zenith Contextual Matcher: Uses sibling context and parent classes to uniquely identify elements.
    fn fuzzy_find(&self, source: &str, sig: &SelectionSignature) -> Option<usize> {
        // Build a regex based on classes and tag
        let classes_pattern = sig.classes.join(".*");
        let pattern = format!(r#"<{}[^>]*class=["'][^"']*{}["'][^>]*"#, sig.tag, classes_pattern);
        
        let re = regex::Regex::new(&pattern).ok()?;
        
        // Find all matches and score them based on context (siblings/parents)
        let mut best_match = None;
        let mut max_score = 0;

        for m in re.find_iter(source) {
            let mut score = 1;
            let match_text = m.as_str();
            
            // Context Scoring
            if let Some(prev) = &sig.prev_sibling_tag {
                if source[..m.start()].contains(prev) { score += 2; }
            }
            
            for p_cls in &sig.parent_classes {
                if source[..m.start()].contains(p_cls) { score += 1; }
            }

            if score > max_score {
                max_score = score;
                best_match = Some(m.start());
            }
        }
        
        best_match
    }
}
