//! # PatchStrategy Trait
//!
//! Plugin API for third-party style engines (UnoCSS, StyleX, Panda CSS).

// Removed unused anyhow::Result

// Removed unused TextEdit

use std::collections::HashMap;

// ---------------------------------------------------------------------------
// Core Trait
// ---------------------------------------------------------------------------

/// Implement this trait to add support for a new CSS/styling paradigm to Zenith.
///
/// Built-in implementations: Tailwind, InlineStyle, CSSModule.
/// Community implementations can be compiled in as feature flags.
pub trait PatchStrategyPlugin: Send + Sync {
    /// Human-readable name (e.g., "UnoCSS", "StyleX", "Panda CSS").
    fn name(&self) -> &str;

    /// Can this strategy handle the given element?
    ///
    /// The detector provides the className attribute value (if any),
    /// the style attribute (if any), and the file context.
    fn can_handle(&self, ctx: &DetectionContext<'_>) -> Confidence;

    /// Resolve a CSS `(property, value)` pair to a utility class name.
    ///
    /// Returns `None` if this framework doesn't have a utility for this combo.
    /// The caller will then fall back to an arbitrary value or the next strategy.
    fn resolve_class(&self, property: &str, value: &str) -> Option<String>;

    /// Tokenize a class string into individual framework-specific tokens.
    ///
    /// Used by the template literal patcher to identify which tokens to replace.
    fn tokenize(&self, class_string: &str) -> Vec<StyleToken>;

    /// Generate a CSS rule for ghost preview injection.
    ///
    /// Called when a class exists in source code but not in the compiled CSS.
    /// The returned string is a complete CSS rule (selector + declarations).
    fn generate_preview_css(&self, class_name: &str) -> Option<String>;
}

// ---------------------------------------------------------------------------
// Supporting Types
// ---------------------------------------------------------------------------

/// Context provided to the strategy detector.
pub struct DetectionContext<'a> {
    /// The className attribute value (raw source), if present.
    pub class_attr: Option<&'a str>,
    /// The style attribute (raw source), if present.
    pub style_attr: Option<&'a str>,
    /// Import statements in the file (for detecting CSS module imports).
    pub imports: &'a [ImportInfo],
    /// File extension (e.g., ".tsx", ".vue").
    pub file_extension: &'a str,
}

/// An import statement in the source file.
pub struct ImportInfo {
    pub source: String,     // e.g., "./Card.module.css"
    pub default: Option<String>,  // e.g., "styles"
    pub named: Vec<String>,
}

/// Confidence level for strategy detection. Higher values take priority.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Confidence {
    /// Cannot handle this element.
    None = 0,
    /// Might handle (e.g., detected some heuristic patterns).
    Low = 1,
    /// Likely handles (e.g., found framework-specific patterns).
    Medium = 2,
    /// Definitely handles (e.g., found explicit framework imports).
    High = 3,
    /// This is the ONLY strategy that should handle it.
    Exclusive = 4,
}

/// A parsed token from a class string.
#[derive(Debug, Clone)]
pub struct StyleToken {
    /// The raw token string (e.g., "p-4", "bg-blue-500").
    pub raw: String,
    /// The CSS property this token maps to (e.g., "padding").
    pub css_property: Option<String>,
    /// The CSS value (e.g., "1rem").
    pub css_value: Option<String>,
    /// Whether this token is a utility (vs. a custom class).
    pub is_utility: bool,
}

// ---------------------------------------------------------------------------
// Strategy Resolver
// ---------------------------------------------------------------------------

/// Resolves which PatchStrategy to use for a given element.
pub struct StrategyResolver {
    strategies: Vec<Box<dyn PatchStrategyPlugin>>,
}

impl StrategyResolver {
    pub fn new() -> Self {
        let mut resolver = Self {
            strategies: Vec::new(),
        };

        // v3.10 Fix: Register built-in strategies (Issue 25)
        resolver.register(Box::new(TailwindStrategy::new()));
        resolver.register(Box::new(InlineStyleStrategy::new()));

        resolver
    }

    /// Register a strategy plugin.
    pub fn register(&mut self, strategy: Box<dyn PatchStrategyPlugin>) {
        self.strategies.push(strategy);
    }

    /// Detect the best strategy for a given element.
    pub fn detect(&self, ctx: &DetectionContext<'_>) -> Option<&dyn PatchStrategyPlugin> {
        let mut best: Option<(&dyn PatchStrategyPlugin, Confidence)> = None;

        for strategy in &self.strategies {
            let confidence = strategy.can_handle(ctx);
            if confidence == Confidence::None {
                continue;
            }

            match &best {
                None => best = Some((strategy.as_ref(), confidence)),
                Some((_, best_confidence)) => {
                    if confidence > *best_confidence {
                        best = Some((strategy.as_ref(), confidence));
                    }
                }
            }
        }

        best.map(|(s, _)| s)
    }

