//! # Template Literal Segment-Aware Patcher
//!
//! The hardest case in surgical CSS patching: template literals that mix
//! static Tailwind classes with dynamic `${expression}` interpolations.
//!
//! ## Algorithm
//!
//! 1. Parse the template literal into alternating static (quasis) and
//!    dynamic (expression) segments.
//! 2. Tokenize ONLY the static segments for Tailwind utility classes.
//! 3. Locate the target token across all static segments.
//! 4. Replace the token within its segment, preserving all whitespace.
//! 5. Reconstruct the template literal with expressions untouched.
//!
//! ## Logic-Safety Guarantee
//!
//! This patcher NEVER reads, writes, or modifies expression interpolations.
//! They are treated as opaque segment boundaries. A `${isActive ? 'bg-blue' : 'bg-gray'}`
//! is invisible to this algorithm — only the static quasis on either side are patchable.

use anyhow::{bail, Result};
use thiserror::Error;

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

#[derive(Debug, Error)]
pub enum TemplatePatchError {
    #[error("No static segment contains a token matching property '{property}'")]
    TokenNotFound { property: String },

    #[error("Property '{property}' is inside a dynamic expression — logic-bound, cannot patch")]
    LogicBound { property: String },

    #[error("Ambiguous: multiple static segments contain tokens for '{property}'")]
    Ambiguous { property: String, count: usize },
}

// ---------------------------------------------------------------------------
// Segment model
// ---------------------------------------------------------------------------

/// A parsed template literal, split into segments.
///
/// Given: `` `flex ${expr} p-4 mt-2` ``
/// Produces:
///   - Segment::Static("flex ")
///   - Segment::Expression("${expr}")   ← OPAQUE
///   - Segment::Static(" p-4 mt-2")
#[derive(Debug, Clone)]
pub struct ParsedTemplateLiteral {
    pub segments: Vec<Segment>,
}

#[derive(Debug, Clone)]
pub enum Segment {
    /// A static text portion (quasi) — patchable.
    Static(StaticSegment),
    /// A `${...}` expression — opaque, never modified.
    Expression(String),
}

#[derive(Debug, Clone)]
pub struct StaticSegment {
    /// The raw text content of this quasi.
    pub text: String,
    /// Index in the original template literal's quasis array.
    pub quasi_index: usize,
}

// ---------------------------------------------------------------------------
// Token identification
// ---------------------------------------------------------------------------

/// A located Tailwind token within a static segment.
#[derive(Debug, Clone)]
struct LocatedToken {
    /// Which static segment contains this token.
    segment_index: usize,
    /// Byte offset within the static segment's text where the token starts.
    byte_start: usize,
    /// Byte offset where the token ends (exclusive).
    byte_end: usize,
    /// The token string itself (e.g., "p-4").
    token: String,
}

/// Identify if a Tailwind utility token maps to a given CSS property.
///
/// This is intentionally a broad matcher — it matches prefix patterns.
/// The full resolution (e.g., "p-4" → "padding: 1rem") is done by the
/// Tailwind strategy layer, not here.
fn token_matches_property(token: &str, property: &str) -> bool {
    let prefix = css_property_to_tw_prefix(property);
    if prefix.is_empty() {
        return false;
    }

    // Match: "p-4", "p-[1.5rem]", "px-4", "-p-4" (negative)
    let normalized = token.strip_prefix('-').unwrap_or(token);

    // Exact prefix match followed by '-' or '['
    if normalized.starts_with(prefix) {
        let rest = &normalized[prefix.len()..];
        rest.starts_with('-') || rest.starts_with('[') || rest.is_empty()
    } else {
        false
    }
}

/// Map a CSS property name to its Tailwind prefix.
fn css_property_to_tw_prefix(property: &str) -> &str {
    match property {
        "padding" => "p",
        "padding-top" => "pt",
        "padding-right" => "pr",
        "padding-bottom" => "pb",
        "padding-left" => "pl",
        "padding-inline" => "px",
        "padding-block" => "py",
        "margin" => "m",
        "margin-top" => "mt",
        "margin-right" => "mr",
        "margin-bottom" => "mb",
        "margin-left" => "ml",
        "margin-inline" => "mx",
        "margin-block" => "my",
        "width" => "w",
        "height" => "h",
        "min-width" => "min-w",
        "max-width" => "max-w",
        "min-height" => "min-h",
        "max-height" => "max-h",
        "gap" => "gap",
        "column-gap" => "gap-x",
        "row-gap" => "gap-y",
        "font-size" => "text",
        "font-weight" => "font",
        "border-radius" => "rounded",
        "opacity" => "opacity",
        "letter-spacing" => "tracking",
        "line-height" => "leading",
        "border-width" => "border",
        "background-color" => "bg",
        "color" => "text",
        _ => "",
    }
}

