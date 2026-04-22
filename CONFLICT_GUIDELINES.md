# Zenith Conflict Guidelines & Infrastructure

This document serves as a "Source of Truth" to prevent regression and merge conflicts when adding new features to the Zenith ecosystem.

## 1. IPC Contract (The Bridge)
Any change to communication between the **Extension (Webview)** and the **Sidecar (Rust)** must update both of the following files simultaneously:
- **Extension**: `webview-ui/src/bridge.ts` (Type: `ZenithIpcMessage`)
- **Sidecar**: `src/rpc.rs` (Trait: `ZenithApi`)

> [!IMPORTANT]
> **Signature Mismatch** is the #1 cause of "No Show" bugs. Always verify that the JSON-RPC method name in Rust matches the `type` in TypeScript.

## 2. State Ownership
To minimize data conflicts, respect the following ownership boundaries:
- **Webview**: Owns **Interaction State** (HOVER, SELECTION, VIEW_MODE).
- **Sidecar**: Owns **Project State** (VFS, AST Patcher, WAL).
- **Vite Plugin**: Owns **Instrumentation** (Surgical tags).

## 3. Conflict "Hot Spots"
The following files are high-traffic. When working here, branch early and merge quickly:
- `zenith-sidecar/src/vfs/mod.rs` (Core VFS logic)
- `zenith-extension/webview-ui/src/stores/useSelectionStore.ts` (Style patching logic)
- `zenith-sidecar/src/rpc.rs` (The IPC entry point)

## 4. Modularization Strategy
To avoid monoliths:
- **Refactor Goal**: Split `vfs/mod.rs` into `engine`, `history`, and `storage`.
- **Refactor Goal**: Split `useSelectionStore.ts` into specific behavior slices.

---
*Created: 2026-04-21 | Refer to this log when adding new IPC methods or shared state.*
