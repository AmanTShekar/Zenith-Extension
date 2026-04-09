# Zenith Designer — The Global Design OS for VS Code

![Zenith Banner](https://raw.githubusercontent.com/AmanTShekar/Zenith-Extension/main/banner.png)

Zenith is a high-performance, agentic design engine that transforms any web project into a visual artboard directly inside VS Code. Built for the next generation of "Antigravity" developers, Zenith enables surgical DOM manipulation with atomic precision, ensuring your source code remains clean, readable, and perfectly synchronized.

## 🚀 The Antigravity Advantage

Zenith isn't just a builder; it's a **Surgical Design OS**. Unlike traditional visual editors that bloat your code with wrappers or proprietary data attributes, Zenith uses an advanced Sidecar engine to perform AST-safe mutations on your raw TSX, JSX, and HTML files.

- **Atomic Structural Editing**: Move, Group, Reorder, and Insert elements with zero-friction. 
- **Surgical Mode**: AI-assisted styling and structural changes that respect your existing code patterns.
- **HMR-Native Synchronization**: Real-time previews powered by a high-speed Virtual File System (VFS) and Sidecar RPC.
- **Universal Framework Support**: Deeply integrated with Vite, Next.js, and any framework supporting standard HMR.

## 🛠 Project Architecture

Zenith is structured as a high-performance monorepo:

- **`zenith-sidecar`**: The heartbeat of Zenith. A Rust-based engine handling the VFS, AST surgery, and Proxy management.
- **`zenith-extension`**: The VS Code bridge, providing the Visual Canvas and IPC management.
- **`zenith-vite-plugin`**: Real-time bridge for Vite projects, enabling seamless HMR-safe design.
- **`zenith-next-plugin`**: Optimized support for Next.js and the modern web stack.

## 📖 Getting Started

1. **Install the Extension**: Search for "Zenith" in the VS Code Marketplace.
2. **Open your Project**: Zenith automatically detects your dev server and framework.
3. **Launch Canvas**: Click the **Zenith: Open Visual Canvas** icon in the editor toolbar.
4. **Design Surgically**: Begin manipulating your UI visually; Zenith preserves your code structure perfectly.

## ⚖️ License

Zenith is an open-source project provided for non-profit, educational, and community use.

**Commercial use of this software is strictly prohibited without explicit written permission from the maintainers.**

See [LICENSE.md](./LICENSE.md) for the full terms.

---

*Focusing on Antigravity. Built for the future of IDE-native design.*
