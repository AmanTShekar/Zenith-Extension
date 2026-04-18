"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNodeTextContent = updateNodeTextContent;
const packages_1 = require("../packages");
function updateNodeTextContent(node, textContent) {
    // Split the text content by newlines
    const parts = textContent.split('\n');
    // If there's only one part (no newlines), handle as before
    if (parts.length === 1) {
        const textNode = node.children.find((child) => packages_1.t.isJSXText(child));
        if (textNode) {
            textNode.value = textContent;
        }
        else {
            node.children.unshift(packages_1.t.jsxText(textContent));
        }
        return;
    }
    // Clear existing children
    node.children = [];
    // Add each part with a <br/> in between
    parts.forEach((part, index) => {
        if (part) {
            node.children.push(packages_1.t.jsxText(part));
        }
        if (index < parts.length - 1) {
            node.children.push(packages_1.t.jsxElement(packages_1.t.jsxOpeningElement(packages_1.t.jsxIdentifier('br'), [], true), null, [], true));
        }
    });
}
//# sourceMappingURL=text.js.map