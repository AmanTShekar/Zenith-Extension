"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertElementToNode = insertElementToNode;
exports.createInsertedElement = createInsertedElement;
exports.insertAtIndex = insertAtIndex;
const constants_1 = require("@onlook/constants");
const utility_1 = require("@onlook/utility");
const packages_1 = require("../packages");
const parse_1 = require("../parse");
const helpers_1 = require("./helpers");
function insertElementToNode(path, element) {
    const newElement = createInsertedElement(element);
    switch (element.location.type) {
        case 'append':
            path.node.children.push(newElement);
            break;
        case 'prepend':
            path.node.children.unshift(newElement);
            break;
        case 'index':
            insertAtIndex(path, newElement, element.location.index);
            break;
        default:
            console.error(`Unhandled position: ${element.location}`);
            path.node.children.push(newElement);
            (0, utility_1.assertNever)(element.location);
    }
    path.stop();
}
function createInsertedElement(insertedChild) {
    let element;
    if (insertedChild.codeBlock) {
        element =
            (0, parse_1.getAstFromCodeblock)(insertedChild.codeBlock, true) || createJSXElement(insertedChild);
        (0, helpers_1.addParamToElement)(element, constants_1.EditorAttributes.DATA_ONLOOK_ID, insertedChild.oid);
    }
    else {
        element = createJSXElement(insertedChild);
    }
    if (insertedChild.pasteParams) {
        addPasteParamsToElement(element, insertedChild.pasteParams);
    }
    (0, helpers_1.addKeyToElement)(element);
    return element;
}
function addPasteParamsToElement(element, pasteParams) {
    (0, helpers_1.addParamToElement)(element, constants_1.EditorAttributes.DATA_ONLOOK_ID, pasteParams.oid);
}
function createJSXElement(insertedChild) {
    const attributes = Object.entries(insertedChild.attributes || {}).map(([key, value]) => packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier(key), typeof value === 'string'
        ? packages_1.t.stringLiteral(value)
        : packages_1.t.jsxExpressionContainer(packages_1.t.stringLiteral(JSON.stringify(value)))));
    const isSelfClosing = ['img', 'input', 'br', 'hr', 'meta', 'link'].includes(insertedChild.tagName.toLowerCase());
    const openingElement = packages_1.t.jsxOpeningElement(packages_1.t.jsxIdentifier(insertedChild.tagName), attributes, isSelfClosing);
    let closingElement = null;
    if (!isSelfClosing) {
        closingElement = packages_1.t.jsxClosingElement(packages_1.t.jsxIdentifier(insertedChild.tagName));
    }
    const children = [];
    // Add textContent as the first child if it exists
    if (insertedChild.textContent) {
        children.push(packages_1.t.jsxText(insertedChild.textContent));
    }
    // Add other children after the textContent
    children.push(...(insertedChild.children || []).map(createJSXElement));
    return packages_1.t.jsxElement(openingElement, closingElement, children, isSelfClosing);
}
function insertAtIndex(path, newElement, index) {
    if (index !== -1) {
        const jsxElements = path.node.children.filter(helpers_1.jsxFilter);
        const targetIndex = Math.min(index, jsxElements.length);
        if (targetIndex >= path.node.children.length) {
            path.node.children.push(newElement);
        }
        else {
            const targetChild = jsxElements[targetIndex];
            if (!targetChild) {
                console.error('Target child not found');
                path.node.children.push(newElement);
                return;
            }
            const targetChildIndex = path.node.children.indexOf(targetChild);
            path.node.children.splice(targetChildIndex, 0, newElement);
        }
    }
    else {
        console.error('Invalid index:', index);
        path.node.children.push(newElement);
    }
}
//# sourceMappingURL=insert.js.map