    /// List all registered strategy names.
    pub fn list_strategies(&self) -> Vec<&str> {
        self.strategies.iter().map(|s| s.name()).collect()
    }
}

impl Default for StrategyResolver {
    fn default() -> Self {
        Self::new()
    }
}

// ---------------------------------------------------------------------------
// Built-in Strategies
// ---------------------------------------------------------------------------

/// Tailwind CSS Strategy — resolves property/value to standard utility classes.
pub struct TailwindStrategy {
    /// Basic mapping for common properties
    map: HashMap<(&'static str, &'static str), &'static str>,
}

impl TailwindStrategy {
    pub fn new() -> Self {
        let mut map = HashMap::new();
        // Spacing
        map.insert(("padding", "4px"), "p-1");
        map.insert(("padding", "8px"), "p-2");
        map.insert(("padding", "16px"), "p-4");
        map.insert(("padding", "24px"), "p-6");
        map.insert(("padding", "32px"), "p-8");
        // Colors (Simplified for prototype)
        map.insert(("color", "#00F0FF"), "text-cyan-400");
        map.insert(("backgroundColor", "#050505"), "bg-zinc-950");
        map.insert(("backgroundColor", "#111"), "bg-zinc-900");
        // Layout
        map.insert(("display", "flex"), "flex");
        map.insert(("flexDirection", "column"), "flex-col");
        map.insert(("gap", "16px"), "gap-4");
        
        Self { map }
    }
}

impl PatchStrategyPlugin for TailwindStrategy {
    fn name(&self) -> &str { "Tailwind" }

    fn can_handle(&self, ctx: &DetectionContext<'_>) -> Confidence {
        // High confidence if we see tailwind.config or significant utility patterns
        if let Some(cls) = ctx.class_attr {
            if cls.contains("p-") || cls.contains("m-") || cls.contains("flex") {
                return Confidence::High;
            }
        }
        Confidence::Low
    }

    fn resolve_class(&self, property: &str, value: &str) -> Option<String> {
        // 1. Look in the static map (high-performance path)
        if let Some(cls) = self.map.get(&(property, value)) {
            return Some(cls.to_string());
        }

        // 2. Fallback to Tailwind v3 Arbitrary Values: e.g. w-[10px]
        let prefix = match property {
            "padding" => "p",
            "paddingTop" => "pt",
            "paddingRight" => "pr",
            "paddingBottom" => "pb",
            "paddingLeft" => "pl",
            "margin" => "m",
            "marginTop" => "mt",
            "marginRight" => "mr",
            "marginBottom" => "mb",
            "marginLeft" => "ml",
            "width" => "w",
            "height" => "h",
            "gap" => "gap",
            "backgroundColor" => "bg",
            "color" => "text",
            "opacity" => "opacity",
            _ => return None,
        };

        // Normalize value for arbitrary syntax: e.g. "10px" -> "[10px]"
        // Note: Tailwind arbitrary values use underscores for spaces
        let normalized = value.replace(' ', "_");
        Some(format!("{}-[ {}]", prefix, normalized))
    }

    fn tokenize(&self, class_string: &str) -> Vec<StyleToken> {
        class_string.split_whitespace().map(|s| {
            // Very basic heuristic for utility identification
            let is_utility = s.contains('-') || s == "flex" || s == "block" || s == "hidden";
            StyleToken {
                raw: s.to_string(),
                css_property: None, 
                css_value: None,
                is_utility,
            }
        }).collect()
    }

    fn generate_preview_css(&self, _class_name: &str) -> Option<String> {
        None 
    }
}

/// Inline Style Strategy — fallback that uses the style={{}} attribute.
pub struct InlineStyleStrategy;

impl InlineStyleStrategy {
    pub fn new() -> Self { Self }
}

impl PatchStrategyPlugin for InlineStyleStrategy {
    fn name(&self) -> &str { "InlineStyle" }

    fn can_handle(&self, ctx: &DetectionContext<'_>) -> Confidence {
        if ctx.style_attr.is_some() {
            Confidence::High
        } else {
            Confidence::Low // Fallback
        }
    }

    fn resolve_class(&self, _property: &str, _value: &str) -> Option<String> {
        None 
    }

    fn tokenize(&self, _class_string: &str) -> Vec<StyleToken> {
        Vec::new()
    }

    fn generate_preview_css(&self, _class_name: &str) -> Option<String> {
        None
    }
}
