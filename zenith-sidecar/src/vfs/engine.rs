use std::path::PathBuf;
use serde::{Deserialize, Serialize};
pub use crate::types::{TransactionId, TextEdit};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilePatch {
    pub file: PathBuf,
    pub edits: Vec<TextEdit>,
}

pub struct FileWrite {
    pub file: PathBuf,
    pub content: String,
}

use std::borrow::Cow;

pub fn apply_edits(content: &str, edits: &[TextEdit]) -> Result<String, anyhow::Error> {
    if edits.is_empty() {
        return Ok(content.to_string());
    }

    let mut lines: Vec<Cow<str>> = content.lines().map(Cow::Borrowed).collect();
    
    // Sort edits in reverse order to avoid index shift issues
    let mut sorted_edits = edits.to_vec();
    sorted_edits.sort_by(|a, b| {
        b.start_line.cmp(&a.start_line)
            .then(b.start_col.cmp(&a.start_col))
    });

    for edit in sorted_edits {
        let line_idx = (edit.start_line as usize).saturating_sub(1);
        if line_idx >= lines.len() { continue; }
        
        // Convert to owned String ONLY when we need to mutate it
        let line = lines[line_idx].to_mut();
        let start = (edit.start_col as usize).saturating_sub(1);
        let end = (edit.end_col as usize).saturating_sub(1);
        
        if start <= line.len() && end <= line.len() && start <= end {
            line.replace_range(start..end, &edit.new_text);
        }
    }

    Ok(lines.join("\n"))
}