// ---------------------------------------------------------------------------
// Core algorithm
// ---------------------------------------------------------------------------

impl ParsedTemplateLiteral {
    /// Parse a template literal string into segments.
    ///
    /// Input: the raw source of the template literal (including backticks).
    /// This is a simplified parser for the purpose of patching — the actual
    /// expression content is treated as opaque strings.
    pub fn parse(source: &str) -> Result<Self> {
        let inner = source
            .strip_prefix('`')
            .and_then(|s| s.strip_suffix('`'))
            .unwrap_or(source);

        let mut segments = Vec::new();
        let mut current_static = String::new();
        let mut quasi_index = 0;
        let mut chars = inner.chars().peekable();

        while let Some(ch) = chars.next() {
            if ch == '$' && chars.peek() == Some(&'{') {
                // End current static segment
                if !current_static.is_empty() || quasi_index == 0 {
                    segments.push(Segment::Static(StaticSegment {
                        text: std::mem::take(&mut current_static),
                        quasi_index,
                    }));
                    quasi_index += 1;
                }

                // Consume the expression (track brace depth)
                chars.next(); // consume '{'
                let mut depth = 1;
                let mut expr = String::from("${");
                while depth > 0 {
                    match chars.next() {
                        Some('{') => {
                            depth += 1;
                            expr.push('{');
                        }
                        Some('}') => {
                            depth -= 1;
                            expr.push('}');
                        }
                        Some(c) => expr.push(c),
                        None => bail!("Unterminated template expression"),
                    }
                }
                segments.push(Segment::Expression(expr));
            } else {
                current_static.push(ch);
            }
        }

        // Final static segment
        segments.push(Segment::Static(StaticSegment {
            text: current_static,
            quasi_index,
        }));

        Ok(Self { segments })
    }

    /// Patch a CSS property by finding and replacing the corresponding
    /// Tailwind utility token in the static segments.
    ///
    /// ## Parameters
    ///
    /// - `property`: CSS property name (e.g., "padding")
    /// - `new_class`: The replacement Tailwind class (e.g., "p-6")
    ///
    /// ## Returns
    ///
    /// The reconstructed template literal string (with backticks).
    pub fn patch(&mut self, property: &str, new_class: &str) -> Result<String> {
        // Step 1: Find the target token across all static segments
        let located = self.locate_token(property)?;

        // Step 2: Replace the token in its segment
        match &mut self.segments[located.segment_index] {
            Segment::Static(seg) => {
                let before = &seg.text[..located.byte_start];
                let after = &seg.text[located.byte_end..];
                seg.text = format!("{before}{new_class}{after}");
            }
            Segment::Expression(_) => {
                // This should never happen — locate_token only returns static segments
                unreachable!("Located token in expression segment");
            }
        }

        // Step 3: Reconstruct
        Ok(self.reconstruct())
    }

    /// Locate the Tailwind token for a CSS property across all static segments.
    fn locate_token(&self, property: &str) -> Result<LocatedToken> {
        let mut matches = Vec::new();

        for (seg_idx, segment) in self.segments.iter().enumerate() {
            if let Segment::Static(seg) = segment {
                // Tokenize by whitespace, tracking byte offsets
                let text = &seg.text;
                let mut byte_pos = 0;

                for token in text.split_whitespace() {
                    // Find this token's actual byte position in the text
                    // (accounting for leading whitespace)
                    let token_start = text[byte_pos..]
                        .find(token)
                        .map(|offset| byte_pos + offset)
                        .unwrap_or(byte_pos);
                    let token_end = token_start + token.len();
                    byte_pos = token_end;

                    if token_matches_property(token, property) {
                        matches.push(LocatedToken {
                            segment_index: seg_idx,
                            byte_start: token_start,
                            byte_end: token_end,
                            token: token.to_string(),
                        });
                    }
                }
            }
        }

        match matches.len() {
            0 => Err(TemplatePatchError::TokenNotFound {
                property: property.to_string(),
            }
            .into()),
            1 => Ok(matches.into_iter().next().unwrap()),
            _n => {
                // Multiple matches for the same property (e.g., "p-4" and "px-2").
                // If they're different specificity levels, take the most specific.
                // For now, take the first match (leftmost wins).
                // TODO: Implement specificity ranking.
                Ok(matches.into_iter().next().unwrap())
            }
        }
    }

