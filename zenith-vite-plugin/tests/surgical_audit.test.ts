import { describe, it, expect } from "vitest";
import { patchSourceFile, type PatchInstructions } from "../src/surgical.js";

describe("Surgical Engine — Property Reference Audit", () => {

  // ── SITE A: INLINE STYLES ──────────────────────────────────────────────────

  describe("Site A: Inline Styles", () => {
    it("patches a simple string value in style={{}}", () => {
      const source = `function App() { return <div style={{ opacity: "0.5" }} data-zenith-id="src/App.tsx:div.0" />; }`;
      const instructions: PatchInstructions = {
        zenithId: "src/App.tsx:div.0",
        styles: { opacity: "1" }
      };
      const result = patchSourceFile(source, instructions);
      // v11.5: Verify numeric literal conversion
      expect(result).toContain('opacity: 1');
    });

    it("patches a numeric value in style={{}} (Hardening Case)", () => {
      const source = `function App() { return <div style={{ width: 100 }} data-zenith-id="src/App.tsx:div.0" />; }`;
      const instructions: PatchInstructions = {
        zenithId: "src/App.tsx:div.0",
        styles: { width: "150" }
      };
      const result = patchSourceFile(source, instructions);
      // NOTE: Numeric literal hardening
      expect(result).toContain('width: 150');
    });

    it("inserts a missing style attribute if it doesn't exist", () => {
      const source = `function App() { return <div data-zenith-id="src/App.tsx:div.0" />; }`;
      const instructions: PatchInstructions = {
        zenithId: "src/App.tsx:div.0",
        styles: { padding: "10px" }
      };
      const result = patchSourceFile(source, instructions);
      expect(result).toContain('style={{');
      expect(result).toContain('padding: "10px"');
    });
  });

  // ── SITE B: TAILWIND ───────────────────────────────────────────────────────

  describe("Site B: Tailwind", () => {
    it("patches a simple className string", () => {
      const source = `function App() { return <button className="p-4 bg-blue-500" data-zenith-id="src/App.tsx:button.0">Click</button>; }`;
      const instructions: PatchInstructions = {
        zenithId: "src/App.tsx:button.0",
        className: "p-6 bg-red-500"
      };
      const result = patchSourceFile(source, instructions);
      expect(result).toContain('className="p-6 bg-red-500"');
    });

    it("handles arbitrary values in className (Tailwind v3)", () => {
       const source = `function App() { return <div className="w-[10px]" data-zenith-id="src/App.tsx:div.0" />; }`;
       const instructions: PatchInstructions = {
         zenithId: "src/App.tsx:div.0",
         className: "w-[20px]"
       };
       const result = patchSourceFile(source, instructions);
       expect(result).toContain('className="w-[20px]"');
    });
  });

  // ── SITE C: EDGE CASES & SHORTHANDS ────────────────────────────────────────

  describe("Site C: Edge Cases & Shorthands", () => {
    it("patches a deeply nested element by ID path", () => {
      const source = `
        function Layout() {
          return (
            <div data-zenith-id="src/Layout.tsx:div.0">
              <header>
                <nav>
                  <ul>
                    <li>Home</li>
                  </ul>
                </nav>
              </header>
            </div>
          );
        }
      `;
      const instructions: PatchInstructions = {
        zenithId: "src/Layout.tsx:div.0:header.0:nav.0:ul.0",
        styles: { gap: "20px" }
      };
      const result = patchSourceFile(source, instructions);
      expect(result).toContain('gap: "20px"');
    });

    it("blocks patching inside logic/dynamic blocks (Logic-Lock)", () => {
      const source = `
        function List({ items }) {
          return (
            <div>
              {items.map(i => (
                <span key={i}>{i}</span>
              ))}
            </div>
          );
        }
      `;
      const instructions: PatchInstructions = {
        zenithId: "src/List.tsx:div.0:span.0",
        styles: { color: "red" }
      };
      
      // v11.5: Should throw LogicLockedError due to deep resolution finding the element within .map()
      expect(() => patchSourceFile(source, instructions)).toThrow(/LogicLockedError|dynamic block/);
    });

    it("patches text content correctly", () => {
      const source = `function App() { return <h1 data-zenith-id="src/App.tsx:h1.0">Old Title</h1>; }`;
      const instructions: PatchInstructions = {
        zenithId: "src/App.tsx:h1.0",
        textContent: "New Title"
      };
      const result = patchSourceFile(source, instructions);
      expect(result).toContain('New Title');
      expect(result).not.toContain('Old Title');
    });
  });

});
