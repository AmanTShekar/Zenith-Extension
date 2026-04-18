"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTemplateNodeMap = createTemplateNodeMap;
exports.getDynamicTypeInfo = getDynamicTypeInfo;
exports.getCoreElementInfo = getCoreElementInfo;
exports.getContentFromTemplateNode = getContentFromTemplateNode;
exports.isNodeElementArray = isNodeElementArray;
exports.getTemplateNodeChild = getTemplateNodeChild;
const models_1 = require("@onlook/models");
const helpers_1 = require("../code-edit/helpers");
const helpers_2 = require("../helpers");
const ids_1 = require("../ids");
const packages_1 = require("../packages");
const parse_1 = require("../parse");
const helpers_3 = require("./helpers");
function createTemplateNodeMap({ ast, filename, branchId, }) {
    const mapping = new Map();
    const componentStack = [];
    const dynamicTypeStack = [];
    (0, packages_1.traverse)(ast, {
        FunctionDeclaration: {
            enter(path) {
                if (!path.node.id) {
                    return;
                }
                componentStack.push(path.node.id.name);
            },
            exit() {
                componentStack.pop();
            },
        },
        ClassDeclaration: {
            enter(path) {
                if (!path.node.id) {
                    return;
                }
                componentStack.push(path.node.id.name);
            },
            exit() {
                componentStack.pop();
            },
        },
        VariableDeclaration: {
            enter(path) {
                if (!path.node.declarations[0]?.id ||
                    !packages_1.t.isIdentifier(path.node.declarations[0].id)) {
                    return;
                }
                componentStack.push(path.node.declarations[0].id.name);
            },
            exit() {
                componentStack.pop();
            },
        },
        CallExpression: {
            enter(path) {
                if (isNodeElementArray(path.node)) {
                    dynamicTypeStack.push(models_1.DynamicType.ARRAY);
                }
            },
            exit(path) {
                if (isNodeElementArray(path.node)) {
                    dynamicTypeStack.pop();
                }
            },
        },
        ConditionalExpression: {
            enter() {
                dynamicTypeStack.push(models_1.DynamicType.CONDITIONAL);
            },
            exit() {
                dynamicTypeStack.pop();
            },
        },
        LogicalExpression: {
            enter(path) {
                if (path.node.operator === '&&' || path.node.operator === '||') {
                    dynamicTypeStack.push(models_1.DynamicType.CONDITIONAL);
                }
            },
            exit(path) {
                if (path.node.operator === '&&' || path.node.operator === '||') {
                    dynamicTypeStack.pop();
                }
            },
        },
        JSXElement(path) {
            if ((0, helpers_2.isReactFragment)(path.node.openingElement)) {
                return;
            }
            const existingOid = (0, ids_1.getExistingOid)(path.node.openingElement.attributes);
            if (!existingOid) {
                return;
            }
            const oid = existingOid.value;
            const dynamicType = getDynamicTypeInfo(path);
            const coreElementType = getCoreElementInfo(path);
            const newTemplateNode = (0, helpers_3.createTemplateNode)(path, branchId, filename, componentStack, dynamicType, coreElementType);
            mapping.set(oid, newTemplateNode);
        },
    });
    return mapping;
}
function getDynamicTypeInfo(path) {
    const parent = path.parent;
    const grandParent = path.parentPath?.parent;
    // Check for conditional root element
    const isConditionalRoot = (packages_1.t.isConditionalExpression(parent) || packages_1.t.isLogicalExpression(parent)) &&
        packages_1.t.isJSXExpressionContainer(grandParent);
    // Check for array map root element
    const isArrayMapRoot = packages_1.t.isArrowFunctionExpression(parent) ||
        (packages_1.t.isJSXFragment(parent) && path.parentPath?.parentPath?.isArrowFunctionExpression());
    const dynamicType = isConditionalRoot
        ? models_1.DynamicType.CONDITIONAL
        : isArrayMapRoot
            ? models_1.DynamicType.ARRAY
            : undefined;
    return dynamicType ?? null;
}
function getCoreElementInfo(path) {
    const parent = path.parent;
    const isComponentRoot = packages_1.t.isReturnStatement(parent) || packages_1.t.isArrowFunctionExpression(parent);
    const isBodyTag = packages_1.t.isJSXIdentifier(path.node.openingElement.name) &&
        path.node.openingElement.name.name.toLocaleLowerCase() === 'body';
    const coreElementType = isComponentRoot
        ? models_1.CoreElementType.COMPONENT_ROOT
        : isBodyTag
            ? models_1.CoreElementType.BODY_TAG
            : undefined;
    return coreElementType ?? null;
}
async function getContentFromTemplateNode(templateNode, content) {
    try {
        const filePath = templateNode.path;
        const startTag = templateNode.startTag;
        const startRow = startTag.start.line;
        const startColumn = startTag.start.column;
        const endTag = templateNode.endTag || startTag;
        const endRow = endTag.end.line;
        const endColumn = endTag.end.column;
        if (content == null) {
            console.error(`Failed to read file: ${filePath}`);
            return null;
        }
        const lines = content.split('\n');
        const selectedText = lines
            .slice(startRow - 1, endRow)
            .map((line, index, array) => {
            if (index === 0 && array.length === 1) {
                // Only one line
                return line.substring(startColumn - 1, endColumn);
            }
            else if (index === 0) {
                // First line of multiple
                return line.substring(startColumn - 1);
            }
            else if (index === array.length - 1) {
                // Last line
                return line.substring(0, endColumn);
            }
            // Full lines in between
            return line;
        })
            .join('\n');
        return selectedText;
    }
    catch (error) {
        console.error('Error reading range from file:', error);
        throw error;
    }
}
function isNodeElementArray(node) {
    return (packages_1.t.isMemberExpression(node.callee) &&
        packages_1.t.isIdentifier(node.callee.property) &&
        node.callee.property.name === 'map');
}
async function getTemplateNodeChild(parentContent, child, index) {
    if (parentContent == null) {
        console.error(`Failed to read code block: ${parentContent}`);
        return null;
    }
    const ast = (0, parse_1.getAstFromContent)(parentContent);
    let currentIndex = 0;
    if (!ast) {
        return null;
    }
    let res = null;
    (0, packages_1.traverse)(ast, {
        JSXElement(path) {
            if (!path) {
                return;
            }
            const node = path.node;
            const childName = node.openingElement.name.name;
            if (childName === child.component) {
                const instanceId = (0, helpers_1.getOidFromJsxElement)(node.openingElement);
                if (instanceId) {
                    res = { instanceId, component: child.component };
                }
                if (currentIndex === index || index === -1) {
                    path.stop();
                }
                currentIndex++;
            }
        },
    });
    return res;
}
//# sourceMappingURL=map.js.map