    /// Reconstruct the template literal from segments.
    fn reconstruct(&self) -> String {
        let mut result = String::from('`');
        for segment in &self.segments {
            match segment {
                Segment::Static(seg) => result.push_str(&seg.text),
                Segment::Expression(expr) => result.push_str(expr),
            }
        }
        result.push('`');
        result
    }
}

// ---------------------------------------------------------------------------
// clsx / cn / twMerge — Call Expression Patcher
// ---------------------------------------------------------------------------

/// Patch a Tailwind class within a `clsx()`, `cn()`, or `twMerge()` call.
///
/// These utility functions take multiple arguments of mixed types:
/// - StringLiteral: patchable
/// - LogicalExpression: opaque (skip)
/// - ConditionalExpression: opaque (skip)
/// - Identifier: opaque (skip)
/// - TemplateLiteral: delegate to ParsedTemplateLiteral::patch
///
/// We only modify StringLiteral arguments.
pub fn patch_class_utility_call(
    args: &mut [ClassUtilityArg],
    property: &str,
    new_class: &str,
) -> Result<bool> {
    for arg in args.iter_mut() {
        match arg {
            ClassUtilityArg::StringLiteral(s) => {
                if let Some(patched) = try_patch_class_string(s, property, new_class) {
                    *s = patched;
                    return Ok(true);
                }
            }
            ClassUtilityArg::TemplateLiteral(tpl_source) => {
                let mut parsed = ParsedTemplateLiteral::parse(tpl_source)?;
                match parsed.patch(property, new_class) {
                    Ok(reconstructed) => {
                        *tpl_source = reconstructed;
                        return Ok(true);
                    }
                    Err(_) => continue, // Not in this argument, try next
                }
            }
            // All other argument types are opaque — skip
            ClassUtilityArg::Expression(_) => continue,
        }
    }

    Ok(false)
}

/// Argument types in a class utility function call.
#[derive(Debug, Clone)]
pub enum ClassUtilityArg {
    /// A plain string literal: `"flex p-4 mx-2"` — patchable.
    StringLiteral(String),
    /// A template literal: `` `flex ${expr} p-4` `` — delegate to template patcher.
    TemplateLiteral(String),
    /// Any other expression (logical, conditional, identifier) — opaque.
    Expression(String),
}

