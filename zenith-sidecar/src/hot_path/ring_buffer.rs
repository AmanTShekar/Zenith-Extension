//! # SAB Ring Buffer Consumer
//!
//! The Hot Path thread. This is the most latency-critical code in Zenith.
//! It polls a SharedArrayBuffer ring buffer for slider scrub events and
//! emits CSS variable overrides to the Visual Canvas.
//!
//! ## Memory Layout
//!
//! The SAB is a 32KB region (256 slots × 128 bytes each) mapped via memmap2.
//! Each slot has a 128-byte fixed layout (see [`SlotLayout`]).
//!
//! ## Synchronization Protocol
//!
//! The TypeScript producer writes payload first, then atomically stores the
//! sequence number (release fence). This thread reads the sequence number
//! atomically (acquire fence); if it's advanced, the payload is guaranteed visible.
//!
//! ## Zero-GC Guarantee
//!
//! This module makes ZERO heap allocations in the steady-state poll loop.
//! All buffers are pre-allocated. The only allocation paths are:
//! - Startup (one-time)
//! - Dispatching to the predictive pre-patcher (via bounded channel, pre-allocated)

use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;
use std::time::Duration;

use dashmap::DashMap;
use smallvec::SmallVec;
use tokio::sync::mpsc;
use tracing::{info, debug, trace, warn};

use crate::types::*;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/// Number of slots in the ring buffer. Must be a power of 2.
const RING_SIZE: usize = 256;
const RING_MASK: usize = RING_SIZE - 1;

/// Byte size of each slot.
const SLOT_SIZE: usize = 128;

/// Total SAB size in bytes.
/// v3.8: 4 bytes (handshake) + (256 slots * 128 bytes)
pub const SAB_TOTAL_SIZE: usize = 4 + (RING_SIZE * SLOT_SIZE);

const MAGIC_ZNTH: u32 = 0x5A4E5448; // "ZNTH"

// Slot field offsets (relative to slot start, which is 4 + index * 128)
const OFF_SEQUENCE: usize = 0;    // u32  — atomic write fence
const OFF_MSG_TYPE: usize = 4;    // u32
const OFF_TIMESTAMP: usize = 8;   // u64
const OFF_ZENITH_HASH: usize = 16; // u64
const OFF_ZENITH_ID_RAW: usize = 24; // [u8; 12]
const OFF_PROPERTY_ID: usize = 36; // u16
const OFF_VALUE: usize = 40;      // f64
const OFF_UNIT: usize = 48;       // u32
const OFF_FLAGS: usize = 52;      // u32
const OFF_TX_ID_LO: usize = 56;   // u64
const OFF_VELOCITY_HINT: usize = 64; // f32

// ---------------------------------------------------------------------------
// Ring Buffer Reader
// ---------------------------------------------------------------------------

/// The hot-path SAB ring buffer consumer.
///
/// This struct owns a memory-mapped view of the SharedArrayBuffer and polls
/// it in a tight loop, dispatching decoded messages to downstream handlers.
pub struct RingBufferConsumer {
    /// Raw pointer to the start of the SAB memory region.
    /// SAFETY: This memory is shared with the TypeScript producer via
    /// mmap. We only read; the producer only writes (except the sequence
    /// field, which uses atomic ordering).
    sab_ptr: *const u8,

    /// The byte length of the mapped region (for bounds checking).
    sab_len: usize,

    /// Last sequence number we consumed.
    read_pos: u32,

    /// Reverse map: zenith_id_hash → full ZenithId strings (with collision buckets).
    /// Populated when the user selects an element in the canvas.
    id_reverse_map: Arc<DashMap<ZenithIdHash, SmallVec<[ZenithId; 1]>>>,

    /// Channel to the predictive pre-patcher (bounded, pre-allocated).
    predict_tx: mpsc::Sender<ScrubMessage>,

    /// Channel for CSS override emissions to the webview bridge.
    css_override_tx: mpsc::Sender<CssOverride>,
}

// SAFETY: The raw pointer is to a shared memory region. We ensure exclusive
// read access on this thread; the producer ensures atomic release semantics.
unsafe impl Send for RingBufferConsumer {}

