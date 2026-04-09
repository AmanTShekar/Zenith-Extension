import { parse, type ParserOptions } from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as t from "@babel/types";

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
// Instruction Types
// ---------------------------------------------------------------------------

/** Insert position for new elements */
export interface InsertPosition {
  type: "append" | "prepend" | "index";
  index?: number; // used when type === "index"
}

/** Describes an element to insert into the tree */
export interface InsertDescriptor {
  tagName: string;
  textContent?: string;
  attributes?: Record<string, string>;
  position: InsertPosition;
}

export interface PatchInstructions {
  zenithId: string;

  // --- Style / attribute edits ---
  styles?: Record<string, string>;
  className?: string;
  textContent?: string;

  // --- DOM Structure operations ---

  /** Delete this element from the source tree */
  delete?: boolean;

  /** Insert a new child element relative to this element */
  insert?: InsertDescriptor;

  /** Move this element to a new index within its parent */
  move?: {
    /** New sibling index within the parent */
    index: number;
  };

  /** Wrap this element in a new container tag */
  group?: {
    containerTag: string; // e.g. "div"
    containerAttributes?: Record<string, string>;
  };

  /** Unwrap this element (remove container, hoist children) */
  ungroup?: boolean;

  /** Duplicate this element as next sibling */
  duplicate?: boolean;

  /** Optional tag verification to prevent ID drift */
  expectedTag?: string;
}

export class LogicLockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LogicLockedError";
  }
}

// ---------------------------------------------------------------------------
// Logic-Lock: detect dynamic block ancestry
// ---------------------------------------------------------------------------

/**
 * Returns true only if path is a JSX child of a .map(), ternary,
 * or logical expression (&&, ||). Does NOT fire on attribute values like
 * className={clsx(...)} — those are safe to edit.
 */
