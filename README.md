# Zenith Extension - Design To Code
### Senior-Architect Technical Manual & Formal Specification

Zenith is a **Surgical Design OS** for modern web applications. Unlike traditional design tools that treat code as a secondary output, Zenith treats the source code AST as a live, observable artboard. It uses a non-destructive, AST-based mutation engine to transform visual design intents into atomic source code patches with zero logic drift.

---

## 🚀 Core Performance Specifications

| Metric | Target | Actual (v11.7.6) | Mechanism |
| :--- | :--- | :--- | :--- |
| **Hot-Path Latency** | < 1.0ms | **< 0.45ms** | SAB Ring Buffer (Shared Memory) |
| **Cold-Boot Indexing** | < 1000ms | **~15ms** | MessagePack Incremental Snapshotting |
| **Mutation Integrity** | 100% | **100%** | Babel-Recast Surgical AST Transform |
| **Persistence Latency** | < 5ms | **~2ms** | WAL-backed In-Place Truncation |

---

## 🧠 System Architecture

Zenith is composed of three decoupled layers synchronized via a high-velocity binary bridge:

1.  **Sidecar Engine (Rust)**: The source-of-truth. Manages the VFS, WAL, and JSON-RPC command plane.
2.  **Ghost-Runtime (TypeScript/Vite)**: Injects stable `data-zenith-id` markers into the DOM without altering business logic.
3.  **Surgical Patcher (Node.js/Babel)**: Executes atomic AST transformations using structural path-based resolution.

### 1. Memory-Mapped IPC (SAB Protocol)
The "Hot-Path" for scrubbing (e.g., real-time color/width dragging) bypasses the WebSocket stack entirely. It uses a **SharedArrayBuffer** ring buffer.

#### **Binary Slot Layout (128-byte Partition)**:
```text
[0-7]   : Atomic Sequence Number (Gating)
[8-15]  : Message Type (0x01: Hover, 0x02: Scrub, 0x03: Select)
[16-31] : Ghost-ID Hash (FNV-1a 64-bit)
[32-39] : Value Float/Int
[40-127]: Velocity Hint + Reserved Metadata
```
*   **Collision Mitigation**: FNV-1a hashing ensures O(1) attribute lookup with collision resistance for up to 10k unique IDs per view.
*   **UI Debouncing**: Velocity hints allow the extension to drop intermediate frames during hyper-fast designer movements, preserving CPU for AST operations.

---

## 🗡️ The Surgical Mutation Engine

Zenith uses "Surgical Mutation" rather than string manipulation. This ensures that comments, formatting, and—most importantly—business logic are never corrupted.

### Logic-Locking (Safety First)
To prevent the engine from overwriting critical logic, the patcher implements **Logic-Locking**. It forbids mutations within "Dynamic Zones":
*   **Iterators**: Direct children of `.map()` or `.filter()`.
*   **Conditionals**: Elements inside ternary expressions (`? :`) or logical operators (`&&`).
*   **Dynamic Hooks**: IIFEs and immediately invoked arrow functions.

> [!TIP]
> Elements in Dynamic Zones are marked as "Logic Locked" in the UI. Modifications must be made in the source code directly to maintain data integrity.

### Structural Path Resolution
Ghost IDs are stable strings (e.g., `zenith:div.0:p.2`) derived from the AST hierarchy.
*   **Self-Healing**: v11.7 introduced **Fingerprint-Fuzzy Matching**. If a developer manually adds an element, Zenith calculates a fuzzy fingerprint (tag + attributes) to re-align the Ghost-ID map without requiring a full re-scan.

---

## 📜 Virtual File System (VFS) & WAL

The VFS uses **Copy-on-Write (COW)** overlays via functional data structures (`im::HashMap`).

### Two-Phase Commit (2PC)
1.  **Stage**: Mutation intent is validated against logic locks and appended to the `stage.wal`.
2.  **Commit**: The staged overlay is merged into the base layer, and physical file writes are executed atomically.

### Windows Persistence Hardening (v11.7.6 Fix)
To bypass Windows `OS Error 5 (Access Denied)` during WAL cleanup:
*   Zenith maintains a long-lived file handle to `stage.wal`.
*   Cleanup is performed via **In-Place Truncation**: `set_len(0)` followed by `seek(0)`.
*   This prevents race-conditions with Windows Indexer/AV services that occur when files are dropped and recreated.

---

## 📡 JSON-RPC API Reference (Command Plane)

The WebSocket control plane (default port: `8082`) handles administrative and structural tasks.

| Method | Params | Description |
| :--- | :--- | :--- |
| `element.select` | `id: ZenithId` | Activates inspector focus for a specific Ghost-ID. |
| `zenith.engine.stage` | `tx: UUID, intent: Mutation` | Appends a design mutation to the WAL. |
| `vfs.commit` | `void` | Finalizes all staged transactions to the disk. |
| `vfs.undo` / `redo` | `void` | Steps through the visual transaction stack. |
| `auditor.check` | `styles: Map` | Returns a contrast/accessibility score report. |
| `zenith.sandbox.start` | `target: u16, listen: u16` | Orchestrates a development proxy latch. |

---

## 🛠️ Operational Maintenance

### The Ghost Index
If startup time exceeds 500ms, the Sidecar automatically shifts to **Incremental Indexing**.
*   **Location**: `.zenith/index.msgpack`
*   **Validation**: The index is verified against the filesystem checksum. If `mtime` mismatch is detected, a background "Cold Scan" is triggered.

### Conflict Resolution (OT Engine)
Zenith implements an **Intention-Preserving Operational Transform (OT)** engine. If two designers (or a designer and a developer) modify the same element:
1.  **Attribute Conflict**: Last-Write-Wins (LWW) based on NTP-coordinated timestamps.
2.  **Structural Conflict**: Transform operations are "re-based" against the new AST root to maintain hierarchical validity.
