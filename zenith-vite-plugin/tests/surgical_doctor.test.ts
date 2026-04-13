import { describe, it, expect } from "vitest";
import { patchSourceFile, type PatchInstructions } from "../src/surgical.js";

/**
 * SURGICAL HEALTH AUDIT (v11.6 Hardened)
 * This test suite verifies the surgical engine's core integrity for property updates.
 * It is designated as the 'Surgical Doctor' diagnostic.
 */
describe("Zenith Surgical Engine — Health Audit", () => {

  it("Diagnostic A: Multi-Attribute Hardening & Literals", () => {
    const source = `<div style={{ opacity: "0.5" }} data-zenith-id="div.0" />`;
    const instructions: PatchInstructions = {
      zenithId: "src/App.tsx:div.0",
      styles: { opacity: "1", padding: "10" },
      className: "p-4"
    };
    const result = patchSourceFile(source, instructions);
    
    // Check numeric literal hardening
    expect(result).toContain('opacity: 1');
    expect(result).toContain('padding: 10');
    // Check attribute hardening
    expect(result).toContain('className="p-4"');
  });

  it("Diagnostic B: Recursive Fragment Traversal (Babel v11.6)", () => {
    const source = `<div><><header data-zenith-id="header.0"><span data-zenith-id="header.0:span.0">Hi</span></header></></div>`;
    const instructions: PatchInstructions = {
      zenithId: "src/App.tsx:div.0:header.0:span.0",
      styles: { color: "blue" }
    };
    const result = patchSourceFile(source, instructions);
    expect(result).toContain('color: "blue"');
  });

  it("Diagnostic C: Logic-Lock Integrity", () => {
    const source = `<div>{items.map(i => <div data-zenith-id="div.0">{i}</div>)}</div>`;
    const instructions: PatchInstructions = {
      zenithId: "src/App.tsx:div.0:div.0",
      styles: { margin: "20px" }
    };
    // Should throw LogicLockedError due to map traversal
    expect(() => patchSourceFile(source, instructions)).toThrow(/LogicLockedError|dynamic block/);
  });

});
