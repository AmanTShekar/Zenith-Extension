import * as fs from 'fs';
import * as path from 'path';

/**
 * Zenith Hot Path — Ring Buffer Producer (TypeScript / Node.js)
 * 
 * This module implements the producer side of the SharedArrayBuffer (SAB) 
 * ring buffer protocol. It writes slider scrub events directly to a 
 * memory-mapped file that the Rust sidecar consumes in a tight loop.
 * 
 * Version: 0x03 (Magic: ZNTH)
 */

// --- Constants (Must match Sidecar's ring_buffer.rs) ---
const RING_SIZE = 256;
const SLOT_SIZE = 128;
const RING_MASK = RING_SIZE - 1;

const OFF_SEQUENCE = 0;    // u32
const OFF_MSG_TYPE = 4;    // u32
const OFF_TIMESTAMP = 8;   // u64
const OFF_ZENITH_HASH = 16; // u64
const OFF_ZENITH_ID_RAW = 24; // [u8; 12]
const OFF_PROPERTY_ID = 36; // u16
const OFF_VALUE = 40;      // f64
const OFF_UNIT = 48;       // u32
const OFF_FLAGS = 52;      // u32
const OFF_TX_ID_LO = 56;   // u64
const OFF_VELOCITY_HINT = 64; // f32

const MAGIC_ZNTH = 0x5A4E5448; // "ZNTH"

export enum ScrubMsgType {
    Scrub = 1,
    Release = 2,
    Ack = 3
}

export class RingBufferProducer {
    private fd: number | null = null;
    private sequence = 1;

    // v3.8 Velocity tracking state
    private velocityState: Map<string, { lastValue: number, lastTs: number }> = new Map();

    constructor(private readonly sabPath: string) {
        try {
            // Ensure directory exists
            const dir = path.dirname(sabPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Open for reading and writing (r+)
            // If it doesn't exist, create it (w+)
            const flags = fs.existsSync(sabPath) ? 'r+' : 'w+';
            this.fd = fs.openSync(sabPath, flags);

            // Pre-allocate if new
            const totalSize = 4 + (RING_SIZE * SLOT_SIZE);
            const stats = fs.fstatSync(this.fd);
            if (stats.size < totalSize) {
                fs.writeSync(this.fd, Buffer.alloc(totalSize), 0, totalSize, 0);
            }

            // Write Magic Number (Layer 4 handshake) at offset 0
            const magicBuf = Buffer.alloc(4);
            magicBuf.writeUInt32LE(MAGIC_ZNTH, 0); // "ZNTH" in Little Endian
            fs.writeSync(this.fd, magicBuf, 0, 4, 0);

            console.log(`[Zenith HotPath] Producer initialized at ${sabPath} (v3.8 Layout)`);
        } catch (err) {
            console.error(`[Zenith HotPath] Failed to initialize SAB producer:`, err);
            this.fd = null;
        }
    }

    /**
     * Write a scrub event to the ring buffer.
     * 
     * Uses layered collision defense:
     * - Layer 1: Raw string ID (Base62)
     * - Layer 3: 64-bit Dual FNV-1a Hash
     */
    public writeScrub(
        ghostId: string, 
        propertyId: number, 
        value: number, 
        msgType: ScrubMsgType = ScrubMsgType.Scrub
    ): void {
        if (this.fd === null) return;

        const slotIndex = (this.sequence - 1) & RING_MASK;
        const slotBase = 4 + (slotIndex * SLOT_SIZE);
        
        // Create slot buffer
        const buf = Buffer.alloc(SLOT_SIZE);
        
        // 1. Message Type
        buf.writeUInt32LE(msgType, OFF_MSG_TYPE);
        
        // 2. Timestamp (microseconds)
        const ts = BigInt(Math.floor(performance.now() * 1000));
        buf.writeBigUInt64LE(ts, OFF_TIMESTAMP);
        
        // 3. 64-bit Hash (Layer 3)
        const hash = fnv1aBinary64(ghostId);
        buf.writeBigUInt64LE(hash, OFF_ZENITH_HASH);
        
        // 4. Raw ID (Layer 1) - Max 12 chars base62
        const idBuf = Buffer.from(ghostId.slice(0, 12), 'utf8');
        idBuf.copy(buf, OFF_ZENITH_ID_RAW);
        
        // 5. Property \u0026 Value
        buf.writeUInt16LE(propertyId, OFF_PROPERTY_ID);
        buf.writeDoubleLE(value, OFF_VALUE);
        
        // v3.8: Compute Velocity Hint (Delta per MS)
        const stateKey = `${ghostId}:${propertyId}`;
        const now = performance.now();
        const last = this.velocityState.get(stateKey);
        let velocity = 0;
        
        if (last) {
            const dt = now - last.lastTs;
            if (dt > 0) {
                velocity = (value - last.lastValue) / dt;
            }
        }
        
        // Issue 6: Velocity Hint Validation
        if (!Number.isFinite(velocity)) {
            velocity = 0;
        }

        this.velocityState.set(stateKey, { lastValue: value, lastTs: now });
        buf.writeFloatLE(velocity, OFF_VELOCITY_HINT);
        
        // 6. Write Payload (offsets 4..SLOT_SIZE)
        fs.writeSync(this.fd, buf, 4, SLOT_SIZE - 4, slotBase + 4);
        
        // 7. Write Sequence (offset 0) - Atomic Release Gate
        const seqBuf = Buffer.alloc(4);
        seqBuf.writeUInt32LE(this.sequence, 0);
        fs.writeSync(this.fd, seqBuf, 0, 4, slotBase + OFF_SEQUENCE);

        this.sequence++;
    }

    public dispose() {
        if (this.fd !== null) {
            fs.closeSync(this.fd);
            this.fd = null;
        }
    }
}

/**
 * 64-bit FNV-1a Hashing (Matches Rust sidecar implementation)
 */
export function fnv1aBinary64(s: string): bigint {
    let h = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;
    const buf = Buffer.from(s, 'utf8');
    for (const b of buf) {
        h ^= BigInt(b);
        h = (h * prime) & 0xffffffffffffffffn;
    }
    return h;
}