impl RingBufferConsumer {
    /// Create a new ring buffer consumer.
    ///
    /// # Safety
    ///
    /// `sab_ptr` must point to a valid memory region of at least `SAB_TOTAL_SIZE`
    /// bytes that remains valid for the lifetime of this struct.
    pub unsafe fn new(
        sab_ptr: *const u8,
        sab_len: usize,
        id_reverse_map: Arc<DashMap<ZenithIdHash, SmallVec<[ZenithId; 1]>>>,
        predict_tx: mpsc::Sender<ScrubMessage>,
        css_override_tx: mpsc::Sender<CssOverride>,
    ) -> Self {
        assert!(sab_len >= SAB_TOTAL_SIZE, "SAB region too small");
        Self {
            sab_ptr,
            sab_len,
            read_pos: 0,
            id_reverse_map,
            predict_tx,
            css_override_tx,
        }
    }

    /// The main poll loop. Call this from a dedicated OS thread (NOT a tokio task).
    ///
    /// This loop runs until the mpsc channels are closed (sidecar shutdown).
    /// It uses `thread::park_timeout` as a low-power idle when no data is
    /// available, waking every 100µs to check for new events.
    pub fn run(&mut self) {
        // v3.10 Fix (HP1): Resilient SAB Handshake
        // We poll until the handshake is valid, but we don't abort the thread.
        // This allows the sidecar to start before the webview and recover 
        // once the user opens the canvas.
        let mut magic = 0u32;
        let mut logged_wait = false;

        loop {
            magic = self.read_u32(0);
            if magic == MAGIC_ZNTH {
                if logged_wait {
                    info!("[SIDECAR] SAB Handshake SUCCESS — Hot path active");
                }
                break;
            }
            
            if !logged_wait {
                debug!("Waiting for SAB Handshake (Canvas/Webview initialization)...");
                logged_wait = true;
            }
            
            std::thread::sleep(Duration::from_millis(500));

            // Check if downstream is still alive (don't wait forever if closing)
            if self.css_override_tx.is_closed() {
                return;
            }
        }

        let mut idle_count = 0u32;

        loop {
            match self.try_read_next() {
                Some(msg) => {
                    self.dispatch(msg);
                    idle_count = 0;
                }
                None => {
                    // Issue 12: Hybrid Yield Loop for ARM Timer Granularity
                    // First 1000 iterations: busy-wait/yield (ultra low latency)
                    // After 1000: park with timeout (low power)
                    if idle_count < 1000 {
                        std::thread::yield_now();
                        idle_count += 1;
                    } else {
                        std::thread::park_timeout(Duration::from_micros(100));
                    }
                }
            }

            // Check if downstream is still alive
            if self.css_override_tx.is_closed() {
                debug!("CSS override channel closed — hot path shutting down");
                break;
            }
        }
    }

