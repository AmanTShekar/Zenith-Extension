//! # GapScrubber — Negative-Space Click Detector
//!
//! Detects clicks between sibling elements and maps them to either a `gap`
//! property (Flex/Grid parent) or a `margin` adjustment, then produces
//! `ScrubMessage`-compatible output for the SAB hot path.
//!
//! ## How It Works
//!
//! 1. User clicks in the empty space between two siblings.
//! 2. GapScrubber identifies the two nearest siblings using SmartGuideEngine.
//! 3. It checks the parent's layout mode:
//!    - **Flex/Grid** → scrub the `gap` property on the parent.
//!    - **Block/Other** → scrub the `margin-bottom` on the upper sibling
//!      (or `margin-top` on the lower).
//! 4. The result is a `GapTarget` that the Property Inspector can bind to
//!    a slider, which then feeds the SAB hot path like any other scrub.

use crate::hot_path::smart_guides::ElementRect;
use crate::types::{PropertyId, ZenithId};

// ---------------------------------------------------------------------------
// Layout context
// ---------------------------------------------------------------------------

/// The layout mode of a parent element.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LayoutMode {
    Flex,
    Grid,
    Block,
    Inline,
    Unknown,
}

/// Context about a parent element's layout for gap vs margin decision.
#[derive(Debug, Clone)]
pub struct ParentContext {
    pub zenith_id: ZenithId,
    pub layout: LayoutMode,
    /// Current gap value in px (if applicable).
    pub current_gap_px: Option<f64>,
    /// Direction of the flex/grid axis.
    pub direction: FlexDirection,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FlexDirection {
    Row,
    Column,
}

// ---------------------------------------------------------------------------
// Gap target result
// ---------------------------------------------------------------------------

/// The result of analyzing a negative-space click.
/// Tells the Property Inspector which property to bind to a slider.
#[derive(Debug, Clone)]
pub struct GapTarget {
    /// The element whose property should be scrubbed.
    pub target_zenith_id: ZenithId,
    /// The CSS property to scrub.
    pub property: PropertyId,
    /// The current value in pixels.
    pub current_value_px: f64,
    /// The measured distance between the two siblings in px.
    pub measured_gap_px: f64,
    /// Context about why we chose this target.
    pub strategy: GapStrategy,
    /// The two siblings that define the gap.
    pub sibling_a: ZenithId,
    pub sibling_b: ZenithId,
}

/// Which strategy the GapScrubber chose.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GapStrategy {
    /// Scrub the `gap` property on the Flex/Grid parent.
    ParentGap,
    /// Scrub the `margin-bottom` on the upper sibling.
    MarginBottom,
    /// Scrub the `margin-top` on the lower sibling.
    MarginTop,
    /// Scrub the `margin-right` on the left sibling (row layout).
    MarginRight,
    /// Scrub the `margin-left` on the right sibling (row layout).
    MarginLeft,
}

// ---------------------------------------------------------------------------
// GapScrubber
// ---------------------------------------------------------------------------

/// Analyzes negative-space clicks and determines the optimal scrub target.
pub struct GapScrubber;

impl GapScrubber {
    /// Analyze a click at `(click_x, click_y)` and determine what to scrub.
    ///
    /// `siblings` must be the children of the same parent, sorted by position
    /// (left-to-right for row, top-to-bottom for column).
    ///
    /// Returns `None` if the click isn't between any two siblings.
    pub fn analyze(
        click_x: f64,
        click_y: f64,
        siblings: &[ElementRect],
        parent: &ParentContext,
    ) -> Option<GapTarget> {
        if siblings.len() < 2 {
            return None;
        }

        // Find the two siblings that bracket the click point
        let (sib_a, sib_b) = Self::find_bracketing_siblings(
            click_x, click_y, siblings, parent.direction,
        )?;

        // Measure the gap between them
        let gap_px = match parent.direction {
            FlexDirection::Column => sib_b.y - sib_a.bottom(),
            FlexDirection::Row => sib_b.x - sib_a.right(),
        };

        // Decide strategy based on parent layout
        match parent.layout {
            LayoutMode::Flex | LayoutMode::Grid => {
                // Scrub the `gap` property on the parent
                Some(GapTarget {
                    target_zenith_id: parent.zenith_id.clone(),
                    property: PropertyId::Gap,
                    current_value_px: parent.current_gap_px.unwrap_or(gap_px),
                    measured_gap_px: gap_px,
                    strategy: GapStrategy::ParentGap,
                    sibling_a: sib_a.zenith_id.clone(),
                    sibling_b: sib_b.zenith_id.clone(),
                })
            }
            _ => {
                // Block/inline/unknown: use margin on the appropriate sibling
                let (target_id, property, strategy) = match parent.direction {
                    FlexDirection::Column => (
                        sib_a.zenith_id.clone(),
                        PropertyId::MarginBottom,
                        GapStrategy::MarginBottom,
                    ),
                    FlexDirection::Row => (
                        sib_a.zenith_id.clone(),
                        PropertyId::MarginRight,
                        GapStrategy::MarginRight,
                    ),
                };

                Some(GapTarget {
                    target_zenith_id: target_id,
                    property,
                    current_value_px: gap_px,
                    measured_gap_px: gap_px,
                    strategy,
                    sibling_a: sib_a.zenith_id.clone(),
                    sibling_b: sib_b.zenith_id.clone(),
                })
            }
        }
    }

