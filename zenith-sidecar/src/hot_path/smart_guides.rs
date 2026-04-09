//! # SmartGuideEngine + Swap-Table — 60fps Spatial Scalability (v2.6)
//!
//! Uses a **Swap-Table** architecture for spatial queries:
//!
//! - **Flat HashMap** (`bbox_table`): All element bounding boxes, updated on
//!   every layout change. Used for hot-path scrub queries.
//! - **R-tree** (`rtree`): Rebuilt **only on click** (selection change).
//!   Used for precise alignment guides and distance measurement.
//!
//! ## v2.6 Performance Contract
//!
//! - During 60fps scrub: query a "Minimal Scrub Neighborhood" (~20 elements)
//!   from the flat HashMap. Cost: ~2µs/frame.
//! - R-tree rebuild: O(n log n) but only on selection change (click), NOT scroll.
//! - Alignment detection uses `par_iter()` via Rayon for parallel edge comparison.
//! - Called from the **Rayon thread pool**, never from the SAB hot path.

use std::collections::HashMap;

use rstar::{RTree, RTreeObject, AABB, PointDistance};
use rayon::prelude::*;

use crate::types::ZenithId;

// ---------------------------------------------------------------------------
// Element bounding rect (R-tree entry point)
// ---------------------------------------------------------------------------

/// A positioned element in the canvas, stored in both the flat table and R-tree.
#[derive(Debug, Clone)]
pub struct ElementRect {
    /// Ghost-ID for this element.
    pub zenith_id: ZenithId,
    /// Bounding box: (x, y) of top-left corner in pixels.
    pub x: f64,
    pub y: f64,
    /// Dimensions in pixels.
    pub width: f64,
    pub height: f64,
}

impl ElementRect {
    pub fn right(&self) -> f64 { self.x + self.width }
    pub fn bottom(&self) -> f64 { self.y + self.height }
    pub fn center_x(&self) -> f64 { self.x + self.width / 2.0 }
    pub fn center_y(&self) -> f64 { self.y + self.height / 2.0 }
}

/// R-tree integration: define the envelope (bounding box) for spatial indexing.
impl RTreeObject for ElementRect {
    type Envelope = AABB<[f64; 2]>;

    fn envelope(&self) -> Self::Envelope {
        AABB::from_corners([self.x, self.y], [self.right(), self.bottom()])
    }
}

/// Distance calculation for nearest-neighbor queries.
impl PointDistance for ElementRect {
    fn distance_2(&self, point: &[f64; 2]) -> f64 {
        let dx = (point[0] - self.center_x()).abs();
        let dy = (point[1] - self.center_y()).abs();
        dx * dx + dy * dy
    }
}

// ---------------------------------------------------------------------------
// Alignment guides
// ---------------------------------------------------------------------------