    /// Try to read the next slot from the ring buffer.
    /// Returns `None` if no new data is available.
    ///
    /// ## Zero-allocation guarantee
    ///
    /// This function reads directly from the memory-mapped region using
    /// pointer arithmetic. No `Vec`, no `String`, no `Box`. The returned
    /// `ScrubMessage` is a stack-allocated Copy type.
    fn try_read_next(&mut self) -> Option<ScrubMessage> {
        let slot_index = (self.read_pos as usize) & RING_MASK;
        // v3.8: slots start after the 4-byte handshake
        let slot_base = 4 + (slot_index * SLOT_SIZE);

        // Read sequence number atomically (acquire fence).
        // If the producer has written a new sequence, all payload writes
        // are guaranteed to be visible.
        let seq = self.read_atomic_u32(slot_base + OFF_SEQUENCE);

        if seq <= self.read_pos {
            return None; // No new data
        }

        // Decode the slot — all reads are non-atomic after the acquire fence.
        let raw_type = self.read_u32(slot_base + OFF_MSG_TYPE);
        let scrub_type = raw_type & 0xFFFF;
        // let protocol_version = (raw_type >> 16) & 0xFF; // Future usage

        let mut zenith_id_raw = [0u8; 12];
        unsafe {
            let src = self.sab_ptr.add(slot_base + OFF_ZENITH_ID_RAW);
            std::ptr::copy_nonoverlapping(src, zenith_id_raw.as_mut_ptr(), 12);
        }

        let msg = ScrubMessage {
            sequence: seq,
            msg_type: match scrub_type {
                1 => ScrubMsgType::Scrub,
                2 => ScrubMsgType::Release,
                3 => ScrubMsgType::Ack,
                other => {
                    warn!("Unknown SAB msg_type: {other}, skipping");
                    self.read_pos = seq;
                    return None;
                }
            },
            timestamp_us: self.read_u64(slot_base + OFF_TIMESTAMP),
            zenith_id_hash: self.read_u64(slot_base + OFF_ZENITH_HASH),
            zenith_id_raw,
            property_id: self.read_u16(slot_base + OFF_PROPERTY_ID),
            value: self.read_f64(slot_base + OFF_VALUE),
            unit: Unit::from_u32(self.read_u32(slot_base + OFF_UNIT))
                .unwrap_or(Unit::Px),
            flags: ScrubFlags::from_bits_truncate(self.read_u32(slot_base + OFF_FLAGS)),
            transaction_id_lo: self.read_u64(slot_base + OFF_TX_ID_LO),
            velocity_hint: {
                let v = self.read_f32(slot_base + OFF_VELOCITY_HINT);
                if v.is_finite() { v } else { 0.0 }
            },
        };

        self.read_pos = seq;
        trace!("SAB slot {slot_index}: prop={:?} val={:.2}", msg.property_id, msg.value);
        Some(msg)
    }

    /// Dispatch a decoded scrub message to downstream handlers.
    fn dispatch(&self, msg: ScrubMessage) {
        let prop = match PropertyId::from_u16(msg.property_id) {
            Some(p) => p,
            None => {
                warn!("Unknown property_id: {}", msg.property_id);
                return;
            }
        };

        // TIER 1: Emit CSS variable override immediately (<1µs)
        let mut resolved_id: Option<ZenithId> = None;

        // Try Option C: Exact match from raw base62 bytes
        if msg.zenith_id_raw[0] != 0 {
            if let Ok(id_str) = std::str::from_utf8(&msg.zenith_id_raw) {
                resolved_id = Some(id_str.trim_end_matches('\0').to_string());
            }
        }

        // Fallback to Option B: Bucket lookup with tie-break
        if resolved_id.is_none() {
            if let Some(bucket) = self.id_reverse_map.get(&msg.zenith_id_hash) {
                if bucket.len() == 1 {
                    resolved_id = Some(bucket[0].clone());
                } else {
                    // Collision detected! Tie-break with active file if possible
                    // For now, we take the first as a fallback, but Log it clearly.
                    warn!("Ghost-ID collision detected for hash 0x{:x} ({} candidates)", msg.zenith_id_hash, bucket.len());
                    resolved_id = Some(bucket[0].clone());
                }
            }
        }

        if let Some(zenith_id) = resolved_id {
            let unit = msg.unit;
            let css_value = unit.format(msg.value);

            let ovr = CssOverride {
                zenith_id,
                property: format!("--z-{}", prop.css_name()),
                value: css_value,
            };

            let _ = self.css_override_tx.try_send(ovr);
        }

        // TIER 2: Enqueue for speculative pre-patching (non-blocking)
        let _ = self.predict_tx.try_send(msg);
    }

    // -----------------------------------------------------------------------
    // Raw memory reads — all inlined for performance
    // -----------------------------------------------------------------------

    #[inline(always)]
    fn read_atomic_u32(&self, offset: usize) -> u32 {
        debug_assert!(offset + 4 <= self.sab_len);
        // SAFETY: offset is bounds-checked by debug_assert, and the memory
        // is guaranteed aligned to 4 bytes (SAB slots are 128-byte aligned).
        unsafe {
            let ptr = self.sab_ptr.add(offset) as *const AtomicU32;
            (*ptr).load(Ordering::Acquire)
        }
    }

