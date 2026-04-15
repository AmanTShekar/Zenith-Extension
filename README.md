# Zenith Visual Studio Hub

Welcome to **Zenith Visual Studio Hub**! Zenith is an incredibly powerful, visual development companion that lives right inside your VS Code Editor. Imagine bringing the best visual design tools like Photoshop or Figma straight into your codebase, allowing you to build and design your beautiful React apps visually—without ever leaving your code.

## What is Zenith?

Zenith lets you click on your application's UI, change text, adjust designs, and rearrange objects in a visual setup, all while it **automatically writes the perfect React code for you in your source files** in real-time.

You no longer have to blindly guess padding sizes or CSS classes. Just point, click, type, and watch the actual code write itself.

---

## Watch Zenith in Action

[![Zenith Demo Video](https://img.shields.io/badge/Watch%20Demo-Zenith%20Action-blueviolet?style=for-the-badge&logo=youtube)](https://github.com/AmanTShekar/Zenith-Extension)

_Check out how Zenith surgically modifies code and provides a real-time design experience._

---

## What are we doing?

We are bridging the gap between **Static Code** and **Dynamic Design**. Traditionally, developers write code and "guess" how it will look. Designers draw pictures and "hope" they can be turned into code. Zenith deletes that friction.

By injecting a "Live Bridge" into your development server, we turn your running app into a surgical artboard. When you move a button or change a font size in the Zenith Hub, we don't just "mock" it—we surgically reach into your source files and update the underlying code using advanced AST (Abstract Syntax Tree) transformations.

---

## Technical Architecture

Zenith is built on three main pillars designed for speed and reliability:

<<<<<<< HEAD
### 1. The Sidecar Engine (Rust)
=======
### 1. The Sidecar Engine (Rust 🦀)

>>>>>>> 3e158bc (docs: clean terminology and remove redundant text)
The brain of Zenith. It manages a **Virtual File System (VFS)** and a **Write-Ahead Log (WAL)**. It ensures that every visual change is atomic and safe. By using Rust, we keep latency under 1ms, ensuring your design experience feels "instant."

### 2. Surgical AST Patcher

Unlike other "site builders" that use messy string replacements, Zenith uses a **Surgical Mutation Engine**. It parses your TypeScript/JSX code into a tree structure (AST), finds the exact component you clicked on, and updates only the specific property you changed. This preserves your logic, comments, and project structure perfectly.

### 3. The Runtime Bridge

A lightweight injector that lives inside your Vite development server. It maps your browser's DOM elements back to their exact source code locations using unique "Zenith IDs," allowing for sub-pixel precision when selecting or designing.

---

### Core Features

- **Visual Canvas Editing**: Drag to resize, swap colors, and fine-tune your website visually.
- **Photoshop-Style Layers Tree**: View your entire app hierarchy, with instant hover-sync between the tree and the canvas.
- **Auto-Committing Engine**: Double-click text to edit, and watch it save directly to your source files.
- **Unified History Stack**: Use `Ctrl+Z` to undo both code changes and visual designs in one go.

---

## Contributing

We love builders! If you have ideas for new visual tools, performance improvements, or bug fixes, feel free to open a Pull Request.

Please see our [Contribution Guidelines](CONTRIBUTING.md) for more information on how to get started.

## 📜 License & Intellectual Property

Zenith is proprietary software distributed under the **[Zenith Core License (Apache 2.0 Hybrid)](LICENSE)**.

### 🏛️ Legal Foundation

Access to the Zenith source code is granted on a **Source-Available** basis strictly for non-commercial exploration. Our legal model is built on two distinct parts:

1.  **[PART 1: COMMERCIAL RESTRICTION RIDER](LICENSE)**: This section contains the primary governed conditions of the project. It **strictly prohibits** all Commercial Use, Profit-Making activity, and Sales of the Software or its core logic (Surgical AST Engine / VFS Bridge).
2.  **PART 2: MODIFIED APACHE 2.0**: The industry-standard Apache framework is utilized for non-commercial liability and patent protections, but all permissive grants are subordinate to the Rider in Part 1.

---

## 🎨 Creator & Commercial Licensing

Created by **[Aman T Shekar](https://github.com/AmanTShekar)**.

Join us in pushing the boundaries of how software is designed and built. Any use of Zenith within a for-profit environment or for revenue generation requires a separate, written **Commercial License Agreement**. Please contact the creator directly for licensing terms.


---

_Ready to build visually? Launch Zenith inside your workspace and start pointing, clicking, and building!_
