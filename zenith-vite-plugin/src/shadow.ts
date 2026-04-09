// ---------------------------------------------------------------------------
// Shadow Directory Manager
// ---------------------------------------------------------------------------
//
// Writes ghost-ID-injected source files to `.zenith/` alongside a manifest.
// The shadow directory mirrors the source tree structure:
//
//   .zenith/
//     src/
//       App.tsx          ← transformed source
//       components/
//         Button.tsx     ← transformed source
//     manifest.json      ← ghost-id → source location mapping

import fs from "node:fs";
import path from "node:path";
import type { GhostManifestEntry } from "./types.js";

const SHADOW_DIR = ".zenith";
const MANIFEST_FILE = "manifest.json";

/**
 * Manages the `.zenith/` shadow directory.
 */
export class ShadowDirectory {
  private readonly root: string;
  private readonly shadowRoot: string;
  private manifest: Map<string, GhostManifestEntry> = new Map();

  constructor(projectRoot: string) {
    this.root = projectRoot;
    this.shadowRoot = path.join(projectRoot, SHADOW_DIR);
  }

  /**
   * Write a transformed file to the shadow directory.
   */
  write(
    relativePath: string,
    code: string,
    entries: GhostManifestEntry[]
  ): void {
    const targetPath = path.join(this.shadowRoot, relativePath);
    const targetDir = path.dirname(targetPath);

    // Ensure directory exists
    fs.mkdirSync(targetDir, { recursive: true });

    // Write transformed source
    fs.writeFileSync(targetPath, code, "utf-8");

    // Update manifest
    for (const entry of entries) {
      this.manifest.set(entry.id, entry);
    }

    this.writeManifest();
  }

  /**
   * Clean the entire shadow directory (called on buildStart).
   */
  async clean(): Promise<void> {
    if (fs.existsSync(this.shadowRoot)) {
      await fs.promises.rm(this.shadowRoot, { recursive: true, force: true });
    }
    this.manifest.clear();
  }

  /**
   * Get the shadow root path.
   */
  getRoot(): string {
    return this.shadowRoot;
  }

  /**
   * Read the manifest (returns a copy).
   */
  getManifest(): GhostManifestEntry[] {
    return Array.from(this.manifest.values());
  }

  /**
   * Look up a ghost ID in the manifest.
   */
  lookup(ghostId: string): GhostManifestEntry | undefined {
    return this.manifest.get(ghostId);
  }

  // -------------------------------------------------------------------------
  // Internal
  // -------------------------------------------------------------------------

  private writeManifest(): void {
    const manifestPath = path.join(this.shadowRoot, MANIFEST_FILE);
    const data = Object.fromEntries(this.manifest);
    fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2), "utf-8");
  }
}
