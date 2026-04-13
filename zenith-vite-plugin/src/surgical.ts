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
// Helpers
// ---------------------------------------------------------------------------

export function getTagName(name: t.JSXOpeningElement["name"]): string {
  if (t.isJSXIdentifier(name)) return name.name;
  if (t.isJSXMemberExpression(name)) return `${getTagName(name.object)}.${name.property.name}`;
  return "unknown";
}

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

export function patchSourceFile(source: string, instructions: PatchInstructions): string {
  const ast = parse(source, {
    sourceType: "module",
    plugins: PARSER_PLUGINS,
    errorRecovery: true,
  });

  // v9.8 Mechanical Perfection: Path-Based Resolution
  const idParts = instructions.zenithId.split(":");
  const selectorParts = idParts.slice(1);
  
  if (selectorParts.length === 0) {
    throw new Error(`Invalid Zenith ID format: ${instructions.zenithId}`);
  }

  let targetPath: any = null;
  let targetIsLocked = false;


  function matchPath(currentPath: any, selectorIdx: number, isLocked: boolean) {
    if (selectorIdx >= selectorParts.length) {
      targetPath = currentPath;
      targetIsLocked = isLocked;
      return;
    }

    const part = selectorParts[selectorIdx];
    const [expectedTag, expectedIdxStr] = part.split(".");
    const expectedIdx = parseInt(expectedIdxStr, 10);

    const matchInChildren = (nodes: any[], currentIdx: number, currentLocked: boolean): { found: boolean, nextIdx: number } => {
      let jsxIdx = currentIdx;
      for (const child of nodes) {
        if (t.isJSXElement(child)) {
          if (jsxIdx === expectedIdx) {
            const tagName = getTagName(child.openingElement.name);
            if (tagName !== expectedTag) {
              console.warn(`[ZENITH-SURGICAL] Tag mismatch at ${part}: expected ${expectedTag}, found ${tagName}. Proceeding anyway.`);
            }
            matchPath({ node: child.openingElement, parentPath: { node: child } }, selectorIdx + 1, currentLocked);
            if (targetPath) return { found: true, nextIdx: jsxIdx };
          }
          jsxIdx++;
        } else if (t.isJSXFragment(child)) {
          // v11.6: Flatten Fragments — Fragments are transparent in the Zenith ID system.
          // We traverse into them without incrementing the structural level, sharing the index counter.
          const res = matchInChildren(child.children, jsxIdx, currentLocked);
          if (res.found) return { found: true, nextIdx: res.nextIdx };
          jsxIdx = res.nextIdx;
        } else if (t.isJSXExpressionContainer(child)) {
          // v11.5+: Deep Resolve — Traverse into dynamic blocks
          const findInExpr = (expr: t.Node): boolean => {
            if (t.isJSXElement(expr)) {
              if (jsxIdx === expectedIdx) {
                matchPath({ node: expr.openingElement, parentPath: { node: expr } }, selectorIdx + 1, true); // Mark as LOCKED
                return !!targetPath;
              }
              jsxIdx++;
            } else if (t.isJSXFragment(expr)) {
              const res = matchInChildren(expr.children, jsxIdx, true);
              jsxIdx = res.nextIdx;
              return res.found;
            } else if (t.isConditionalExpression(expr)) {
              if (findInExpr(expr.consequent)) return true;
              if (findInExpr(expr.alternate)) return true;
            } else if (t.isCallExpression(expr) && t.isMemberExpression(expr.callee) && t.isIdentifier(expr.callee.property, { name: 'map' })) {
              const callback = expr.arguments[0];
              if (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) {
                const body = (callback as any).body;
                if (findInExpr(body)) return true;
              }
            } else if (t.isLogicalExpression(expr)) {
              if (findInExpr(expr.right)) return true;
            }
            return false;
          };
          if (findInExpr(child.expression)) return { found: true, nextIdx: jsxIdx };
        }
      }
      return { found: false, nextIdx: jsxIdx };
    };

    const children = currentPath.parentPath.node.children || [];
    matchInChildren(children, 0, isLocked);
    
    // Fallback: If literal index fails, try matching by tag name within children
    if (!targetPath) {
        let fallbackIdx = 0;
        const checkChildrenForFallback = (nodes: any[]) => {
            for (const child of nodes) {
                if (t.isJSXElement(child)) {
                    if (getTagName(child.openingElement.name) === expectedTag) {
                        if (fallbackIdx === expectedIdx) {
                             matchPath({ node: child.openingElement, parentPath: { node: child } }, selectorIdx + 1, isLocked);
                             if (targetPath) return true;
                        }
                        fallbackIdx++;
                    }
                }
            }
            return false;
        };
        checkChildrenForFallback(children);
    }
  }

  // Find root and start matching
  (traverse as unknown as Function)(ast, {
    JSXOpeningElement(path: any) {
      if (targetPath) return;
      const tagName = getTagName(path.node.name);
      const [rootTag, rootIdxStr] = selectorParts[0].split(".");
      
      const parent = path.parentPath.parent;
      // Root element is usually the one returned/exported, not nested in other JSX
      if (!t.isJSXElement(parent) && !t.isJSXFragment(parent)) {
        if (tagName === rootTag) {
          matchPath(path, 1, false); // Start unlocked
          if (targetPath) path.stop();
        }
      }
    }
  });

  if (!targetPath) {
    throw new Error(
      `Element "${instructions.zenithId}" not found in source. ` +
      `The AST structure has shifted. Try re-loading the designer.`
    );
  }

  const path = targetPath;
  const node: t.JSXOpeningElement = path.node;
  const jsxElementPath = path.parentPath;
  const jsxElement: t.JSXElement = jsxElementPath.node;

  // v9.0 Pre-flight Tag Verification
  if (instructions.expectedTag && getTagName(node.name) !== instructions.expectedTag) {
    throw new Error(`Surgical collision: Expected <${instructions.expectedTag}> but found <${getTagName(node.name)}> at "${instructions.zenithId}". Source may have drifted.`);
  }

  // Logic-Lock
  const isStructuralOp = instructions.delete || instructions.move || instructions.group || instructions.ungroup;
  if (!isStructuralOp && (targetIsLocked || isInDynamicBlock(path))) {
    throw new LogicLockedError(`Cannot patch "${instructions.zenithId}": inside a dynamic block (.map/ternary). Edit source directly.`);
  }

  // ── 1. DELETE ──────────────────────────────────────────────────────────
  if (instructions.delete) {
    jsxElementPath.remove();
  } else {
    // ── 2. STYLE PATCH ─────────────────────────────────────────────────────
    if (instructions.styles) updateStyleAttribute(node, instructions.styles);
    if (instructions.className !== undefined) updateAttribute(node, "className", instructions.className);
    if (instructions.textContent !== undefined) updateTextContent(jsxElement, instructions.textContent);

    // ── 5. INSERT CHILD ─────────────────────────────────────────────────────
    if (instructions.insert) {
      const newEl = createJSXElement(instructions.insert);
      const pos = instructions.insert.position;
      if (pos.type === "prepend") jsxElement.children.unshift(newEl);
      else if (pos.type === "index" && pos.index !== undefined) {
        const jsxChildren = jsxElement.children.filter(c => t.isJSXElement(c) || t.isJSXFragment(c));
        const target = jsxChildren[Math.min(pos.index, jsxChildren.length)];
        if (target) jsxElement.children.splice(jsxElement.children.indexOf(target), 0, newEl);
        else jsxElement.children.push(newEl);
      } else jsxElement.children.push(newEl);
    }
  }

  const output = (generate as unknown as Function)(ast, {
    retainLines: false, // v10.1: Disabled to prevent duplicate exports on Windows. Prettier handles formatting.
    compact: false,
    comments: true,
    concise: false,
    minified: false,
    retainFunctionParens: true,
    shouldPrintComment: () => true,
  }, source);

  return output.code;
}