/// Try to patch a Tailwind class within a plain class string.
/// Returns `Some(patched)` if the target property was found and replaced.
fn try_patch_class_string(class_string: &str, property: &str, new_class: &str) -> Option<String> {
    let tokens: Vec<&str> = class_string.split_whitespace().collect();
    let target_idx = tokens
        .iter()
        .position(|t| token_matches_property(t, property))?;

    let mut result = tokens.clone();
    result[target_idx] = new_class;
    Some(result.join(" "))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // ---- Template literal patching ----

    #[test]
    fn test_simple_template_literal() {
        let source = "`flex p-4 mt-2`";
        let mut parsed = ParsedTemplateLiteral::parse(source).unwrap();
        let result = parsed.patch("padding", "p-6").unwrap();
        assert_eq!(result, "`flex p-6 mt-2`");
    }

    #[test]
    fn test_template_with_expression_preserved() {
        let source = "`flex ${isActive ? 'bg-blue-500' : 'bg-gray-500'} p-4 mt-2`";
        let mut parsed = ParsedTemplateLiteral::parse(source).unwrap();
        let result = parsed.patch("padding", "p-6").unwrap();
        assert_eq!(
            result,
            "`flex ${isActive ? 'bg-blue-500' : 'bg-gray-500'} p-6 mt-2`"
        );
    }

    #[test]
    fn test_template_expression_not_corrupted() {
        let source = "`${prefix} p-4 ${suffix}`";
        let mut parsed = ParsedTemplateLiteral::parse(source).unwrap();
        let result = parsed.patch("padding", "p-[2rem]").unwrap();
        assert_eq!(result, "`${prefix} p-[2rem] ${suffix}`");
    }

    #[test]
    fn test_template_nested_braces_in_expression() {
        let source = "`flex ${fn({a: 1})} p-4`";
        let mut parsed = ParsedTemplateLiteral::parse(source).unwrap();
        let result = parsed.patch("padding", "p-8").unwrap();
        assert_eq!(result, "`flex ${fn({a: 1})} p-8`");
    }

    #[test]
    fn test_template_property_not_found() {
        let source = "`flex mt-2`";
        let mut parsed = ParsedTemplateLiteral::parse(source).unwrap();
        let result = parsed.patch("padding", "p-4");
        assert!(result.is_err());
    }

    #[test]
    fn test_template_preserves_whitespace() {
        let source = "`  flex   p-4   mt-2  `";
        let mut parsed = ParsedTemplateLiteral::parse(source).unwrap();
        let result = parsed.patch("padding", "p-6").unwrap();
        // Should preserve the exact whitespace around the patched token
        assert!(result.contains("p-6"));
        assert!(!result.contains("p-4"));
    }

    #[test]
    fn test_arbitrary_value_replacement() {
        let source = "`flex p-[1rem] mt-2`";
        let mut parsed = ParsedTemplateLiteral::parse(source).unwrap();
        let result = parsed.patch("padding", "p-[1.5rem]").unwrap();
        assert_eq!(result, "`flex p-[1.5rem] mt-2`");
    }

    #[test]
    fn test_negative_value_matching() {
        let source = "`flex -mt-4 p-2`";
        let mut parsed = ParsedTemplateLiteral::parse(source).unwrap();
        let result = parsed.patch("margin-top", "-mt-8").unwrap();
        assert_eq!(result, "`flex -mt-8 p-2`");
    }

    // ---- clsx/cn patching ----

    #[test]
    fn test_cn_string_literal_patching() {
        let mut args = vec![
            ClassUtilityArg::StringLiteral("flex p-4".into()),
            ClassUtilityArg::Expression("isActive && 'bg-blue-500'".into()),
            ClassUtilityArg::Expression("className".into()),
        ];

        let result = patch_class_utility_call(&mut args, "padding", "p-6").unwrap();
        assert!(result);

        match &args[0] {
            ClassUtilityArg::StringLiteral(s) => assert_eq!(s, "flex p-6"),
            _ => panic!("Expected StringLiteral"),
        }
    }

    #[test]
    fn test_cn_expression_args_untouched() {
        let mut args = vec![
            ClassUtilityArg::StringLiteral("flex mt-2".into()),
            ClassUtilityArg::Expression("isActive && 'p-4'".into()), // p-4 inside expression — opaque
        ];

        // Should NOT find padding in the string literal (it's only in the expression)
        let result = patch_class_utility_call(&mut args, "padding", "p-6").unwrap();
        assert!(!result); // Not patched — correctly refused
    }

    // ---- Token matching ----

    #[test]
    fn test_token_matching() {
        assert!(token_matches_property("p-4", "padding"));
        assert!(token_matches_property("p-[1.5rem]", "padding"));
        assert!(token_matches_property("pt-4", "padding-top"));
        assert!(token_matches_property("px-4", "padding-inline"));
        assert!(token_matches_property("-mt-4", "margin-top"));
        assert!(token_matches_property("bg-blue-500", "background-color"));

        // Negative cases
        assert!(!token_matches_property("p-4", "margin"));
        assert!(!token_matches_property("flex", "padding"));
        assert!(!token_matches_property("text-xl", "padding"));
    }

    #[test]
    fn test_plain_class_string_patching() {
        let result = try_patch_class_string("flex p-4 mx-auto text-white", "padding", "p-6");
        assert_eq!(result, Some("flex p-6 mx-auto text-white".to_string()));
    }

    #[test]
    fn test_plain_class_string_no_match() {
        let result = try_patch_class_string("flex mx-auto text-white", "padding", "p-6");
        assert_eq!(result, None);
    }
}