function isInDynamicBlock(openingElementPath: any): boolean {
  let path = openingElementPath.parentPath; // JSXElement

  while (path && !t.isProgram(path.node)) {
    const parentNode = path.parent;

    // This JSXElement is a direct child of a JSXExpressionContainer
    // whose parent is another JSXElement/Fragment (= a JSX child expression)
    if (
      t.isJSXExpressionContainer(parentNode) &&
      (t.isJSXElement(path.parentPath?.parent) ||
        t.isJSXFragment(path.parentPath?.parent))
    ) {
      const expr = parentNode.expression;
      if (
        t.isCallExpression(expr) ||
        t.isConditionalExpression(expr) ||
        t.isLogicalExpression(expr) ||
        t.isArrowFunctionExpression(expr) ||
        t.isFunctionExpression(expr)
      ) {
        return true;
      }
    }

    // Inside an arrow function that is a .map() callback
    if (
      t.isArrowFunctionExpression(path.node) &&
      t.isCallExpression(parentNode) &&
      t.isMemberExpression((parentNode as t.CallExpression).callee) &&
      t.isIdentifier(
        ((parentNode as t.CallExpression).callee as t.MemberExpression).property,
        { name: "map" }
      )
    ) {
      return true;
    }

    path = path.parentPath;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Core patchSourceFile
// ---------------------------------------------------------------------------

/**
 * Surgically patch a source file using AST transformations.
 * v5.0 — Full DOM operation support: style, text, delete, insert, move, group, duplicate, ungroup.
 */
export function patchSourceFile(source: string, instructions: PatchInstructions): string {
  const ast = parse(source, {
    sourceType: "module",
    plugins: PARSER_PLUGINS,
    errorRecovery: true,
  });

  let patched = false;

  (traverse as unknown as Function)(ast, {
    JSXOpeningElement(path: any) {
      const node: t.JSXOpeningElement = path.node;

      // Find the target element
      const idAttr = node.attributes.find(
        (attr: any) =>
          t.isJSXAttribute(attr) &&
          t.isJSXIdentifier(attr.name) &&
          attr.name.name === "data-zenith-id" &&
          t.isStringLiteral(attr.value) &&
          attr.value.value === instructions.zenithId
      );
      if (!idAttr) return;

      // v9.0 Pre-flight Tag Verification
      if (instructions.expectedTag && t.isJSXIdentifier(node.name) && node.name.name !== instructions.expectedTag) {
        throw new Error(`Surgical collision: Expected <${instructions.expectedTag}> but found <${node.name.name}> at "${instructions.zenithId}". Source may have drifted.`);
      }

      // Logic-Lock — only for operations that touch the element in-place
      const isStructuralOp = instructions.delete || instructions.move || instructions.group || instructions.ungroup;
      if (!isStructuralOp && isInDynamicBlock(path)) {
        throw new LogicLockedError(
          `Cannot patch "${instructions.zenithId}": inside a dynamic block (.map/ternary). Edit source directly.`
        );
      }

      const jsxElementPath = path.parentPath; // the JSXElement node
      const jsxElement: t.JSXElement = jsxElementPath.node;

      // ── 1. DELETE ──────────────────────────────────────────────────────────
      if (instructions.delete) {
        jsxElementPath.remove();
        patched = true;
        path.stop();
        return;
      }

      // ── 2. STYLE PATCH ─────────────────────────────────────────────────────
      if (instructions.styles) {
        updateStyleAttribute(node, instructions.styles);
      }

      // ── 3. CLASSNAME PATCH ──────────────────────────────────────────────────
      if (instructions.className !== undefined) {
        updateAttribute(node, "className", instructions.className);
      }

      // ── 4. TEXT CONTENT UPDATE ─────────────────────────────────────────────
      if (instructions.textContent !== undefined) {
        updateTextContent(jsxElement, instructions.textContent);
      }

      // ── 5. INSERT CHILD ─────────────────────────────────────────────────────
      if (instructions.insert) {
        const newEl = createJSXElement(instructions.insert);
        const pos = instructions.insert.position;

        if (pos.type === "prepend") {
          jsxElement.children.unshift(newEl);
        } else if (pos.type === "index" && pos.index !== undefined) {
          const jsxChildren = jsxElement.children.filter(
            (c) => t.isJSXElement(c) || t.isJSXFragment(c)
          );
          const targetIdx = Math.min(pos.index, jsxChildren.length);
          const target = jsxChildren[targetIdx];
          if (target) {
            const realIdx = jsxElement.children.indexOf(target);
            jsxElement.children.splice(realIdx, 0, newEl);
          } else {
            jsxElement.children.push(newEl);
          }
        } else {
          // append (default)
          jsxElement.children.push(newEl);
        }
      }

      // ── 6. MOVE (reorder within parent) ────────────────────────────────────
      if (instructions.move !== undefined) {
        const parentJSX = jsxElementPath.parentPath?.node;
        if (t.isJSXElement(parentJSX)) {
          const siblings = parentJSX.children;
          const jsxSibs = siblings.filter(
            (c: any) => t.isJSXElement(c) || t.isJSXFragment(c)
          );
          const currIdx = siblings.indexOf(jsxElement);
          if (currIdx !== -1) {
            siblings.splice(currIdx, 1);
            const newJsxIdx = Math.min(instructions.move.index, jsxSibs.length - 1);
            const targetEl = jsxSibs[newJsxIdx];
            const targetRealIdx = targetEl ? siblings.indexOf(targetEl) : siblings.length;
            siblings.splice(targetRealIdx, 0, jsxElement);
          }
        }
      }

      // ── 7. GROUP (wrap in container) ────────────────────────────────────────
      if (instructions.group) {
        const parentJSX = jsxElementPath.parentPath?.node;
        if (t.isJSXElement(parentJSX)) {
          const siblings = parentJSX.children;
          const currIdx = siblings.indexOf(jsxElement);
          if (currIdx !== -1) {
            const attrs = Object.entries(instructions.group.containerAttributes ?? {}).map(
              ([k, v]) => t.jsxAttribute(t.jsxIdentifier(k), t.stringLiteral(v))
            );
            const wrapper = t.jsxElement(
              t.jsxOpeningElement(
                t.jsxIdentifier(instructions.group.containerTag),
                attrs,
                false
              ),
              t.jsxClosingElement(t.jsxIdentifier(instructions.group.containerTag)),
              [jsxElement],
              false
            );
            siblings.splice(currIdx, 1, wrapper);
          }
        }
      }

      // ── 8. UNGROUP (hoist children from this element) ─────────────────────
      if (instructions.ungroup) {
        const parentJSX = jsxElementPath.parentPath?.node;
        if (t.isJSXElement(parentJSX)) {
          const siblings = parentJSX.children;
          const currIdx = siblings.indexOf(jsxElement);
          if (currIdx !== -1) {
            const innerChildren = jsxElement.children.filter(
              (c) => t.isJSXElement(c) || t.isJSXFragment(c)
            );
            siblings.splice(currIdx, 1, ...innerChildren);
          }
        }
      }

      // ── 9. DUPLICATE (insert copy as next sibling) ────────────────────────
      if (instructions.duplicate) {
        const parentJSX = jsxElementPath.parentPath?.node;
        if (t.isJSXElement(parentJSX)) {
          const siblings = parentJSX.children;
          const currIdx = siblings.indexOf(jsxElement);
          if (currIdx !== -1) {
            // Deep clone by regenerate + re-parse (safest approach)
            const cloned = cloneJSXElement(jsxElement);
            // Strip the data-zenith-id from the clone (it will get a new one on next scan)
            stripZenithId(cloned);
            siblings.splice(currIdx + 1, 0, cloned, t.jsxText("\n"));
          }
        }
      }

      patched = true;
      path.stop();
    },
  });

  if (!patched) {
    throw new Error(
      `Element "${instructions.zenithId}" not found in source. ` +
      `File may have changed since last scan. Try re-selecting.`
    );
  }

  const output = (generate as unknown as Function)(
    ast,
    {
      retainLines: true,
      compact: false,
      comments: true,
      concise: false,
      minified: false,
      retainFunctionParens: true,
      shouldPrintComment: () => true,
    },
    source
  );

  return output.code;
}

// ---------------------------------------------------------------------------
// Helper: Update a simple string JSX attribute
// ---------------------------------------------------------------------------
function updateAttribute(node: t.JSXOpeningElement, name: string, value: string) {
  const idx = node.attributes.findIndex(
    (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === name
  );
  const attr = t.jsxAttribute(t.jsxIdentifier(name), t.stringLiteral(value));
  if (idx !== -1) node.attributes[idx] = attr;
  else node.attributes.push(attr);
}

// ---------------------------------------------------------------------------
// Helper: Merge new styles into existing style attribute
// ---------------------------------------------------------------------------
function updateStyleAttribute(node: t.JSXOpeningElement, newStyles: Record<string, string>) {
  const idx = node.attributes.findIndex(
    (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === "style"
  );

  if (idx !== -1) {
    const attr = node.attributes[idx] as t.JSXAttribute;

    if (t.isJSXExpressionContainer(attr.value) && t.isObjectExpression(attr.value.expression)) {
      const props = attr.value.expression.properties;
      for (const [key, val] of Object.entries(newStyles)) {
        const pi = props.findIndex(
          (p) =>
            t.isObjectProperty(p) &&
            (t.isIdentifier(p.key, { name: key }) ||
              (t.isStringLiteral(p.key) && p.key.value === key))
        );
        const newProp = t.objectProperty(t.identifier(key), t.stringLiteral(val));
        if (pi !== -1) props[pi] = newProp;
        else props.push(newProp);
      }
    } else {
      // Replace entire style with new object
      attr.value = t.jsxExpressionContainer(
        t.objectExpression(
          Object.entries(newStyles).map(([k, v]) =>
            t.objectProperty(t.identifier(k), t.stringLiteral(v))
          )
        )
      );
    }
  } else {
    node.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier("style"),
        t.jsxExpressionContainer(
          t.objectExpression(
            Object.entries(newStyles).map(([k, v]) =>
              t.objectProperty(t.identifier(k), t.stringLiteral(v))
            )
          )
        )
      )
    );
  }
}

// ---------------------------------------------------------------------------
// Helper: Update text content (preserve sibling nodes)
// ---------------------------------------------------------------------------
function updateTextContent(jsxElement: t.JSXElement, textContent: string): void {
  const parts = textContent.split("\n");
  const textIdx = jsxElement.children.findIndex((c) => t.isJSXText(c));

  if (parts.length === 1) {
    if (textIdx !== -1) (jsxElement.children[textIdx] as t.JSXText).value = textContent;
    else jsxElement.children.unshift(t.jsxText(textContent));
  } else {
    const nodes: t.JSXElement["children"] = [];
    parts.forEach((part, i) => {
      if (part) nodes.push(t.jsxText(part));
      if (i < parts.length - 1) {
        nodes.push(
          t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier("br"), [], true), null, [], true)
        );
      }
    });
    if (textIdx !== -1) jsxElement.children.splice(textIdx, 1, ...nodes);
    else jsxElement.children.unshift(...nodes);
  }
}

