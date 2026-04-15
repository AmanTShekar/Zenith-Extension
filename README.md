# Zenith Visual Studio Hub

Welcome to **Zenith Visual Studio Hub**! Zenith is an incredibly powerful, visual development companion that lives right inside your VS Code Editor. Imagine bringing the best visual design tools like Photoshop or Figma straight into your codebase, allowing you to build and design your beautiful React apps visually—without ever leaving your code.

## What is Zenith?

Zenith lets you click on your application's UI, change text, adjust designs, and rearrange objects in a visual setup, all while it **automatically writes the perfect React code for you in your source files** in real-time. 

You no longer have to blindly guess padding sizes or CSS classes. Just point, click, type, and watch the actual code write itself.

---

## Watch Zenith in Action

[![Zenith Demo Video](https://img.shields.io/badge/Watch%20Demo-Zenith%20Action-blueviolet?style=for-the-badge&logo=youtube)](https://github.com/AmanTShekar/Zenith-Extension)

*Check out how Zenith surgically modifies code and provides a real-time design experience.*

---

## What are we doing?

We are bridging the gap between **Static Code** and **Dynamic Design**. Traditionally, developers write code and "guess" how it will look. Designers draw pictures and "hope" they can be turned into code. Zenith deletes that friction. 

By injecting a "Live Bridge" into your development server, we turn your running app into a surgical artboard. When you move a button or change a font size in the Zenith Hub, we don't just "mock" it—we surgically reach into your source files and update the underlying code using advanced AST (Abstract Syntax Tree) transformations.

---

## Technical Architecture

Zenith is built on three main pillars designed for speed and reliability:

### 1. The Sidecar Engine (Rust)
The brain of Zenith. It manages a **Virtual File System (VFS)** and a **Write-Ahead Log (WAL)**. It ensures that every visual change is atomic and safe. By using Rust, we keep latency under 1ms, ensuring your design experience feels "instant."

### 2. Surgical AST Patcher
Unlike other "site builders" that use messy string replacements, Zenith uses a **Surgical Mutation Engine**. It parses your TypeScript/JSX code into a tree structure (AST), finds the exact component you clicked on, and updates only the specific property you changed. This preserves your logic, comments, and project structure perfectly.

### 3. The Runtime Bridge
A lightweight injector that lives inside your Vite development server. It maps your browser's DOM elements back to their exact source code locations using unique "Zenith IDs," allowing for sub-pixel precision when selecting or designing.

---

### Core Features

* **Visual Canvas Editing**: Drag to resize, swap colors, and fine-tune your website visually.
* **Photoshop-Style Layers Tree**: View your entire app hierarchy, with instant hover-sync between the tree and the canvas.
* **Auto-Committing Engine**: Double-click text to edit, and watch it save directly to your source files.
* **Unified History Stack**: Use `Ctrl+Z` to undo both code changes and visual designs in one go.

---

## Contributing

We love builders! If you have ideas for new visual tools, performance improvements, or bug fixes, feel free to open a Pull Request. 

Please see our [Contribution Guidelines](CONTRIBUTING.md) for more information on how to get started.

## License

Zenith is licensed under the **[Zenith Public License (Apache 2.0 Hybrid)](LICENSE)**. 

*   **Non-Commercial**: Governed by the permissive Apache 2.0 license—free to explore, modify, and share for personal or educational use.
*   **Commercial & Profit**: Use for revenue-generating purposes or within a company requires express written consent from the creator. No profit-making is permitted without a separate commercial license.

## 🎨 Creator

Created with ❤️ by **[Aman T Shekar](https://github.com/AmanTShekar)**. 

Join us in pushing the boundaries of how software is designed and built. For commercial licensing inquiries, please contact the creator directly.

---
*Ready to build visually? Launch Zenith inside your workspace and start pointing, clicking, and building!*