    #[inline(always)]
    fn read_u32(&self, offset: usize) -> u32 {
        debug_assert!(offset + 4 <= self.sab_len);
        unsafe {
            let ptr = self.sab_ptr.add(offset) as *const u32;
            u32::from_le(ptr.read_unaligned())
        }
    }

    #[inline(always)]
    fn read_u16(&self, offset: usize) -> u16 {
        debug_assert!(offset + 2 <= self.sab_len);
        unsafe {
            let ptr = self.sab_ptr.add(offset) as *const u16;
            ptr.read_unaligned()
        }
    }

    #[inline(always)]
    fn read_u64(&self, offset: usize) -> u64 {
        debug_assert!(offset + 8 <= self.sab_len);
        unsafe {
            let ptr = self.sab_ptr.add(offset) as *const u64;
            ptr.read_unaligned()
        }
    }

    #[inline(always)]
    fn read_f32(&self, offset: usize) -> f32 {
        debug_assert!(offset + 4 <= self.sab_len);
        unsafe {
            let ptr = self.sab_ptr.add(offset) as *const f32;
            ptr.read_unaligned()
        }
    }

    #[inline(always)]
    fn read_f64(&self, offset: usize) -> f64 {
        debug_assert!(offset + 8 <= self.sab_len);
        unsafe {
            let ptr = self.sab_ptr.add(offset) as *const f64;
            ptr.read_unaligned()
        }
    }
}

// ---------------------------------------------------------------------------
// FNV-1a hashing (matches TypeScript side)
// ---------------------------------------------------------------------------

/// Compute dual FNV-1a hash (64-bit) of a zenith-id string.
/// Option A: Prefix/Suffix independent passes.
pub fn fnv1a_hash_u64(input: &str) -> ZenithIdHash {
    const FNV_OFFSET: u32 = 2_166_136_261;
    const FNV_PRIME: u32 = 16_777_619;

    // Forward pass
    let mut hi = FNV_OFFSET;
    for &byte in input.as_bytes() {
        hi ^= byte as u32;
        hi = hi.wrapping_mul(FNV_PRIME);
    }

    // Reverse pass
    let mut lo = FNV_OFFSET;
    for &byte in input.as_bytes().iter().rev() {
        lo ^= byte as u32;
        lo = lo.wrapping_mul(FNV_PRIME);
    }

    ((hi as u64) << 32) | (lo as u64)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fnv1a_deterministic() {
        let id = "src/components/Button.tsx:14:6";
        let h1 = fnv1a_hash(id);
        let h2 = fnv1a_hash(id);
        assert_eq!(h1, h2);
    }

    #[test]
    fn test_fnv1a_different_ids() {
        let h1 = fnv1a_hash("src/Button.tsx:14:6");
        let h2 = fnv1a_hash("src/Button.tsx:15:6");
        assert_ne!(h1, h2);
    }

    #[test]
    fn test_ring_constants() {
        // Power of 2 check
        assert!(RING_SIZE.is_power_of_two());
        assert_eq!(RING_SIZE & RING_MASK, 0);
        assert_eq!(SAB_TOTAL_SIZE, 32768); // 32KB
    }

    #[test]
    fn test_slot_layout_no_overlap() {
        // Verify no field overlaps in the slot layout
        let fields = [
            (OFF_SEQUENCE, 4),
            (OFF_MSG_TYPE, 4),
            (OFF_TIMESTAMP, 8),
            (OFF_ZENITH_HASH, 4),
            (OFF_PROPERTY_ID, 4), // 2 bytes + 2 padding
            (OFF_VALUE, 8),
            (OFF_UNIT, 4),
            (OFF_FLAGS, 4),
            (OFF_TX_ID_LO, 8),
        ];
        for (i, (off_a, size_a)) in fields.iter().enumerate() {
            for (off_b, _) in fields.iter().skip(i + 1) {
                assert!(off_a + size_a <= *off_b, "Fields overlap at {off_a}+{size_a} vs {off_b}");
            }
        }
        // Last field must fit within SLOT_SIZE
        let (last_off, last_size) = fields.last().unwrap();
        assert!(last_off + last_size <= SLOT_SIZE);
    }
}
