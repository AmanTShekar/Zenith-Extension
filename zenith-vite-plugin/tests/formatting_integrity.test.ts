import { describe, it, expect } from "vitest";
import { patchSourceFile, type PatchInstructions } from "../src/surgical.js";

describe("Zenith Surgical Engine — Formatting Integrity (v11.7.1)", () => {

  it("Formatting Case: Byte-for-byte persistence with complex spacing", () => {
    const source = `
import React from 'react';

// This comment should stay untouched
export const App = () => {
  return (
    <div 
        className="original-class" 
        style={{ color: 'red' }} // Inline comment
        data-zenith-id="div.0"
    >
      {/* Structural comment */}
      <span>Hello</span>
    </div>
  );
};
`.trim();

    const instructions: PatchInstructions = {
      zenithId: "src/App.tsx:div.0",
      styles: { color: "blue", margin: "10" }
    };

    const result = patchSourceFile(source, instructions);

    // Verify the modified line changed correctly
    expect(result).toContain('color: "blue"');
    expect(result).toContain('margin: 10');

    // CRITICAL: Verify the original comments and spacing are untouched
    expect(result).toContain("// This comment should stay untouched");
    expect(result).toContain("{/* Structural comment */}");
    expect(result).toContain("export const App = () => {");
    
    // Verify specific indentation didn't shift (Recast magic)
    expect(result).toContain('        data-zenith-id="div.0"');
  });

});
