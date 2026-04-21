import { parse, type ParserOptions } from "@babel/parser";
import _traverse from "@babel/traverse";
import * as t from "@babel/types";
import * as recast from "recast";
import fs from "node:fs";
import path from "node:path";

// Handle ESM/CJS interop for Babel packages
const traverse = (
  typeof _traverse === "function"
    ? _traverse
    : (_traverse as any).default
) as typeof _traverse;

const babelParser = {
  parse: (code: string) => {
    return parse(code, {
      sourceType: "module",
      plugins: PARSER_PLUGINS,
      tokens: true, // Recast needs tokens
    });
  }
};

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
  fingerprint?: string; // v11.7 Perfection: Used for self-healing if zenithId drift occurs

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

  /** Reparent this element to a different container */
  reparent?: {
    /** zenithId of the new parent container */
    newParentId: string;
    /** New index within the new parent's children */
    index: number;
  };

  /** Optional tag verification to prevent ID drift */
  expectedTag?: string;

  /** v14.0: Structural Content Editability */
  contentUpdate?: {
    text: string;
  };
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

    // v11.7.1 Mechanical Perfection: IIFE Logic-Lock
    // If we are inside a function that is being called immediately, lock it.
    if (
      (t.isArrowFunctionExpression(path.node) || t.isFunctionExpression(path.node)) &&
      t.isCallExpression(parentNode) &&
      parentNode.callee === path.node
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

function safeLog(message: string) {
  try {
     const logDir = path.join(process.cwd(), ".zenith");
     if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
     const logPath = path.join(logDir, "surgical.log");
     const timestamp = new Date().toISOString();
     fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
  } catch { /* Fail silently to avoid breaking the transform */ }
}

export function patchSourceFile(source: string, instructions: PatchInstructions): string {
  const ast = recast.parse(source, {
    parser: babelParser,
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
      safeLog(`[DRY-RUN] Target successfully matched: ${instructions.zenithId}`);
      return;
    }

    const part = selectorParts[selectorIdx];
    safeLog(`[TRAVERSAL] Resolving ${part} (Selector Index: ${selectorIdx})`);
    const [expectedTag, expectedIdxStr] = part.split(".");
    const expectedIdx = parseInt(expectedIdxStr, 10);

    const matchInChildren = (nodes: any[], tracker: { jsxIdx: number }, currentLocked: boolean): { found: boolean } => {
      for (const child of nodes) {
        if (t.isJSXElement(child)) {
          if (tracker.jsxIdx === expectedIdx) {
            const tagName = getTagName(child.openingElement.name);
            if (tagName !== expectedTag) {
              safeLog(`[FORENSIC-AUDIT] Tag mismatch at ${part}: expected <${expectedTag}>, found <${tagName}>. ZenithId: ${instructions.zenithId}`);
              if (instructions.fingerprint) {
                safeLog(`[AUDIT] Fingerprint failover ready: ${instructions.fingerprint}`);
                return { found: false }; 
              }
            }
            safeLog(`[TRAVERSAL] Descending into <${tagName}> at index ${expectedIdx}`);
            matchPath({ node: child.openingElement, parentPath: { node: child, container: nodes, index: nodes.indexOf(child) } }, selectorIdx + 1, currentLocked);
            if (targetPath) return { found: true };
          }
          tracker.jsxIdx++;
        } else if (t.isJSXFragment(child)) {
          const res = matchInChildren(child.children, tracker, currentLocked);
          if (res.found) return { found: true };
        } else if (t.isJSXExpressionContainer(child)) {
          const findInExpr = (expr: t.Node): boolean => {
            if (t.isJSXElement(expr)) {
              if (tracker.jsxIdx === expectedIdx) {
                matchPath({ node: expr.openingElement, parentPath: { node: expr, container: [expr], index: 0 } }, selectorIdx + 1, true);
                return !!targetPath;
              }
              tracker.jsxIdx++;
            } else if (t.isJSXFragment(expr)) {
              const res = matchInChildren(expr.children, tracker, true);
              return res.found;
            } else if (t.isConditionalExpression(expr)) {
              if (findInExpr(expr.consequent)) return true;
              if (findInExpr(expr.alternate)) return true;
            } else if (t.isCallExpression(expr)) {
              const callback = t.isMemberExpression(expr.callee) && t.isIdentifier(expr.callee.property, { name: 'map' }) 
                ? expr.arguments[0] 
                : expr.callee;
              if (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) {
                if (findInExpr(callback.body)) return true;
              }
            } else if (t.isLogicalExpression(expr)) {
              if (findInExpr(expr.right)) return true;
            } else if (t.isBlockStatement(expr)) {
               for (const statement of expr.body) {
                 if (findInExpr(statement)) return true;
               }
            } else if (t.isReturnStatement(expr)) {
               return expr.argument ? findInExpr(expr.argument) : false;
            } else if (t.isIfStatement(expr)) {
               if (expr.consequent && findInExpr(expr.consequent)) return true;
               if (expr.alternate && findInExpr(expr.alternate)) return true;
            }
            return false;
          };
          if (findInExpr(child.expression)) return { found: true };
        }
      }
      return { found: false };
    };

    const children = currentPath.parentPath.node.children || [];
    matchInChildren(children, { jsxIdx: 0 }, isLocked);
    
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

  // v11.7.1 Mechanical Perfection: HOC Tunneling
  // Recursive helper to find the JSX root through memo, forwardRef, etc.
  function isComponentRoot(path: any, expectedTag: string): boolean {
    const parent = path.parentPath.node;
    
    // If we're inside standard JSX, we're not a root
    if (t.isJSXElement(path.parentPath.parent) || t.isJSXFragment(path.parentPath.parent)) {
      return false;
    }

    const tagName = getTagName(path.node.name);
    return tagName === expectedTag;
  }

  // Find root and start matching
  (traverse as unknown as Function)(ast, {
    JSXOpeningElement(path: any) {
      if (targetPath) return;
      const [rootTag, rootIdxStr] = selectorParts[0].split(".");
      
      if (isComponentRoot(path, rootTag)) {
          // Identify which "branch" (ReturnStatement) we are in to handle Multi-Return components
          const parentPath = path.parentPath;
          let returnIdx = 0;
          if (t.isReturnStatement(parentPath.parent)) {
            const funcBody = parentPath.findParent((p: any) => t.isBlockStatement(p.node));
            if (funcBody) {
              const siblings = (funcBody.node as any).body || [];
              for (const sib of siblings) {
                if (sib === parentPath.parent) break;
                if (t.isReturnStatement(sib) || t.isIfStatement(sib)) returnIdx++;
              }
            }
          }

          const expectedIdx = parseInt(rootIdxStr, 10);
          if (returnIdx === expectedIdx) {
            matchPath(path, 1, false);
            if (targetPath) path.stop();
          }
      }
    }
  });

  if (!targetPath && instructions.fingerprint) {
    // v11.7 Perfection: Fuzzy matching — If structural ID fails, search by fingerprint
    (traverse as unknown as Function)(ast, {
      JSXOpeningElement(path: any) {
        if (targetPath) return;
        const attributes = path.node.attributes;
        const fingerprintAttr = attributes.find(
          (a: any) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === "data-zenith-fingerprint"
        );
        if (fingerprintAttr && t.isStringLiteral(fingerprintAttr.value) && fingerprintAttr.value.value === instructions.fingerprint) {
          targetPath = path;
          targetIsLocked = false; // Fingerprint matches are treated as valid targets
          path.stop();
        }
      }
    });
  }

  if (!targetPath) {
    throw new Error(
      `Element "${instructions.zenithId}" not found in source. ` +
      (instructions.fingerprint ? `Fuzzy fingerprint search also failed.` : `The AST structure has shifted.`)
    );
  }

  const path = targetPath;
  const node: t.JSXOpeningElement = path.node;
  const jsxElementPath = path.parentPath;
  const jsxElement: t.JSXElement = jsxElementPath.node;

  // v9.0 Pre-flight Tag Verification
  if (instructions.expectedTag && getTagName(node.name) !== instructions.expectedTag) {
    const foundTag = getTagName(node.name);
    
    // Final Attempt: If we matched structural ID but the tag is WRONG, 
    // and we haven't tried fingerprint yet, try it now.
    if (instructions.fingerprint && !targetIsLocked) {
       safeLog(`[FAILOVER] Structural mismatch for "${instructions.zenithId}". Triggering fingerprint search: ${instructions.fingerprint}`);
       targetPath = null;
       // ... the global fingerprint search below will handle it
    } else {
       throw new Error(`Surgical collision: Expected <${instructions.expectedTag}> but found <${foundTag}> at "${instructions.zenithId}". Source has drifted beyond structural resolution.`);
    }
  }

  // Logic-Lock
  const isStructuralOp = instructions.delete || instructions.move || instructions.group || instructions.ungroup;
  if (!isStructuralOp && (targetIsLocked || isInDynamicBlock(path))) {
    throw new LogicLockedError(`Cannot patch "${instructions.zenithId}": inside a dynamic block (.map/ternary). Edit source directly.`);
  }

  // ── 1. DELETE ──────────────────────────────────────────────────────────
  if (instructions.delete) {
    if (jsxElementPath.container && Array.isArray(jsxElementPath.container)) {
      (jsxElementPath.container as any[]).splice(jsxElementPath.index, 1);
    } else {
      jsxElementPath.remove();
    }
  } else {
    // ── 2. STYLE PATCH ─────────────────────────────────────────────────────
    // ── 2. STYLE PATCH ─────────────────────────────────────────────────────
    if (instructions.styles) updateStyleAttribute(node, instructions.styles);
    if (instructions.className !== undefined) updateAttribute(node, "className", instructions.className);
    if (instructions.textContent !== undefined) updateTextContent(jsxElement, instructions.textContent);
    
    // v14.0: Structural Content Editability
    if (instructions.contentUpdate) {
      updateTextContent(jsxElement, instructions.contentUpdate.text);
    }

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

    // ── 6. REPARENT (v14.0) ────────────────────────────────────────────────
    if (instructions.reparent) {
      const { newParentId, index } = instructions.reparent;
      safeLog(`[STRUCTURAL] Initiating reparent mutation to: ${newParentId} at index ${index}`);
      
      const elementToMove = jsxElement; 
      const oldContainer = jsxElementPath.parentPath.container;
      const oldIdx = oldContainer.indexOf(elementToMove);
      
      // v14.2: Robust Destination Resolution
      let destinationParent: t.JSXElement | null = null;
      
      function findParentRecursive(currentRoot: any, targetId: string): t.JSXElement | null {
        const parts = targetId.split(":");
        const selector = parts.slice(1);
        
        let current: any = currentRoot;
        for (const segment of selector) {
          const [tag, idxStr] = segment.split(".");
          const idx = parseInt(idxStr, 10);
          
          const children = current.children || [];
          const jsxChildren = children.filter((c: any) => t.isJSXElement(c));
          if (idx < jsxChildren.length) {
            current = jsxChildren[idx];
            if (getTagName(current.openingElement.name) !== tag) {
               // Tag mismatch: attempt recovery or skip
            }
          } else {
            return null;
          }
        }
        return current;
      }

      // Re-traversals are expensive, but necessary for cross-component stability in the same file
      (traverse as any)(ast, {
        JSXElement(p: any) {
          if (destinationParent) return;
          const tagName = getTagName(p.node.openingElement.name);
          const firstSegment = destIdParts[1]?.split(".")[0];
          if (tagName === firstSegment) {
            // Verify if this is the root matching the ID
            const found = findParentRecursive(p.node, newParentId.replace(/.*:/, `${destIdParts[0]}:`));
            if (found) {
              destinationParent = found;
              p.stop();
            }
          }
        }
      });

      if (destinationParent && t.isJSXElement(destinationParent)) {
        if (oldIdx !== -1) {
          oldContainer.splice(oldIdx, 1); // Extract
          // Ensure we don't insert into a self-closing tag
          if (destinationParent.openingElement.selfClosing) {
            destinationParent.openingElement.selfClosing = false;
            destinationParent.closingElement = t.jsxClosingElement(t.cloneNode(destinationParent.openingElement.name));
          }
          
          const jsxChildren = destinationParent.children.filter(c => t.isJSXElement(c) || t.isJSXFragment(c));
          const targetSibling = jsxChildren[Math.min(index, jsxChildren.length)];
          if (targetSibling) {
             const realIdx = destinationParent.children.indexOf(targetSibling);
             destinationParent.children.splice(realIdx, 0, elementToMove);
          } else {
             destinationParent.children.push(elementToMove);
          }
          safeLog(`[STRUCTURAL] Reparent successful: ${instructions.zenithId} -> ${newParentId}`);
        }
      } else {
        safeLog(`[STRUCTURAL] Reparent FAILED: Could not find destination ${newParentId}`);
      }
    }
  }

  const output = recast.print(ast).code;
  return output;
}

// ---------------------------------------------------------------------------
// Helper: Update a simple string JSX attribute
// ---------------------------------------------------------------------------
function updateAttribute(node: t.JSXOpeningElement, name: string, value: string) {
  const idx = node.attributes.findIndex(
    (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === name
  );

  // v11.7 Perfection: Support numeric literals for designer commits
  const isNumeric = /^-?\d+(\.\d+)?$/.test(value);
  const attr = t.jsxAttribute(
    t.jsxIdentifier(name), 
    isNumeric ? t.jsxExpressionContainer(t.numericLiteral(parseFloat(value))) : t.stringLiteral(value)
  );
  
  if (idx !== -1) {
    node.attributes.splice(idx, 1);
  }
  node.attributes.push(attr);
}

// ---------------------------------------------------------------------------
// Helper: Merge new styles into existing style attribute
// ---------------------------------------------------------------------------
function updateStyleAttribute(node: t.JSXOpeningElement, newStyles: Record<string, string> | null | undefined) {
  if (!newStyles || Object.keys(newStyles).length === 0) return;
  const idx = node.attributes.findIndex(
    (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === "style"
  );

  let existingProps: (t.ObjectProperty | t.SpreadElement | t.ObjectMethod)[] = [];

  if (idx !== -1) {
    const attr = node.attributes[idx] as t.JSXAttribute;
    if (t.isJSXExpressionContainer(attr.value) && t.isObjectExpression(attr.value.expression)) {
      // v38.0 Forensic: Capture existing styles for conflict analysis
      const existingStyleNames = attr.value.expression.properties
        .filter(p => t.isObjectProperty(p) && t.isIdentifier(p.key))
        .map(p => (p as t.ObjectProperty).key as t.Identifier)
        .map(k => k.name);
      
      safeLog(`[STYLE-AUDIT] Found existing styles: ${existingStyleNames.join(", ")}`);

      existingProps = attr.value.expression.properties.filter(p => {
        if (t.isObjectProperty(p) && t.isIdentifier(p.key)) {
          const propName = p.key.name;
          if (newStyles[propName]) {
             // Responsiveness Check:
             const newVal = newStyles[propName];
             const oldValNode = p.value;
             let oldValStr = "";
             if (t.isStringLiteral(oldValNode)) oldValStr = oldValNode.value;
             else if (t.isNumericLiteral(oldValNode)) oldValStr = oldValNode.value.toString();

             const isNewPx = /^-?\d+(\.\d+)?(px)?$/.test(newVal);
             const isOldRelative = /%|fr|rem|em|vh|vw/.test(oldValStr);

             if (isNewPx && isOldRelative) {
                safeLog(`[RESPONSIVENESS-WARNING] Property "${propName}" collision! Absolute value "${newVal}" is overwriting relative value "${oldValStr}". Layout may break.`);
             }
             return false; // Overwrite
          }
          return true;
        }
        return true;
      });
    }
    node.attributes.splice(idx, 1);
  }

  // Add new/updated properties
  const newProps = Object.entries(newStyles).map(([k, v]) => {
    const isNumeric = /^-?\d+(\.\d+)?$/.test(v);
    return t.objectProperty(
      t.identifier(k),
      isNumeric ? t.numericLiteral(parseFloat(v)) : t.stringLiteral(v)
    );
  });

  const finalAttr = t.jsxAttribute(
    t.jsxIdentifier("style"),
    t.jsxExpressionContainer(
      t.objectExpression([...existingProps, ...newProps])
    )
  );

  node.attributes.push(finalAttr);
}

// ---------------------------------------------------------------------------
// Helper: Update text content (preserve sibling nodes)
// ---------------------------------------------------------------------------
function updateTextContent(jsxElement: t.JSXElement, textContent: string | null | undefined): void {
  if (textContent === null || textContent === undefined) return;
  const parts = textContent.split("\n");

  const nodes: t.JSXElement["children"] = [];
  parts.forEach((part, i) => {
    if (part) nodes.push(t.jsxText(part));
    if (i < parts.length - 1) {
      nodes.push(
        t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier("br"), [], true), null, [], true)
      );
    }
  });

  // v13.0 Atomic Content Replacement
  // We determine if we should "overwrite" the children or "patch" a specific text node.
  // For visual design, if we are setting textContent, we usually want to replace everything 
  // unless there are nested elements we want to keep.
  const hasMultipleChildren = jsxElement.children.length > 1;
  const hasElements = jsxElement.children.some(c => t.isJSXElement(c) || t.isJSXFragment(c));

  if (!hasElements || !hasMultipleChildren) {
    // Single child or purely text/fragments: Perform atomic replacement
    jsxElement.children = nodes;
  } else {
    // Hybrid content: Try to find the primary text node to replace
    const textIdx = jsxElement.children.findIndex((c) => t.isJSXText(c));
    if (textIdx !== -1) {
      jsxElement.children.splice(textIdx, 1, ...nodes);
    } else {
      // Fallback: unshift the new text
      jsxElement.children.unshift(...nodes);
    }
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
  try {
    const tempCode = recast.print(el).code;
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

    return found ?? t.cloneNode(el, true); // fallback to cloneNode if parse fails
  } catch (e) {
    return t.cloneNode(el, true); // safety fallback
  }
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