    /// Find the two siblings that bracket a click point.
    ///
    /// For column layouts: finds siblings where sib_a.bottom <= click_y <= sib_b.y
    /// For row layouts: finds siblings where sib_a.right <= click_x <= sib_b.x
    fn find_bracketing_siblings<'a>(
        click_x: f64,
        click_y: f64,
        siblings: &'a [ElementRect],
        direction: FlexDirection,
    ) -> Option<(&'a ElementRect, &'a ElementRect)> {
        for pair in siblings.windows(2) {
            let (a, b) = (&pair[0], &pair[1]);
            let is_between = match direction {
                FlexDirection::Column => click_y >= a.bottom() && click_y <= b.y,
                FlexDirection::Row => click_x >= a.right() && click_x <= b.x,
            };
            if is_between {
                return Some((a, b));
            }
        }
        None
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn rect(id: &str, x: f64, y: f64, w: f64, h: f64) -> ElementRect {
        ElementRect {
            zenith_id: id.to_string(),
            x, y,
            width: w,
            height: h,
        }
    }

    fn flex_parent(id: &str, gap: f64, dir: FlexDirection) -> ParentContext {
        ParentContext {
            zenith_id: id.to_string(),
            layout: LayoutMode::Flex,
            current_gap_px: Some(gap),
            direction: dir,
        }
    }

    fn block_parent(id: &str) -> ParentContext {
        ParentContext {
            zenith_id: id.to_string(),
            layout: LayoutMode::Block,
            current_gap_px: None,
            direction: FlexDirection::Column,
        }
    }

    #[test]
    fn test_flex_column_gap_detection() {
        let siblings = vec![
            rect("child-1", 0.0, 0.0, 100.0, 50.0),     // bottom = 50
            rect("child-2", 0.0, 66.0, 100.0, 50.0),     // top = 66, gap = 16px
        ];
        let parent = flex_parent("parent", 16.0, FlexDirection::Column);

        let result = GapScrubber::analyze(50.0, 58.0, &siblings, &parent).unwrap();
        assert_eq!(result.strategy, GapStrategy::ParentGap);
        assert_eq!(result.property, PropertyId::Gap);
        assert_eq!(result.target_zenith_id, "parent");
        assert_eq!(result.measured_gap_px, 16.0);
    }

    #[test]
    fn test_flex_row_gap_detection() {
        let siblings = vec![
            rect("a", 0.0, 0.0, 80.0, 40.0),    // right = 80
            rect("b", 100.0, 0.0, 80.0, 40.0),   // left = 100, gap = 20px
        ];
        let parent = flex_parent("row-parent", 20.0, FlexDirection::Row);

        let result = GapScrubber::analyze(90.0, 20.0, &siblings, &parent).unwrap();
        assert_eq!(result.strategy, GapStrategy::ParentGap);
        assert_eq!(result.measured_gap_px, 20.0);
    }

    #[test]
    fn test_block_layout_uses_margin() {
        let siblings = vec![
            rect("div-1", 0.0, 0.0, 100.0, 40.0),   // bottom = 40
            rect("div-2", 0.0, 64.0, 100.0, 40.0),   // top = 64, gap = 24px
        ];
        let parent = block_parent("wrapper");

        let result = GapScrubber::analyze(50.0, 52.0, &siblings, &parent).unwrap();
        assert_eq!(result.strategy, GapStrategy::MarginBottom);
        assert_eq!(result.property, PropertyId::MarginBottom);
        assert_eq!(result.target_zenith_id, "div-1"); // margin on the upper sibling
    }

    #[test]
    fn test_click_outside_siblings() {
        let siblings = vec![
            rect("a", 0.0, 0.0, 100.0, 50.0),
            rect("b", 0.0, 80.0, 100.0, 50.0),
        ];
        let parent = flex_parent("p", 30.0, FlexDirection::Column);

        // Click above the gap
        let result = GapScrubber::analyze(50.0, 20.0, &siblings, &parent);
        assert!(result.is_none());
    }

    #[test]
    fn test_single_child_returns_none() {
        let siblings = vec![rect("only", 0.0, 0.0, 100.0, 50.0)];
        let parent = flex_parent("p", 0.0, FlexDirection::Column);
        assert!(GapScrubber::analyze(50.0, 60.0, &siblings, &parent).is_none());
    }
}
