# Zenith Designer — The Global Design OS for VS Code

![Zenith Banner](https://raw.githubusercontent.com/AmanTShekar/Zenith-Extension/main/banner.png)

<p align="center">
  <b>Visualizing the code, surgically. Built for the Antigravity generation.</b>
</p>

<p align="center">
  <!-- START VIDEO DEMO SLOT -->
  <a href="https://github.com/AmanTShekar/Zenith-Extension">
    <img src="https://raw.githubusercontent.com/AmanTShekar/Zenith-Extension/main/demo-thumbnail.png" width="100%" alt="Zenith Engine in Action" />
  </a>
  <i>Zenith v11.7: Hardened Surgical Pipeline</i>
  <!-- END VIDEO DEMO SLOT -->
</p>

Zenith is a high-performance, agentic design engine that transforms any web project into a visual artboard directly inside VS Code. It enables surgical DOM manipulation with atomic precision, ensuring your source code remains clean, readable, and perfectly synchronized.

## 🚀 The Antigravity Advantage

Zenith isn't just a builder; it's a **Surgical Design OS**. Unlike traditional visual editors that bloat your code with wrappers or proprietary data attributes, Zenith uses an advanced Sidecar engine to perform AST-safe mutations on your raw TSX, JSX, and HTML files.

- **Atomic Structural Editing**: Move, Group, Reorder, and Insert elements with zero-friction. 
- **Surgical Mode**: AI-assisted styling and structural changes that respect your existing code patterns.
- **HMR-Native Synchronization**: Real-time previews powered by a high-speed Virtual File System (VFS) and Sidecar RPC.
- **Universal Framework Support**: Deeply integrated with Vite, Next.js, and modern web stacks.

## 🛠 Surgical Engine Specification: "Ghost-ID" v11.7

Zenith utilizes a custom **Spectral Mapping** strategy that sets it apart from industry standards like Onlook or Builder.io.

### Structural Path Mapping vs. Line Mapping
| Feature | Traditional Line-Mapping | Zenith Structural-Path (Ours) |
| :--- | :--- | :--- |
| **Strategy** | `file:line:col` | `file:tag.idx:tag.idx` |
| **Resilience** | Breaks if lines shift in VS Code | **Stable** regardless of line positions |
| **Build Overhead** | High (bloats bundle with metadata) | **Low** (structural indices only) |
| **Self-Healing** | Manual re-calibration required | **Automatic** via Fuzzy Fingerprinting |

### Antigravity Standards (v11.7 Resilience)
The Zenith Engine incorporates advanced safety protocols to prevent code corruption:
1. **Logic-Lock**: Detection of `.map()`, ternaries, and conditional rendering to prevent visual editing of business logic.
2. **Fuzzy Fingerprinting**: Deep-resolved structural IDs that can re-sync even if the developer manually adds code in the IDE.
3. **Literal Priority**: Surgical patches are appended to the end of props to ensure they override any `{...props}` spreads.

## 📦 Project Architecture

- **`zenith-sidecar`**: The heartbeat of Zenith. A Rust engine handling the VFS, AST surgery, and Proxy management.
- **`zenith-extension`**: The VS Code bridge, providing the Visual Canvas and IPC management.
- **`zenith-vite-plugin`**: Real-time bridge for Vite projects, enabling seamless HMR-safe design.

## 🤝 Contributing

We welcome contributions from the Antigravity community! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed setup instructions for the Rust and TypeScript environments.

## ⚖️ License

Zenith is a community-first project. 

**Strictly prohibited: Sales, commercial distribution, or for-profit usage without explicit written permission from the maintainers.**

See [LICENSE.md](./LICENSE.md) for the full terms.

---

*Focusing on Antigravity. Built for the future of IDE-native design.*
