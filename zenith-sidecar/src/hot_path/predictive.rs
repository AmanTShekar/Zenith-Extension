//! # Predictive Pre-Patcher
//!
//! Uses a Rayon thread pool to speculatively compute AST patches for
//! the ±2 neighbor values of any active slider scrub. Results are cached
//! in a DashMap for O(1) lookup on slider release.

use std::sync::Arc;

use dashmap::DashMap;
use tokio::sync::mpsc;
use tracing::{debug, trace};

use crate::types::*;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/// Cache key: (zenith_id_hash, property_id, value as f64 bits).
/// Using f64 bits (u64) ensures exact floating-point comparison.
pub type PredictCacheKey = (ZenithIdHash, u16, u64);

/// A pre-computed patch result ready for instant emission.
#[derive(Debug, Clone)]
pub struct PrecomputedPatch {
    /// The resolved Tailwind class (e.g., "p-6") or CSS value.
    pub resolved_class: String,
    /// CSS override for ghost preview.
    pub css_override: CssOverride,
    /// Source text edit (ready for VFS staging).
    pub text_edit: Option<TextEdit>,
}

// ---------------------------------------------------------------------------
// Predictive Patcher
// ---------------------------------------------------------------------------

pub struct PredictivePatcher {
    /// Pre-computed patch cache. Lock-free concurrent hashmap.
    cache: Arc<DashMap<PredictCacheKey, PrecomputedPatch>>,

    /// Rayon thread pool for speculative computation.
    pool: rayon::ThreadPool,

    /// Receiver for scrub events from the hot path.
    scrub_rx: mpsc::Receiver<ScrubMessage>,

    /// Tailwind spacing scale (loaded from user's config).
    spacing_scale: Vec<f64>,
}

impl PredictivePatcher {
    pub fn new(
        scrub_rx: mpsc::Receiver<ScrubMessage>,
        cache: Arc<DashMap<PredictCacheKey, PrecomputedPatch>>,
    ) -> Self {
        // Build rayon pool with N-2 threads (leave 2 cores for hot path + RPC)
        let num_threads = num_cpus::get().saturating_sub(2).max(2);

        let pool = rayon::ThreadPoolBuilder::new()
            .num_threads(num_threads)
            .thread_name(|i| format!("zenith-predict-{i}"))
            .build()
            .expect("Failed to build rayon pool");

        // Default Tailwind spacing scale (0 through 96).
        // This will be replaced by parsing the user's tailwind.config on init.
        let spacing_scale = vec![
            0.0, 1.0, 2.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0,
            14.0, 16.0, 20.0, 24.0, 28.0, 32.0, 36.0, 40.0, 44.0, 48.0,
            52.0, 56.0, 60.0, 64.0, 72.0, 80.0, 96.0,
        ];

        Self {
            cache,
            pool,
            scrub_rx,
            spacing_scale,
        }
    }

    /// Main loop: receive scrub events and fan-out speculative computations.
    pub async fn run(&mut self) {
        debug!("Predictive pre-patcher started");

        while let Some(msg) = self.scrub_rx.recv().await {
            if msg.msg_type != ScrubMsgType::Scrub {
                continue; // Only pre-compute during active scrubbing
            }

            let neighbors = self.compute_neighbors(msg.property_id, msg.value, msg.unit, msg.velocity_hint);
            let cache = self.cache.clone();
            let zenith_hash = msg.zenith_id_hash;
            let prop_id = msg.property_id;

            // Fan out to rayon — non-blocking
            self.pool.spawn(move || {
                for neighbor_val in neighbors {
                    let key = (zenith_hash, prop_id, neighbor_val.to_bits());

                    // Skip if already cached
                    if cache.contains_key(&key) {
                        trace!("Predict cache hit for val={neighbor_val:.2}");
                        continue;
                    }

                    // Compute the patch (this is the expensive part, ~20-50ms)
                    if let Some(patch) = compute_speculative_patch(
                        zenith_hash,
                        prop_id,
                        neighbor_val,
                    ) {
                        cache.insert(key, patch);
                        trace!("Predict cache populated for val={neighbor_val:.2}");
                    }
                }
            });
        }
    }

