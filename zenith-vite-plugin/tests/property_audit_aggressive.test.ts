import { describe, it, expect } from "vitest";
import { patchSourceFile, type PatchInstructions } from "../src/surgical.js";

describe("Surgical Engine — Aggressive Property Audit", () => {

  describe("Dynamic Block Variations", () => {
    it("Logic-Lock: Blocks edits inside Ternary Consequent", () => {
      const source = `function App({ show }) { return <div>{show ? <span data-zenith-id="div.0:span.0">True</span> : null}</div>; }`;
      const instructions: PatchInstructions = {
        zenithId: "src/App.tsx:div.0:span.0",
        styles: { color: "red" }
      };
      expect(() => patchSourceFile(source, instructions)).toThrow(/LogicLockedError|dynamic block/);
    });

    it("Logic-Lock: Blocks edits inside Ternary Alternate", () => {
      const source = `function App({ show }) { return <div>{show ? null : <span data-zenith-id="div.0:span.0">False</span>}</div>; }`;
      const instructions: PatchInstructions = {
        zenithId: "src/App.tsx:div.0:span.0",
        styles: { color: "red" }
      };
      expect(() => patchSourceFile(source, instructions)).toThrow(/LogicLockedError|dynamic block/);
    });

    it("Logic-Lock: Blocks edits inside Logical AND (&&)", () => {
      const source = `function App({ show }) { return <div>{show && <span data-zenith-id="div.0:span.0">Shown</span>}</div>; }`;
      const instructions: PatchInstructions = {
        zenithId: "src/App.tsx:div.0:span.0",
        styles: { color: "red" }
      };
      expect(() => patchSourceFile(source, instructions)).toThrow(/LogicLockedError|dynamic block/);
    });
  });

  describe("Attribute Expressions (Site D)", () => {
    it("Safe-Edit: Hardens dynamic className to string literal if requested", () => {
      // NOTE: Our current surgical engine prioritizes DESIGN COMMITS. 
      // If a user commits a style change to an element with a dynamic class, 
      // we might want to preserve the dynamic part or overwrite it. 
      // Currently, we overwrite it. Let's verify this behavior.
      const source = `function App({ active }) { return <div className={active ? "p-4" : "p-2"} data-zenith-id="div.0" />; }`;
      const instructions: PatchInstructions = {
        zenithId: "src/App.tsx:div.0",
        className: "p-8"
      };
      const result = patchSourceFile(source, instructions);
      expect(result).toContain('className="p-8"');
      expect(result).not.toContain('active ?');
    });

    it("Style Shorthand: Hardens shorthand property to literal", () => {
      const source = `function App({ op }) { return <div style={{ opacity: op }} data-zenith-id="div.0" />; }`;
      const instructions: PatchInstructions = {
        zenithId: "src/App.tsx:div.0",
        styles: { opacity: "1" }
      };
      const result = patchSourceFile(source, instructions);
      expect(result).toContain('opacity: 1');
      expect(result).not.toContain('opacity: op');
    });
  });

  describe("Deep Nesting & Fragments (Site E)", () => {
    it("Resolves through nested fragments", () => {
      const source = `
        function App() {
          return (
            <div data-zenith-id="div.0">
              <>
                <header data-zenith-id="div.0:header.0">
                  <h1 data-zenith-id="div.0:header.0:h1.0">Title</h1>
                </header>
              </>
            </div>
          );
        }
      `;
      // zenithId: "src/App.tsx:div.0:header.0:h1.0"
      // Wait, let's check how matchPath handles fragments.
      const instructions: PatchInstructions = {
        zenithId: "src/App.tsx:div.0:header.0:h1.0",
        styles: { color: "blue" }
      };
      const result = patchSourceFile(source, instructions);
      expect(result).toContain('color: "blue"');
    });
  });

  describe("Structural Collision & ID Drift", () => {
    it("Throws on tag mismatch (expectedTag)", () => {
      const source = `function App() { return <div data-zenith-id="div.0" />; }`;
      const instructions: PatchInstructions = {
        zenithId: "src/App.tsx:div.0",
        expectedTag: "span",
        styles: { margin: "10px" }
      };
      expect(() => patchSourceFile(source, instructions)).toThrow(/Surgical collision/);
    });
  });

});
