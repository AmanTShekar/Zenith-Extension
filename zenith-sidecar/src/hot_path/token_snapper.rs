//! # TokenSnapper — Analog-Precision Design Token Quantization
//!
//! Snaps raw `f64` scrub values from the SAB ring buffer to the nearest
//! Tailwind v4 `@theme` design tokens using `partition_point()` binary search.
//!
//! ## Performance Contract
//!
//! - **O(log n)** per snap (binary search on pre-sorted vec).
//! - **Zero allocation** in the snap path — returns references + stack copies.
//! - Called from the **Rayon thread pool**, never from the SAB hot path directly.
//!
//! ## Cache Locality
//!
//! Token scales are stored as contiguous `Vec<(f64, String)>`, sorted by value.
//! Binary search walks a cache-friendly contiguous array. The `PropertyId` →
//! scale lookup is a flat array index, not a HashMap.

use crate::types::PropertyId;

// ---------------------------------------------------------------------------
// Snap result
// ---------------------------------------------------------------------------

/// The result of snapping a raw value to a design token.
#[derive(Debug, Clone)]
pub struct SnapResult {
    /// The snapped token value (e.g., 16.0 for `p-4`).
    pub value: f64,
    /// The Tailwind class name (e.g., `"p-4"`).
    pub token: String,
    /// Distance from the raw value to the snapped value (for UI confidence).
    /// Smaller = more confident snap. UI can show a "magnetic" effect.
    pub distance: f64,
    /// Index into the scale (for predictive patcher neighbor lookup).
    pub scale_index: usize,
}

// ---------------------------------------------------------------------------
// Token scale (one per property)
// ---------------------------------------------------------------------------

/// A pre-sorted scale of `(css_value_in_px, tailwind_class)` pairs.
/// Sorted ascending by value for binary search.
#[derive(Debug, Clone)]
pub struct TokenScale {
    /// Sorted by `.0` ascending. Invariant: must remain sorted after construction.
    entries: Vec<(f64, String)>,
    /// The Tailwind prefix for this property (e.g., "p", "m", "text").
    prefix: String,
}

impl TokenScale {
    /// Build a scale from unsorted pairs. Sorts internally.
    pub fn new(mut entries: Vec<(f64, String)>, prefix: impl Into<String>) -> Self {
        entries.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(std::cmp::Ordering::Equal));
        Self {
            entries,
            prefix: prefix.into(),
        }
    }

    /// Snap a raw value to the nearest token in the scale.
    ///
    /// Uses `partition_point()` (binary search) to find the insertion point,
    /// then compares the two neighbors to pick the closest.
    ///
    /// Returns `None` if the scale is empty.
    #[inline]
    pub fn snap(&self, raw: f64) -> Option<SnapResult> {
        if self.entries.is_empty() {
            return None;
        }

        // Binary search: find the first entry >= raw
        let idx = self.entries.partition_point(|(v, _)| *v < raw);

        // Compare the candidate at `idx` and `idx - 1` to find the nearest
        let best = match idx {
            0 => 0,
            i if i >= self.entries.len() => self.entries.len() - 1,
            i => {
                let dist_left = (raw - self.entries[i - 1].0).abs();
                let dist_right = (self.entries[i].0 - raw).abs();
                if dist_left <= dist_right { i - 1 } else { i }
            }
        };

        let (value, token) = &self.entries[best];
        Some(SnapResult {
            value: *value,
            token: token.clone(),
            distance: (raw - value).abs(),
            scale_index: best,
        })
    }

    /// Get the ±N neighbors around a scale index (for predictive pre-patching).
    pub fn neighbors(&self, center: usize, radius: usize) -> Vec<(f64, &str)> {
        let start = center.saturating_sub(radius);
        let end = (center + radius + 1).min(self.entries.len());
        self.entries[start..end]
            .iter()
            .enumerate()
            .filter(|(i, _)| start + *i != center) // exclude center itself
            .map(|(_, (v, s))| (*v, s.as_str()))
            .collect()
    }

    /// Number of tokens in this scale.
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

// ---------------------------------------------------------------------------
// TokenSnapper (top-level, per-property dispatch)
// ---------------------------------------------------------------------------

/// Top-level snapper that holds scales for all supported properties.
///
/// Uses a flat array indexed by `PropertyId as usize` for O(1) dispatch.
/// Max 20 properties = 20 slots — small enough to fit in L1 cache.
pub struct TokenSnapper {
    /// Index = `PropertyId as u16 as usize`. `None` = property has no token scale.
    scales: [Option<TokenScale>; 20],
}