    /// Compute ±2 neighbor values biased by velocity.
    fn compute_neighbors(&self, _prop_id: u16, current: f64, unit: Unit, velocity: f32) -> Vec<f64> {
        // v3.10: Velocity Clamping (Patch 6)
        let velocity = velocity.clamp(-10.0, 10.0);
        let bias = if velocity > 0.1 { 1 } else if velocity < -0.1 { -1 } else { 0 };

        match unit {
            Unit::TailwindStep => {
                let idx = self.spacing_scale
                    .iter()
                    .enumerate()
                    .min_by(|(_, a), (_, b)| {
                        ((**a) - current).abs().partial_cmp(&((**b) - current).abs()).unwrap()
                    })
                    .map(|(i, _)| i)
                    .unwrap_or(0);

                let mut indices = Vec::with_capacity(4);
                if bias >= 0 {
                    indices.push(idx + 1);
                    indices.push(idx + 2);
                    indices.push(idx + 3);
                }
                if bias <= 0 {
                    indices.push(idx.saturating_sub(1));
                    indices.push(idx.saturating_sub(2));
                    indices.push(idx.saturating_sub(3));
                }

                indices.into_iter()
                    .filter(|&i| i < self.spacing_scale.len())
                    .map(|i| self.spacing_scale[i])
                    .filter(|v| (*v - current).abs() > f64::EPSILON)
                    .collect()
            }
            Unit::Px => {
                let mut vals = Vec::with_capacity(4);
                if bias >= 0 {
                    vals.push(current + 1.0);
                    vals.push(current + 2.0);
                    vals.push(current + 3.0);
                }
                if bias <= 0 {
                    vals.push((current - 1.0).max(0.0));
                    vals.push((current - 2.0).max(0.0));
                    vals.push((current - 3.0).max(0.0));
                }
                vals
            }
            _ => {
                if bias > 0 {
                    vec![current + 1.0, current + 2.0]
                } else if bias < 0 {
                    vec![(current - 1.0).max(0.0), (current - 2.0).max(0.0)]
                } else {
                    vec![(current - 1.0).max(0.0), current + 1.0]
                }
            }
        }
    }

    /// Try to get a pre-computed patch from the cache.
    /// Called on slider release for instant emission.
    pub fn try_get(
        &self,
        zenith_hash: ZenithIdHash,
        prop_id: u16,
        value: f64,
    ) -> Option<PrecomputedPatch> {
        let key = (zenith_hash, prop_id, value.to_bits());
        self.cache.get(&key).map(|entry| entry.value().clone())
    }

    /// Evict all cached patches for a given element.
    /// Called when the user deselects an element.
    pub fn evict_element(&self, zenith_hash: ZenithIdHash) {
        self.cache.retain(|k, _| k.0 != zenith_hash);
    }

    /// Evict all cached patches. Called on commit or full re-injection.
    pub fn evict_all(&self) {
        self.cache.clear();
    }
}

/// Compute a speculative AST patch for a given value.
///
/// This is the expensive function (~20-50ms) that gets parallelized
/// across the Rayon pool. It parses the AST node, applies the patch,
/// and returns a ready-to-emit result.
///
/// TODO: Connect to the actual SWC AST infrastructure.
fn compute_speculative_patch(
    _zenith_hash: ZenithIdHash,
    prop_id: u16,
    value: f64,
) -> Option<PrecomputedPatch> {
    let prop = PropertyId::from_u16(prop_id)?;
    let unit = Unit::Px; // TODO: determine from context

    let resolved_class = format!("{}-[{}]", prop.tw_prefix(), unit.format(value));
    let css_value = unit.format(value);

    Some(PrecomputedPatch {
        resolved_class,
        css_override: CssOverride {
            zenith_id: String::new(), // Resolved at emission time via reverse map
            property: format!("--z-{}", prop.css_name()),
            value: css_value,
        },
        text_edit: None, // TODO: full AST edit computation
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tailwind_neighbors() {
        let (tx, rx) = mpsc::channel(1);
        let cache = Arc::new(DashMap::new());
        let patcher = PredictivePatcher::new(rx, cache);

        // Current value is 16.0 (p-4 in Tailwind, index 14 in scale)
        let neighbors = patcher.compute_neighbors(0, 16.0, Unit::TailwindStep, 0.0);
        // Should include values around 16: 12, 14, 20 (±2 in scale)
        assert!(!neighbors.is_empty());
        assert!(!neighbors.contains(&16.0)); // Current value excluded
    }

    #[test]
    fn test_px_neighbors() {
        let (tx, rx) = mpsc::channel(1);
        let cache = Arc::new(DashMap::new());
        let patcher = PredictivePatcher::new(rx, cache);

        let neighbors = patcher.compute_neighbors(0, 24.0, Unit::Px, 0.0);
        assert_eq!(neighbors, vec![22.0, 23.0, 25.0, 26.0]);
    }

    #[test]
    fn test_cache_eviction() {
        let (tx, rx) = mpsc::channel(1);
        let cache = Arc::new(DashMap::new());
        let patcher = PredictivePatcher::new(rx, cache.clone());

        let hash: ZenithIdHash = 12345;
        cache.insert((hash, 0, 1.0f64.to_bits()), PrecomputedPatch {
            resolved_class: "p-1".into(),
            css_override: CssOverride {
                zenith_id: String::new(),
                property: "--z-padding".into(),
                value: "0.25rem".into(),
            },
            text_edit: None,
        });

        assert_eq!(cache.len(), 1);
        patcher.evict_element(hash);
        assert_eq!(cache.len(), 0);
    }
}
