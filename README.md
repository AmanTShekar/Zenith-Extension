# Zenith-Extension
The first event-driven design engine that talks directly to your code. Move sliders, not pixels. No lag, no data loss, and zero "design-to-code" friction. Built with a high-performance Rust kernel to perform real-time code surgery without ever breaking your application’s state.

# 💎 Zenith v2.6 — Surgical Design OS

> **"The Event-Driven Engine for Real-Time React Surgery"**
> [🌐 Website](https://zenith.design) | [📚 Documentation](https://docs.zenith.design) | [💬 Community Discord](https://discord.gg/zenith-engine)

---

## ⚠️ Project Status: Under Active Development
**Zenith v2.6** is currently in a **production-hardening phase**. While the core engine (v2.3) is stable, the v2.6 upgrade introduces high-reasoning features like **Adaptive-Probing** and **Intent-Aware Structural Merging**. We are stress-testing the engine on enterprise-scale projects to ensure sub-millisecond reliability.

---

## 🎯 Philosophy & Core Goals
Zenith treats the React source code as a living, surgical canvas. We believe visual manipulation should be as fast as a designer’s thought and as precise as a developer’s compiler.

* **Zero-Latency Interaction**: A sub-millisecond (**<1µs**) hot-path for instant visual property updates.
* **Absolute Data Integrity**: 100% persistence via **Write-Ahead Logging (WAL)**—never lose a tweak.
* **State-Aware Precision**: Patching code without disrupting React hooks or scroll positions.
* **Elastic Performance**: Dynamically scaling engine frequency based on user hardware.

---

## 🏗️ Technical Architecture (The Five Layers)

### A. The Rust Kernel (Sidecar)
* **WAL-Backed VFS**: Implements a Write-Ahead Log with Copy-on-Write (COW) overlays using `im::HashMap`.
* **Atomic IPC Bind**: Utilizes an **Atomic Rename** socket strategy to eliminate race conditions.
* **12-Rule OT Matrix**: An intent-aware transform engine that resolves complex structural merges.

### B. Runtime Reality Probing
* **Fiber-Probe Guard**: "Interviews" the live **React Fiber Tree** via `__REACT_DEVTOOLS_GLOBAL_HOOK__` to detect safety flags.
* **Sentinel Prober**: A self-healing discovery script that identifies React internal bitmasks on startup.

### C. Visual Auditing & Spatial Intel
* **Houdini Auditor**: Leverages **CSS Houdini** `@property` shadowing for zero-poll regression detection.
* **Swap-Table Engine**: Decouples R*-tree maintenance from the 60fps scroll path, keeping query costs at **~2µs per frame**.

---

## 📊 Performance Benchmarks (v2.6)

| Metric | Zenith v2.3 (Prototype) | Zenith v2.6 (Production) | Impact |
| :--- | :--- | :--- | :--- |
| **Startup Latency** | 750ms | **15ms** | 50x Faster (Cache) |
| **Hot-Path Latency** | ~5ms | **<1µs** | Real-time (SAB) |
| **HMR Reliability** | 85% (AST-based) | **99.9%** | Fiber-Aware Safety |
| **Style Detection** | 8ms/frame (Polling) | **0ms** | Event-Driven |

---

## 🧪 Verification & Reliability
Zenith is built with a **"Zero-Panic"** philosophy. The Rust kernel is verified against a suite of **113+ tests**.

```bash
# Verify kernel integrity
cd zenith-sidecar && cargo test