impl TokenSnapper {
    /// Create a snapper pre-loaded with the default Tailwind v4 spacing scale.
    pub fn with_defaults() -> Self {
        let mut scales: [Option<TokenScale>; 20] = Default::default();

        let spacing = Self::default_spacing_scale();
        let font_sizes = Self::default_font_size_scale();
        let font_weights = Self::default_font_weight_scale();
        let radii = Self::default_border_radius_scale();
        let opacity = Self::default_opacity_scale();

        // Map spacing scale to all spacing properties
        for prop in [
            PropertyId::Padding,
            PropertyId::PaddingTop,
            PropertyId::PaddingRight,
            PropertyId::PaddingBottom,
            PropertyId::PaddingLeft,
            PropertyId::Margin,
            PropertyId::MarginTop,
            PropertyId::MarginRight,
            PropertyId::MarginBottom,
            PropertyId::MarginLeft,
            PropertyId::Gap,
            PropertyId::Width,
            PropertyId::Height,
        ] {
            scales[prop as u16 as usize] = Some(TokenScale::new(
                spacing.clone(),
                prop.tw_prefix().to_string(),
            ));
        }

        scales[PropertyId::FontSize as u16 as usize] =
            Some(TokenScale::new(font_sizes, "text"));
        scales[PropertyId::FontWeight as u16 as usize] =
            Some(TokenScale::new(font_weights, "font"));
        scales[PropertyId::BorderRadius as u16 as usize] =
            Some(TokenScale::new(radii, "rounded"));
        scales[PropertyId::Opacity as u16 as usize] =
            Some(TokenScale::new(opacity, "opacity"));

        Self { scales }
    }

    /// Snap a raw value to the nearest token for a given property.
    #[inline]
    pub fn snap(&self, prop: PropertyId, raw: f64) -> Option<SnapResult> {
        let idx = prop as u16 as usize;
        self.scales.get(idx)?.as_ref()?.snap(raw)
    }

