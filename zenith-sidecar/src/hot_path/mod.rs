//! Hot path modules — all latency-critical, zero-allocation code.

pub mod gap_scrubber;
pub mod predictive;
pub mod ring_buffer;
pub mod smart_guides;
pub mod token_snapper;