// ---------------------------------------------------------------------------
// Helper: Create a new JSX element from an InsertDescriptor
// ---------------------------------------------------------------------------
function createJSXElement(desc: InsertDescriptor): t.JSXElement {
  const SELF_CLOSING = ["img", "input", "br", "hr", "meta", "link"];
  const isSelfClosing = SELF_CLOSING.includes(desc.tagName.toLowerCase());

  const attrs = Object.entries(desc.attributes ?? {}).map(([k, v]) =>
    t.jsxAttribute(t.jsxIdentifier(k), t.stringLiteral(v))
  );

  const opening = t.jsxOpeningElement(t.jsxIdentifier(desc.tagName), attrs, isSelfClosing);
  const closing = isSelfClosing ? null : t.jsxClosingElement(t.jsxIdentifier(desc.tagName));

  const children: t.JSXElement["children"] = [];
  if (desc.textContent && !isSelfClosing) {
    children.push(t.jsxText(desc.textContent));
  }

  return t.jsxElement(opening, closing, children, isSelfClosing);
}

// ---------------------------------------------------------------------------
// Helper: Deep clone a JSX element (for duplication)
// Uses re-parse approach to avoid shared AST node references
// ---------------------------------------------------------------------------
function cloneJSXElement(el: t.JSXElement): t.JSXElement {
  const tempCode = (generate as unknown as Function)(el, {}, "").code;
  const tempAst = parse(`<>{${tempCode}}</>`, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
    errorRecovery: true,
  });

  // Extract the JSX element from the expression statement
  let found: t.JSXElement | null = null;
  (traverse as unknown as Function)(tempAst, {
    JSXElement(p: any) {
      // Skip the outer fragment wrapper
      if (!found && !t.isJSXFragment(p.parent)) {
        found = p.node;
        p.stop();
      }
    },
  });

  return found ?? el; // fallback to original if parse fails
}

// ---------------------------------------------------------------------------
// Helper: Strip data-zenith-id from duplicated element
// ---------------------------------------------------------------------------
function stripZenithId(el: t.JSXElement): void {
  (traverse as unknown as Function)(t.file(t.program([t.expressionStatement(el)])), {
    JSXOpeningElement(path: any) {
      const idx = path.node.attributes.findIndex(
        (a: any) =>
          t.isJSXAttribute(a) &&
          t.isJSXIdentifier(a.name) &&
          a.name.name === "data-zenith-id"
      );
      if (idx !== -1) path.node.attributes.splice(idx, 1);
    },
  });
}
