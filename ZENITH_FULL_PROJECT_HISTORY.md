# Zenith Project — Comprehensive Development & Architecture Summary

This document serves as the master historical record of the Zenith Developer OS evolution, covering the architecture shifts, structural changes, and features designed across all recent development sprints.

---

## 🚀 Phase 1: Zenith v2.2 "Developer Heaven"
The primary goal in this phase was to establish the **Logic-Sync system**, bridging the gap between visual editing and underlying application logic. 

**Key Implementations:**
- **MockOverlayEngine:** Introduced an overlay layer to inject development-time mocks visually over the application without modifying production source logic heavily.
- **StateScanner:** Built a system to recursively scan the React component tree to safely extract and manipulate component state at runtime.
- **HmrInjector:** Engineered hot-module replacement (HMR) injection specifically for the Zenith designer context, allowing real-time state injection back into the browser.
- Wired all new logic modules into `conflict/mod.rs` and `vfs/mod.rs`.

---

## 👻 Phase 2: Zenith v2.3 "Ghost-Proxy" Virtualization
This architectural leap sought to eliminate physical file system friction and achieve a `<1µs SAB Hot Path` while preserving React Fiber State.

**Key Architecture Shifts:**
- **In-Memory UDS Server / Named Pipes:** Migrated source transformations away from direct physical file writes into an ultra-fast local Named Pipes (UDS) server for proxying requests.
- **VirtualFileCache (`Ghost-Proxy`):** The Vite server now reads from the Ghost-Proxy instead of the disk. The proxy intercepts requests and injects `data-zenith-id` (Ghost IDs) on the fly, entirely in memory.
- **Headless Spatial Validation:** Implemented layout hashing to detect unintended CSS side-effects cascading through the DOM after a mutation.
- **HMR-Only Staging:** Transitioned "Staging" actions from writing temporary files to firing HMR signals directly. This preserves DOM state, scroll position, and React Fiber state perfectly.
- **Rebase Engine:** Instead of raw string patches, staged changes are stored as *Structured Operations* in the Rebase Engine, facilitating persistent rebasing of code over time.

---

## 🎨 Phase 3: Zenith v2.6 "Designer UI Overhaul & Stability" (Latest)
With the underlying architecture established, this phase focused exclusively on stabilizing critical bugs, refining the designer user experience, and providing extreme precision during source mutation.

**Critical Bug Fixes:**
- **VFS Commit Bug (JSX Corruption):** Discovered the sidecar was naively matching rows and replacing whole lines of code with just the `className` string, destroying JSX tags (like `<button>`). Rewrote `vfs/mod.rs` to execute precise substring replacements of *only* the attribute values via regex index matching.
- **Mouse Selection Consistency:** Stripped Vite plugin COOP/COEP headers that blocked iframe embedding. Normalized all message bridges to use a unified `zenithSelect` message type and ensured the iframe internal events never missed the setup tick by injecting scripts immediately on `onload`.
- **Pop-out Window:** Defeated the strict TS extension cache singleton allowing users to trigger a true pop-out side-by-side (`ViewColumn.Beside`) window.

**New Visual Features:**
- **Complete Inspector Overhaul (Style Controls):** Deprecated the basic panel. Built a robust inspector with HTML sliders and color pickers mapping directly to utility classes: Background Color, Text Color, Font Size, Border Radius, Padding, and Opacity.
- **Alt+Drag Canvas Positioning:** Injected a `setupCanvasDrag` script inside the target iframe. Holding `Alt` and clicking an element calculates vector deltas, instantly moving the element visually and staging `translate-x/y` utility classes upon release.
- **Output Log Panel:** Created a persistent, auto-scrolling log mapping all Stage, Commit, and Undo actions with timestamps and color-coded statuses to replace fleeting UI toasts.
- **Multi-Root Workspace Array:** Built the `zenith.code-workspace` stitch. Combines the Extension, Rust Sidecar, Vite Plugin, Demo Web App, and other peripheral plugins (`space-scroll-demo`, `website`) into a single Editor View, preserving F5 native extension debugging exactly as intended.


