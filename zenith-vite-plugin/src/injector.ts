// ---------------------------------------------------------------------------
// Ghost-ID Injector — Babel AST Transform
// ---------------------------------------------------------------------------
//
// Parses JSX/TSX source, traverses JSXOpeningElement nodes, and injects
// `data-zenith-id="{relativePath}:{line}:{col}"` attributes.
//
// Logic-Safety Rules:
//   - Fragments (<>...</>) are SKIPPED (no DOM representation)
//   - Elements with existing `data-zenith-id` are SKIPPED
//   - Files inside `node_modules` are NEVER processed
//   - Source maps are preserved end-to-end

import { parse, type ParserOptions } from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as t from "@babel/types";
import { createHash } from "node:crypto";
import type { GhostManifestEntry, InjectionResult } from "./types.js";

const transformCache = new Map<string, { hash: string, result: InjectionResult }>();

// Handle ESM/CJS interop for Babel packages
const traverse = (
  typeof _traverse === "function"
    ? _traverse
    : (_traverse as any).default
) as typeof _traverse;

const generate = (
  typeof _generate === "function"
    ? _generate
    : (_generate as any).default
) as typeof _generate;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_ATTRIBUTE = "data-zenith-id";

// Parser plugins for maximum compatibility
const PARSER_PLUGINS: ParserOptions["plugins"] = [
  "jsx",
  "typescript",
  "decorators-legacy",
  "classProperties",
  "classPrivateProperties",
  "classPrivateMethods",
  "optionalChaining",
  "nullishCoalescingOperator",
  "dynamicImport",
];

// ---------------------------------------------------------------------------
// Core injector
// ---------------------------------------------------------------------------

/**
 * Inject ghost IDs into all JSX elements in a source file.
 *
 * @param source     - The raw source code.
 * @param filePath   - Relative path from the project root (e.g., `src/App.tsx`).
 * @param attribute  - The attribute name to inject. Default: `data-zenith-id`.
 * @returns The transformed code, source map, and manifest entries.
 */