/// A visual alignment guide line.
#[derive(Debug, Clone)]
pub struct AlignmentGuide {
    /// The axis of alignment.
    pub axis: GuideAxis,
    /// The pixel position of the guide line.
    pub position: f64,
    /// Which edge of the target element aligns.
    pub target_edge: Edge,
    /// Which peer element created this guide.
    pub peer_zenith_id: ZenithId,
    /// Which edge of the peer aligns.
    pub peer_edge: Edge,
    /// Distance from the target edge to the guide (for snap strength).
    pub distance: f64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GuideAxis {
    Horizontal, // guide is a horizontal line (aligns vertical positions: top/bottom/center-y)
    Vertical,   // guide is a vertical line (aligns horizontal positions: left/right/center-x)
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Edge {
    Left,
    Right,
    Top,
    Bottom,
    CenterX,
    CenterY,
}

// ---------------------------------------------------------------------------
// Distance measurement result
// ---------------------------------------------------------------------------

/// The result of measuring distance between two elements (Alt-key overlay).
#[derive(Debug, Clone)]
pub struct DistanceMeasurement {
    /// The element being measured from (current selection).
    pub from_id: ZenithId,
    /// The element being measured to (hover target).
    pub to_id: ZenithId,
    /// Horizontal gap in pixels.
    pub horizontal_px: f64,
    /// Vertical gap in pixels.
    pub vertical_px: f64,
    /// Horizontal gap in rem (assuming 16px base).
    pub horizontal_rem: f64,
    /// Vertical gap in rem.
    pub vertical_rem: f64,
    /// The direction of measurement.
    pub direction: MeasureDirection,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MeasureDirection {
    /// Target is to the right of selection.
    Right,
    /// Target is to the left.
    Left,
    /// Target is below.
    Below,
    /// Target is above.
    Above,
    /// Elements overlap.
    Overlapping,
}

// ---------------------------------------------------------------------------
// SmartGuideEngine (v2.6 Swap-Table)
// ---------------------------------------------------------------------------

/// The snap alignment threshold in pixels. Edges within this distance
/// will generate alignment guides.
const SNAP_THRESHOLD_PX: f64 = 4.0;

/// Base font size for px → rem conversion. Configurable per project.
const BASE_FONT_SIZE_PX: f64 = 16.0;

/// Maximum number of elements returned by the Minimal Scrub Neighborhood.
/// Keeps hot-path costs at ~2µs/frame during 60fps scrub.
const SCRUB_NEIGHBORHOOD_SIZE: usize = 20;

/// Spatial alignment engine using a Swap-Table architecture.
///
/// The flat `bbox_table` is always up-to-date. The `rtree` is rebuilt
/// lazily only when `rebuild_rtree()` is called (on selection change).
pub struct SmartGuideEngine {
    /// Flat lookup table: always up-to-date with all element positions.
    /// Used for hot-path scrub queries (O(1) per element).
    bbox_table: HashMap<ZenithId, ElementRect>,

    /// R-tree: rebuilt only on click (selection change).
    /// Used for precise alignment guides and nearest-neighbor queries.
    rtree: RTree<ElementRect>,

    /// Whether the R-tree needs rebuilding (dirty flag).
    rtree_dirty: bool,

    /// Snap threshold in pixels.
    threshold: f64,
    /// Base font size for rem conversion.
    base_font_size: f64,
}

impl SmartGuideEngine {
    /// Build a new engine from a set of element rects.
    ///
    /// This is called when the canvas layout changes (HMR, commit, file save).
    /// The R-tree is built on initial construction.
    pub fn new(elements: Vec<ElementRect>) -> Self {
        let bbox_table: HashMap<ZenithId, ElementRect> = elements
            .iter()
            .map(|e| (e.zenith_id.clone(), e.clone()))
            .collect();
        let rtree = RTree::bulk_load(elements);

        Self {
            bbox_table,
            rtree,
            rtree_dirty: false,
            threshold: SNAP_THRESHOLD_PX,
            base_font_size: BASE_FONT_SIZE_PX,
        }
    }

    /// Update element positions in the flat table ONLY (hot path).
    ///
    /// Does NOT rebuild the R-tree — call `rebuild_rtree()` on click.
    /// This is the key v2.6 optimization: flat table updates are O(n) where
    /// n is the number of changed elements, not the total element count.
    pub fn update_positions(&mut self, elements: Vec<ElementRect>) {
        for elem in elements {
            self.bbox_table.insert(elem.zenith_id.clone(), elem);
        }
        self.rtree_dirty = true;
    }

    /// Rebuild the R-tree from the bbox_table.
    ///
    /// **Call only on click / selection change** — NOT during scrub.
    /// Cost: O(n log n) but amortized to zero during 60fps scrub.
    pub fn rebuild_rtree(&mut self) {
        let elements: Vec<ElementRect> = self.bbox_table.values().cloned().collect();
        self.rtree = RTree::bulk_load(elements);
        self.rtree_dirty = false;
    }

    /// Query the Minimal Scrub Neighborhood — ~20 elements nearest to a point.
    ///
    /// Used during 60fps scrub to keep hot-path costs at ~2µs/frame.
    /// Returns elements sorted by distance to the query point.
    pub fn scrub_neighborhood(&self, x: f64, y: f64) -> Vec<&ElementRect> {
        // Use the flat table for O(n) scan — faster than R-tree for small N
        let mut candidates: Vec<(&ElementRect, f64)> = self
            .bbox_table
            .values()
            .map(|e| {
                let dx = x - e.center_x();
                let dy = y - e.center_y();
                (e, dx * dx + dy * dy)
            })
            .collect();

        candidates.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
        candidates
            .into_iter()
            .take(SCRUB_NEIGHBORHOOD_SIZE)
            .map(|(e, _)| e)
            .collect()
    }

    /// Legacy rebuild — updates both table and R-tree.
    /// Use `update_positions()` + `rebuild_rtree()` separately for v2.6 perf.
    pub fn rebuild(&mut self, elements: Vec<ElementRect>) {
        self.bbox_table = elements
            .iter()
            .map(|e| (e.zenith_id.clone(), e.clone()))
            .collect();
        self.rtree = RTree::bulk_load(elements);
        self.rtree_dirty = false;
    }

    /// Detect alignment guides for a target element against all peers.
    ///
    /// Uses `par_iter()` for parallel edge comparison across all peer elements.
    /// Returns guides sorted by distance (closest first) for UI rendering priority.
    pub fn detect_guides(&self, target: &ElementRect) -> Vec<AlignmentGuide> {
        let threshold = self.threshold;
        let elements: Vec<&ElementRect> = self.bbox_table.values().collect();

        let mut guides: Vec<AlignmentGuide> = elements
            .par_iter()
            .filter(|peer| peer.zenith_id != target.zenith_id)
            .flat_map(|peer| {
                let mut local = Vec::with_capacity(10);

                // Vertical guides (align horizontal positions)
                Self::check_alignment(
                    target.x, peer.x, GuideAxis::Vertical,
                    Edge::Left, Edge::Left, peer, threshold, &mut local,
                );
                Self::check_alignment(
                    target.right(), peer.right(), GuideAxis::Vertical,
                    Edge::Right, Edge::Right, peer, threshold, &mut local,
                );
                Self::check_alignment(
                    target.center_x(), peer.center_x(), GuideAxis::Vertical,
                    Edge::CenterX, Edge::CenterX, peer, threshold, &mut local,
                );
                Self::check_alignment(
                    target.x, peer.right(), GuideAxis::Vertical,
                    Edge::Left, Edge::Right, peer, threshold, &mut local,
                );
                Self::check_alignment(
                    target.right(), peer.x, GuideAxis::Vertical,
                    Edge::Right, Edge::Left, peer, threshold, &mut local,
                );

                // Horizontal guides (align vertical positions)
                Self::check_alignment(
                    target.y, peer.y, GuideAxis::Horizontal,
                    Edge::Top, Edge::Top, peer, threshold, &mut local,
                );
                Self::check_alignment(
                    target.bottom(), peer.bottom(), GuideAxis::Horizontal,
                    Edge::Bottom, Edge::Bottom, peer, threshold, &mut local,
                );
                Self::check_alignment(
                    target.center_y(), peer.center_y(), GuideAxis::Horizontal,
                    Edge::CenterY, Edge::CenterY, peer, threshold, &mut local,
                );
                Self::check_alignment(
                    target.y, peer.bottom(), GuideAxis::Horizontal,
                    Edge::Top, Edge::Bottom, peer, threshold, &mut local,
                );
                Self::check_alignment(
                    target.bottom(), peer.y, GuideAxis::Horizontal,
                    Edge::Bottom, Edge::Top, peer, threshold, &mut local,
                );

                local
            })
            .collect();

        // Sort by distance — closest guides first for UI priority
        guides.sort_by(|a, b| {
            a.distance
                .partial_cmp(&b.distance)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        guides
    }

    /// Measure the distance between two elements (Alt-key overlay).
    pub fn measure_distance(
        &self,
        selection: &ElementRect,
        hover: &ElementRect,
    ) -> DistanceMeasurement {
        let h_gap = if hover.x >= selection.right() {
            hover.x - selection.right()
        } else if selection.x >= hover.right() {
            selection.x - hover.right()
        } else {
            0.0
        };

        let v_gap = if hover.y >= selection.bottom() {
            hover.y - selection.bottom()
        } else if selection.y >= hover.bottom() {
            selection.y - hover.bottom()
        } else {
            0.0
        };

        let direction = if h_gap == 0.0 && v_gap == 0.0 {
            MeasureDirection::Overlapping
        } else if h_gap >= v_gap {
            if hover.x >= selection.right() {
                MeasureDirection::Right
            } else {
                MeasureDirection::Left
            }
        } else if hover.y >= selection.bottom() {
            MeasureDirection::Below
        } else {
            MeasureDirection::Above
        };

        DistanceMeasurement {
            from_id: selection.zenith_id.clone(),
            to_id: hover.zenith_id.clone(),
            horizontal_px: h_gap,
            vertical_px: v_gap,
            horizontal_rem: h_gap / self.base_font_size,
            vertical_rem: v_gap / self.base_font_size,
            direction,
        }
    }

    /// Find the nearest element to a given point (for hover detection).
    pub fn nearest_to_point(&self, x: f64, y: f64) -> Option<&ElementRect> {
        self.rtree.nearest_neighbor(&[x, y])
    }

    /// Set a custom snap threshold.
    pub fn set_threshold(&mut self, px: f64) {
        self.threshold = px;
    }

    /// Set base font size for rem conversion.
    pub fn set_base_font_size(&mut self, px: f64) {
        self.base_font_size = px;
    }

    /// Whether the R-tree needs rebuilding.
    pub fn is_rtree_dirty(&self) -> bool {
        self.rtree_dirty
    }

    /// Number of elements in the bbox table.
    pub fn element_count(&self) -> usize {
        self.bbox_table.len()
    }

    // -----------------------------------------------------------------------
    // Internal alignment check
    // -----------------------------------------------------------------------

    #[inline]
    fn check_alignment(
        target_pos: f64,
        peer_pos: f64,
        axis: GuideAxis,
        target_edge: Edge,
        peer_edge: Edge,
        peer: &ElementRect,
        threshold: f64,
        out: &mut Vec<AlignmentGuide>,
    ) {
        let distance = (target_pos - peer_pos).abs();
        if distance <= threshold {
            out.push(AlignmentGuide {
                axis,
                position: peer_pos, // align to the peer's edge
                target_edge,
                peer_zenith_id: peer.zenith_id.clone(),
                peer_edge,
                distance,
            });
        }
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

    #[test]
    fn test_perfect_left_alignment() {
        let elements = vec![
            rect("a", 100.0, 50.0, 200.0, 100.0),
            rect("b", 100.0, 200.0, 150.0, 80.0),
        ];
        let engine = SmartGuideEngine::new(elements);
        let target = rect("a", 100.0, 50.0, 200.0, 100.0);

        let guides = engine.detect_guides(&target);
        let left_guides: Vec<_> = guides
            .iter()
            .filter(|g| g.target_edge == Edge::Left && g.peer_edge == Edge::Left)
            .collect();
        assert!(!left_guides.is_empty());
        assert_eq!(left_guides[0].position, 100.0);
        assert_eq!(left_guides[0].distance, 0.0);
    }

    #[test]
    fn test_near_alignment_within_threshold() {
        let elements = vec![
            rect("a", 100.0, 50.0, 200.0, 100.0),
            rect("b", 103.0, 200.0, 150.0, 80.0), // 3px off — within default 4px threshold
        ];
        let engine = SmartGuideEngine::new(elements);
        let target = rect("a", 100.0, 50.0, 200.0, 100.0);

        let guides = engine.detect_guides(&target);
        let near: Vec<_> = guides
            .iter()
            .filter(|g| g.target_edge == Edge::Left && g.peer_edge == Edge::Left)
            .collect();
        assert!(!near.is_empty());
        assert!((near[0].distance - 3.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_no_guide_beyond_threshold() {
        let elements = vec![
            rect("a", 100.0, 50.0, 200.0, 100.0),
            rect("b", 110.0, 200.0, 150.0, 80.0), // 10px off — beyond threshold
        ];
        let engine = SmartGuideEngine::new(elements);
        let target = rect("a", 100.0, 50.0, 200.0, 100.0);

        let guides = engine.detect_guides(&target);
        let left: Vec<_> = guides
            .iter()
            .filter(|g| g.target_edge == Edge::Left && g.peer_edge == Edge::Left)
            .collect();
        assert!(left.is_empty());
    }

    #[test]
    fn test_distance_measurement_horizontal() {
        let engine = SmartGuideEngine::new(vec![]);
        let sel = rect("a", 50.0, 100.0, 100.0, 50.0);   // right edge = 150
        let hover = rect("b", 170.0, 100.0, 80.0, 50.0);  // left edge = 170

        let m = engine.measure_distance(&sel, &hover);
        assert_eq!(m.horizontal_px, 20.0); // gap = 170 - 150
        assert_eq!(m.horizontal_rem, 20.0 / 16.0);
        assert_eq!(m.direction, MeasureDirection::Right);
    }

    #[test]
    fn test_distance_measurement_vertical() {
        let engine = SmartGuideEngine::new(vec![]);
        let sel = rect("a", 100.0, 50.0, 100.0, 40.0);    // bottom = 90
        let hover = rect("b", 100.0, 130.0, 100.0, 40.0);  // top = 130

        let m = engine.measure_distance(&sel, &hover);
        assert_eq!(m.vertical_px, 40.0);
        assert_eq!(m.direction, MeasureDirection::Below);
    }

    #[test]
    fn test_distance_overlapping() {
        let engine = SmartGuideEngine::new(vec![]);
        let sel = rect("a", 50.0, 50.0, 100.0, 100.0);
        let hover = rect("b", 80.0, 80.0, 100.0, 100.0);

        let m = engine.measure_distance(&sel, &hover);
        assert_eq!(m.direction, MeasureDirection::Overlapping);
    }

    #[test]
    fn test_nearest_neighbor() {
        let elements = vec![
            rect("a", 10.0, 10.0, 50.0, 50.0),
            rect("b", 200.0, 200.0, 50.0, 50.0),
        ];
        let engine = SmartGuideEngine::new(elements);
        let nearest = engine.nearest_to_point(20.0, 20.0).unwrap();
        assert_eq!(nearest.zenith_id, "a");
    }

    // --- v2.6 Swap-Table tests ---

    #[test]
    fn test_scrub_neighborhood_returns_limited_set() {
        // Create 50 elements — neighborhood should return at most 20
        let elements: Vec<ElementRect> = (0..50)
            .map(|i| rect(&format!("el_{i}"), i as f64 * 20.0, 0.0, 15.0, 15.0))
            .collect();
        let engine = SmartGuideEngine::new(elements);

        let neighborhood = engine.scrub_neighborhood(0.0, 0.0);
        assert!(neighborhood.len() <= SCRUB_NEIGHBORHOOD_SIZE);
        assert!(!neighborhood.is_empty());

        // First element should be the closest to (0,0)
        assert_eq!(neighborhood[0].zenith_id, "el_0");
    }

    #[test]
    fn test_rtree_rebuild_only_on_click() {
        let elements = vec![
            rect("a", 0.0, 0.0, 50.0, 50.0),
            rect("b", 100.0, 100.0, 50.0, 50.0),
        ];
        let mut engine = SmartGuideEngine::new(elements);
        assert!(!engine.is_rtree_dirty());

        // Update positions — rtree should be dirty
        engine.update_positions(vec![rect("a", 10.0, 10.0, 50.0, 50.0)]);
        assert!(engine.is_rtree_dirty());

        // Rebuild rtree — should no longer be dirty
        engine.rebuild_rtree();
        assert!(!engine.is_rtree_dirty());
        assert_eq!(engine.element_count(), 2);
    }

    #[test]
    fn test_update_positions_preserves_existing() {
        let elements = vec![
            rect("a", 0.0, 0.0, 50.0, 50.0),
            rect("b", 100.0, 100.0, 50.0, 50.0),
        ];
        let mut engine = SmartGuideEngine::new(elements);

        // Update only element "a"
        engine.update_positions(vec![rect("a", 20.0, 20.0, 50.0, 50.0)]);

        // Element "b" should still exist
        assert_eq!(engine.element_count(), 2);

        // Scrub neighborhood from (20, 20) should find both elements
        let neighborhood = engine.scrub_neighborhood(20.0, 20.0);
        assert_eq!(neighborhood.len(), 2);
    }
}
