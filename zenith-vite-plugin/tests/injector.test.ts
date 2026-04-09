// ---------------------------------------------------------------------------
// Ghost-ID Injector — Unit Tests
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { injectGhostIds } from "../src/injector.js";

describe("injectGhostIds", () => {
  // ---- Basic injection ----

  it("injects data-zenith-id on a simple JSX element", () => {
    const source = `
export function App() {
  return <div className="app">Hello</div>;
}`;
    const result = injectGhostIds(source, "src/App.tsx");

    expect(result.code).toContain('data-zenith-id="src/App.tsx:3:');
    expect(result.entries.length).toBeGreaterThan(0);
    expect(result.entries[0].tagName).toBe("div");
    expect(result.entries[0].file).toBe("src/App.tsx");
  });

  // ---- Nested elements each get unique IDs ----

  it("injects unique IDs on nested elements", () => {
    const source = `
function Card() {
  return (
    <div>
      <h1>Title</h1>
      <p>Body</p>
    </div>
  );
}`;
    const result = injectGhostIds(source, "src/Card.tsx");

    // Should have 3 entries: div, h1, p
    expect(result.entries.length).toBe(3);
    const ids = result.entries.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3); // All unique
  });

  // ---- Fragments are skipped ----

  it("skips React fragments (<>...</>)", () => {
    const source = `
function List() {
  return (
    <>
      <li>One</li>
      <li>Two</li>
    </>
  );
}`;
    const result = injectGhostIds(source, "src/List.tsx");

    // Only the <li> elements, NOT the fragment
    expect(result.entries.length).toBe(2);
    expect(result.entries.every((e) => e.tagName === "li")).toBe(true);
    expect(result.code).not.toContain('<> data-zenith-id');
  });

  it("skips React.Fragment", () => {
    const source = `
import React from 'react';
function Wrapper() {
  return (
    <React.Fragment>
      <span>Child</span>
    </React.Fragment>
  );
}`;
    const result = injectGhostIds(source, "src/Wrapper.tsx");

    expect(result.entries.length).toBe(1);
    expect(result.entries[0].tagName).toBe("span");
  });

  // ---- Existing attributes preserved ----

  it("does not duplicate existing data-zenith-id", () => {
    const source = `
function PreTagged() {
  return <div data-zenith-id="manual:1:0">Already tagged</div>;
}`;
    const result = injectGhostIds(source, "src/PreTagged.tsx");

    // The existing attribute should be preserved, no new one added
    const matches = result.code.match(/data-zenith-id/g);
    expect(matches?.length).toBe(1);
    expect(result.entries.length).toBe(0); // No NEW entries
  });

  // ---- TypeScript generics don't break parsing ----

  it("handles TypeScript generics in JSX", () => {
    const source = `
interface Props<T> {
  items: T[];
}

function GenericList<T extends { id: string }>({ items }: Props<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{String(item)}</li>
      ))}
    </ul>
  );
}`;
    const result = injectGhostIds(source, "src/GenericList.tsx");

    expect(result.entries.length).toBe(2); // ul, li
    expect(result.code).toContain("data-zenith-id");
  });

  // ---- Template literal class names are preserved ----

  it("preserves template literal class names", () => {
    const source = `
function Dynamic({ isActive }: { isActive: boolean }) {
  return (
    <div className={\`flex \${isActive ? 'bg-blue-500' : 'bg-gray-500'} p-4\`}>
      Content
    </div>
  );
}`;
    const result = injectGhostIds(source, "src/Dynamic.tsx");

    expect(result.code).toContain("isActive ? 'bg-blue-500' : 'bg-gray-500'");
    expect(result.code).toContain("data-zenith-id");
    expect(result.entries.length).toBe(1);
  });

  // ---- Source map is generated ----

  it("generates a source map", () => {
    const source = `
function Simple() {
  return <div>Hello</div>;
}`;
    const result = injectGhostIds(source, "src/Simple.tsx");

    expect(result.map).not.toBeNull();
    expect(result.map).toHaveProperty("mappings");
  });

  // ---- Ghost ID format ----

  it("produces correct ghost ID format: file:line:col", () => {
    const source = `function X() { return <span>Hi</span>; }`;
    const result = injectGhostIds(source, "src/components/X.tsx");

    expect(result.entries.length).toBe(1);
    const entry = result.entries[0];
    expect(entry.id).toMatch(/^src\/components\/X\.tsx:\d+:\d+$/);
    expect(entry.line).toBeGreaterThan(0);
    expect(entry.column).toBeGreaterThanOrEqual(0);
  });

  // ---- Windows path normalization ----

  it("normalizes Windows paths to forward slashes", () => {
    const source = `function Y() { return <div />; }`;
    const result = injectGhostIds(
      source,
      "src\\components\\Y.tsx" // Windows path
    );

    expect(result.entries[0].file).toBe("src/components/Y.tsx");
    expect(result.entries[0].id).toContain("src/components/Y.tsx");
  });

  // ---- Custom components ----

  it("tags custom React components", () => {
    const source = `
import { Button } from './Button';
function Form() {
  return (
    <form>
      <Button variant="primary">Submit</Button>
    </form>
  );
}`;
    const result = injectGhostIds(source, "src/Form.tsx");

    expect(result.entries.length).toBe(2); // form + Button
    const tagNames = result.entries.map((e) => e.tagName);
    expect(tagNames).toContain("form");
    expect(tagNames).toContain("Button");
  });

  // ---- Self-closing elements ----

  it("handles self-closing JSX elements", () => {
    const source = `
function Image() {
  return <img src="/photo.jpg" alt="Photo" />;
}`;
    const result = injectGhostIds(source, "src/Image.tsx");

    expect(result.entries.length).toBe(1);
    expect(result.entries[0].tagName).toBe("img");
    expect(result.code).toContain("data-zenith-id");
  });

  // ---- Custom attribute name ----

  it("supports a custom attribute name", () => {
    const source = `function Z() { return <div>Z</div>; }`;
    const result = injectGhostIds(source, "src/Z.tsx", "data-z-id");

    expect(result.code).toContain("data-z-id");
    expect(result.code).not.toContain("data-zenith-id");
  });
});