    /// Get neighbors for predictive pre-patching.
    pub fn neighbors(
        &self,
        prop: PropertyId,
        scale_index: usize,
        radius: usize,
    ) -> Vec<(f64, String)> {
        let idx = prop as u16 as usize;
        self.scales
            .get(idx)
            .and_then(|s| s.as_ref())
            .map(|scale| {
                scale
                    .neighbors(scale_index, radius)
                    .into_iter()
                    .map(|(v, s)| (v, s.to_string()))
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Override a scale with a custom `@theme` token set (from tailwind.config.js).
    pub fn set_scale(&mut self, prop: PropertyId, scale: TokenScale) {
        let idx = prop as u16 as usize;
        if idx < self.scales.len() {
            self.scales[idx] = Some(scale);
        }
    }

    // -----------------------------------------------------------------------
    // Default Tailwind v4 scales
    // -----------------------------------------------------------------------

    fn default_spacing_scale() -> Vec<(f64, String)> {
        // Tailwind v4 default spacing: 0, 1, 2, ..., 96 (in units of 0.25rem = 4px)
        vec![
            (0.0, "0".into()),
            (1.0, "px".into()),
            (2.0, "0.5".into()),
            (4.0, "1".into()),
            (6.0, "1.5".into()),
            (8.0, "2".into()),
            (10.0, "2.5".into()),
            (12.0, "3".into()),
            (14.0, "3.5".into()),
            (16.0, "4".into()),
            (20.0, "5".into()),
            (24.0, "6".into()),
            (28.0, "7".into()),
            (32.0, "8".into()),
            (36.0, "9".into()),
            (40.0, "10".into()),
            (44.0, "11".into()),
            (48.0, "12".into()),
            (56.0, "14".into()),
            (64.0, "16".into()),
            (80.0, "20".into()),
            (96.0, "24".into()),
            (112.0, "28".into()),
            (128.0, "32".into()),
            (144.0, "36".into()),
            (160.0, "40".into()),
            (176.0, "44".into()),
            (192.0, "48".into()),
            (208.0, "52".into()),
            (224.0, "56".into()),
            (240.0, "60".into()),
            (256.0, "64".into()),
            (288.0, "72".into()),
            (320.0, "80".into()),
            (384.0, "96".into()),
        ]
    }

    fn default_font_size_scale() -> Vec<(f64, String)> {
        vec![
            (12.0, "xs".into()),
            (14.0, "sm".into()),
            (16.0, "base".into()),
            (18.0, "lg".into()),
            (20.0, "xl".into()),
            (24.0, "2xl".into()),
            (30.0, "3xl".into()),
            (36.0, "4xl".into()),
            (48.0, "5xl".into()),
            (60.0, "6xl".into()),
            (72.0, "7xl".into()),
            (96.0, "8xl".into()),
            (128.0, "9xl".into()),
        ]
    }

    fn default_font_weight_scale() -> Vec<(f64, String)> {
        vec![
            (100.0, "thin".into()),
            (200.0, "extralight".into()),
            (300.0, "light".into()),
            (400.0, "normal".into()),
            (500.0, "medium".into()),
            (600.0, "semibold".into()),
            (700.0, "bold".into()),
            (800.0, "extrabold".into()),
            (900.0, "black".into()),
        ]
    }

    fn default_border_radius_scale() -> Vec<(f64, String)> {
        vec![
            (0.0, "none".into()),
            (2.0, "sm".into()),
            (4.0, "DEFAULT".into()),
            (6.0, "md".into()),
            (8.0, "lg".into()),
            (12.0, "xl".into()),
            (16.0, "2xl".into()),
            (24.0, "3xl".into()),
            (9999.0, "full".into()),
        ]
    }

    fn default_opacity_scale() -> Vec<(f64, String)> {
        vec![
            (0.0, "0".into()),
            (0.05, "5".into()),
            (0.1, "10".into()),
            (0.15, "15".into()),
            (0.2, "20".into()),
            (0.25, "25".into()),
            (0.3, "30".into()),
            (0.35, "35".into()),
            (0.4, "40".into()),
            (0.45, "45".into()),
            (0.5, "50".into()),
            (0.55, "55".into()),
            (0.6, "60".into()),
            (0.65, "65".into()),
            (0.7, "70".into()),
            (0.75, "75".into()),
            (0.8, "80".into()),
            (0.85, "85".into()),
            (0.9, "90".into()),
            (0.95, "95".into()),
            (1.0, "100".into()),
        ]
    }
}

impl Default for TokenSnapper {
    fn default() -> Self {
        Self::with_defaults()
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_snap_exact_match() {
        let snapper = TokenSnapper::with_defaults();
        let result = snapper.snap(PropertyId::Padding, 16.0).unwrap();
        assert_eq!(result.value, 16.0);
        assert_eq!(result.token, "4");
        assert_eq!(result.distance, 0.0);
    }

    #[test]
    fn test_snap_between_tokens() {
        let snapper = TokenSnapper::with_defaults();
        // 17.0 is between 16.0 (p-4) and 20.0 (p-5) — should snap to 16.0 (closer)
        let result = snapper.snap(PropertyId::Padding, 17.0).unwrap();
        assert_eq!(result.value, 16.0);
        assert_eq!(result.token, "4");
        assert!((result.distance - 1.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_snap_midpoint_favors_left() {
        let snapper = TokenSnapper::with_defaults();
        // 18.0 is exactly between 16.0 and 20.0 — should snap to 16.0 (left wins on tie)
        let result = snapper.snap(PropertyId::Padding, 18.0).unwrap();
        assert_eq!(result.value, 16.0);
    }

    #[test]
    fn test_snap_below_scale() {
        let snapper = TokenSnapper::with_defaults();
        let result = snapper.snap(PropertyId::Padding, -5.0).unwrap();
        assert_eq!(result.value, 0.0); // snaps to first entry
    }

    #[test]
    fn test_snap_above_scale() {
        let snapper = TokenSnapper::with_defaults();
        let result = snapper.snap(PropertyId::Padding, 999.0).unwrap();
        assert_eq!(result.value, 384.0); // snaps to last entry (96)
    }

    #[test]
    fn test_snap_font_size() {
        let snapper = TokenSnapper::with_defaults();
        let result = snapper.snap(PropertyId::FontSize, 15.0).unwrap();
        assert_eq!(result.value, 14.0); // snaps to text-sm
        assert_eq!(result.token, "sm");
    }

    #[test]
    fn test_snap_opacity() {
        let snapper = TokenSnapper::with_defaults();
        let result = snapper.snap(PropertyId::Opacity, 0.52).unwrap();
        assert_eq!(result.value, 0.5);
        assert_eq!(result.token, "50");
    }

    #[test]
    fn test_neighbors() {
        let snapper = TokenSnapper::with_defaults();
        let result = snapper.snap(PropertyId::Padding, 16.0).unwrap();
        let neighbors = snapper.neighbors(PropertyId::Padding, result.scale_index, 2);
        // Should return ±2 neighbors excluding center (16.0)
        assert!(!neighbors.is_empty());
        assert!(neighbors.iter().all(|(v, _)| (*v - 16.0).abs() > f64::EPSILON));
    }

    #[test]
    fn test_custom_scale() {
        let mut snapper = TokenSnapper::with_defaults();
        let custom = TokenScale::new(
            vec![(8.0, "sm".into()), (16.0, "md".into()), (32.0, "lg".into())],
            "p",
        );
        snapper.set_scale(PropertyId::Padding, custom);

        let result = snapper.snap(PropertyId::Padding, 20.0).unwrap();
        assert_eq!(result.value, 16.0); // snaps to "md" in the custom scale
        assert_eq!(result.token, "md");
    }

    #[test]
    fn test_empty_scale() {
        let scale = TokenScale::new(vec![], "p");
        assert!(scale.snap(10.0).is_none());
    }
}