// ---------------------------------------------------------------------------
// Helper: Update a simple string JSX attribute
// ---------------------------------------------------------------------------
function updateAttribute(node: t.JSXOpeningElement, name: string, value: string) {
  const idx = node.attributes.findIndex(
    (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === name
  );
  
  // v11.6: Hardening — If we are committing a design change, we overwrite 
  // dynamic expressions with literals to ensure the VFS state reflects the designer's intent.
  const attr = t.jsxAttribute(t.jsxIdentifier(name), t.stringLiteral(value));
  
  if (idx !== -1) {
    node.attributes[idx] = attr;
  } else {
    node.attributes.push(attr);
  }
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

        // v11.5: Numeric Literal Hardening — Use NumericLiteral if value is a valid code number
        const isNumeric = /^-?\d+(\.\d+)?$/.test(val);
        const newPropValue = isNumeric ? t.numericLiteral(parseFloat(val)) : t.stringLiteral(val);
        const newProp = t.objectProperty(t.identifier(key), newPropValue);

        if (pi !== -1) props[pi] = newProp;
        else props.push(newProp);
      }
    } else {
      // Replace entire style with new object
      attr.value = t.jsxExpressionContainer(
        t.objectExpression(
          Object.entries(newStyles).map(([k, v]) => {
             const isNumeric = /^-?\d+(\.\d+)?$/.test(v);
             return t.objectProperty(t.identifier(k), isNumeric ? t.numericLiteral(parseFloat(v)) : t.stringLiteral(v));
          })
        )
      );
    }
  } else {
    node.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier("style"),
        t.jsxExpressionContainer(
          t.objectExpression(
            Object.entries(newStyles).map(([k, v]) => {
               const isNumeric = /^-?\d+(\.\d+)?$/.test(v);
               return t.objectProperty(t.identifier(k), isNumeric ? t.numericLiteral(parseFloat(v)) : t.stringLiteral(v));
            })
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
