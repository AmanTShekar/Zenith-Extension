# Contributing to Zenith

First off, thank you for considering contributing to Zenith! It's people like you that make Zenith a world-class design engine.

## Our Philosophy

Zenith is focused on **Atomic structural integrity** and **Antigravity performance**. Every contribution should:
1. Maintain zero-friction in the design workflow.
2. Ensure AST surgical precision (never leave messy code behind).
3. Respect the non-commercial nature of this community project.

## How Can I Contribute?

### Reporting Bugs
- Use the GitHub Issue Tracker to report bugs.
- Provide a clear description and steps to reproduce.

### Suggesting Enhancements
- We love new ideas for Antigravity features!
- Ensure your suggestions align with the IDE-native design philosophy.

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. Ensure your code follows the established Rust and TypeScript patterns.
3. Test your changes manually within the Zenith extension.
4. Open a PR with a detailed description of your changes.

## Development Setup

Zenith is a multi-language monorepo (Rust, TypeScript). To contribute, you will need to set up the following components:

### 1. Zenith Sidecar (Rust)
The engine that handles AST surgery, VFS management, and RPC.
- **Prerequisites**: [Rust](https://rustup.rs/) (Stable)
- **Setup**:
  ```bash
  cd zenith-sidecar
  cargo build
  cargo run -- --workspace "../zenith-demo" --port 8082
  ```

### 2. Zenith Extension (TypeScript)
The VS Code extension containing the visual canvas and logic bridge.
- **Prerequisites**: Node.js v18+, VS Code
- **Setup**:
  ```bash
  cd zenith-extension
  npm install
  npm run compile           # Build the extension
  npm run build:webview     # Build the React webview
  # Press F5 in VS Code to launch the Extension Development Host
  ```

### 3. Zenith Vite Plugin (TypeScript)
The build-time injector that enables structural mapping in Vite projects.
- **Prerequisites**: Node.js v18+
- **Setup**:
  ```bash
  cd zenith-vite-plugin
  npm install
  npm run build
  npm run surgical:doctor     # Verify engine health
  ```

### 4. Running the Demo
To test the full E2E flow, use the provided demo project:
```bash
cd zenith-demo
npm install
npm run dev
```

---

---

*Thank you for helping us build the future of design.*