export function injectGhostIds(
  source: string,
  filePath: string,
  attribute: string = DEFAULT_ATTRIBUTE
): InjectionResult {
  // Normalize path separators (Windows → forward slashes)
  const normalizedPath = filePath.replace(/\\/g, "/");

  // Step 0: Check Cache for Idempotency
  const hash = createHash('sha256').update(source).digest('hex');
  const cached = transformCache.get(normalizedPath);
  if (cached && cached.hash === hash) {
    return cached.result;
  }

  // Step 1: Parse
  const ast = parse(source, {
    sourceType: "module",
    plugins: PARSER_PLUGINS,
    sourceFilename: normalizedPath,
    errorRecovery: true,
  });

  // Step 2: Traverse and inject
  const entries: GhostManifestEntry[] = [];

  (traverse as unknown as Function)(ast, {
    JSXOpeningElement(path: any) {
      const node = path.node;

      // --- Skip fragments ---
      if (t.isJSXFragment(path.parent) || isFragment(node.name)) {
        return;
      }

      // --- Skip if already tagged ---
      const hasAttribute = node.attributes.some(
        (attr: any) => t.isJSXAttribute(attr) && (attr.name as t.JSXIdentifier).name === attribute
      );
      if (hasAttribute) {
        return;
      }

      // --- Logic Zone Detection ---
      // Check if this element is inside a dynamic expression (map, ternary, etc.)
      // We look for any JSXExpressionContainer in the parent chain that is NOT a prop value.
      let isInsideLogic = false;
      let parent = path.parentPath;
      while (parent && !t.isProgram(parent.node)) {
        if (t.isJSXExpressionContainer(parent.node)) {
            // If it's a child of a JSXElement, it's a "Logic Zone" (e.g. {items.map(...)})
            if (t.isJSXElement(parent.parent) || t.isJSXFragment(parent.parent)) {
                isInsideLogic = true;
                break;
            }
        }
        parent = parent.parentPath;
      }

      const line = node.loc?.start.line ?? 0;
      const col = node.loc?.start.column ?? 0;
      const tagName = getTagName(node.name);
      
      // v9.6 Mechanical Perfection: Stable Tree-Path IDs
      // Format: filePath:tag.idx:parentTag.idx...
      const getChildIndex = (targetPath: any) => {
        const parentElementPath = targetPath.findParent((p: any) => t.isJSXElement(p.node) || t.isJSXFragment(p.node));
        if (!parentElementPath) return 0;
        
        const siblings = (parentElementPath.parent as any).children || [];
        return siblings.indexOf(parentElementPath.node);
      };

      // v9.7 Mechanical Perfection: stable IDs via tag-sibling index
      const getJSXElementIndex = (path: any): number => {
        const jsxElementPath = path.isJSXOpeningElement() ? path.parentPath : path;
        const siblings = (jsxElementPath.parentPath?.node as any)?.children || [];
        let jsxIdx = 0;
        for (const sib of siblings) {
          if (sib === jsxElementPath.node) return jsxIdx;
          if (t.isJSXElement(sib)) jsxIdx++;
        }
        return 0;
      };

      let pathId = `${getTagName(node.name)}.${getJSXElementIndex(path)}`;
      let p = path.parentPath; // JSXElement

      while (p && !t.isProgram(p.node)) {
          const parent = p.parentPath?.node;
          if (t.isJSXElement(parent) || t.isJSXFragment(parent)) {
              const parentOpening = (parent as any).openingElement;
              if (parentOpening) {
                  const tag = getTagName(parentOpening.name);
                  const idx = getJSXElementIndex(p.parentPath);
                  pathId = `${tag}.${idx}:${pathId}`;
              }
          }
          p = p.parentPath;
      }
      
      const ghostId = `${normalizedPath}:${pathId}`;


      // --- Inject attributes ---
      const ghostAttr = t.jsxAttribute(
        t.jsxIdentifier(attribute),
        t.stringLiteral(ghostId)
      );
      node.attributes.push(ghostAttr);

      if (isInsideLogic) {
        node.attributes.push(
            t.jsxAttribute(
                t.jsxIdentifier("data-zenith-logic-locked"),
                t.stringLiteral("true")
            )
        );
      }

      // --- Record manifest entry ---
      entries.push({
        id: ghostId,
        tagName,
        file: normalizedPath,
        line,
        column: col,
        isLogicLocked: isInsideLogic,
      });
    },
  });

  // Step 3: Generate output with source map
  const output = (generate as unknown as Function)(
    ast,
    {
      sourceMaps: true,
      sourceFileName: normalizedPath,
      retainLines: true,
      compact: false,
    },
    source
  );

  const finalResult = {
    code: output.code,
    map: output.map as unknown as InjectionResult["map"],
    entries,
  };

  transformCache.set(normalizedPath, { hash, result: finalResult });
  return finalResult;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if a JSX element name refers to a React Fragment.
 */
function isFragment(
  name: t.JSXOpeningElement["name"]
): boolean {
  // <React.Fragment>
  if (
    t.isJSXMemberExpression(name) &&
    t.isJSXIdentifier(name.object) &&
    name.object.name === "React" &&
    name.property.name === "Fragment"
  ) {
    return true;
  }

  // <Fragment> (imported)
  if (t.isJSXIdentifier(name) && name.name === "Fragment") {
    return true;
  }

  return false;
}

/**
 * Extract the tag name string from a JSX element name node.
 */
function getTagName(name: t.JSXOpeningElement["name"]): string {
  if (t.isJSXIdentifier(name)) {
    return name.name;
  }
  if (t.isJSXMemberExpression(name)) {
    return `${getTagName(name.object)}.${name.property.name}`;
  }
  if (t.isJSXNamespacedName(name)) {
    return `${name.namespace.name}:${name.name.name}`;
  }
  return "unknown";
}
