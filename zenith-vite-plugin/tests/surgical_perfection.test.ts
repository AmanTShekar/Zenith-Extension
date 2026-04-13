import { describe, it, expect } from "vitest";
import { patchSourceFile, type PatchInstructions } from "../src/surgical.js";

describe("Zenith Surgical Engine — Perfection Audit (v11.7.1)", () => {

  it("Perfection Case 1: HOC Tunneling (memo + forwardRef)", () => {
    // Current engine might fail to find the div if it's not looking deep enough for the root
    const source = `
      const MyComp = memo(forwardRef((props, ref) => (
        <div data-zenith-id="div.0" ref={ref}>Hello</div>
      )));
    `;
    const instructions: PatchInstructions = {
      zenithId: "src/MyComp.tsx:div.0",
      styles: { background: "red" }
    };
    const result = patchSourceFile(source, instructions);
    expect(result).toContain('background: "red"');
  });

  it("Perfection Case 2: IIFE Logic-Lock", () => {
    const source = `
      <div>
        {(() => {
          return <span data-zenith-id="span.0">Dynamic</span>
        })()}
      </div>
    `;
    const instructions: PatchInstructions = {
      zenithId: "src/App.tsx:div.0:span.0",
      styles: { color: "green" }
    };
    // Should be locked because it's inside an IIFE (dynamic block)
    expect(() => patchSourceFile(source, instructions)).toThrow(/LogicLockedError|dynamic block/);
  });

  it("Perfection Case 3: Enriched Fingerprint Fallback", () => {
    // Simulate structural drift (original ID div.0 now at div.1 due to new code)
    const source = `
      <div>
        <p>New element pushing things down</p>
        <div data-zenith-fingerprint="div|p-4 my-2|span" data-zenith-id="div.0">Target</div>
      </div>
    `;
    const instructions: PatchInstructions = {
      zenithId: "src/App.tsx:div.0:div.0", // Original path
      fingerprint: "div|p-4 my-2|span",     // Enriched fingerprint
      styles: { margin: "50px" }
    };
    
    // In v11.7.1 this should succeed via fuzzy matching
    const result = patchSourceFile(source, instructions);
    expect(result).toContain('margin: "50px"');
  });

});
