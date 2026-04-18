"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveElementInNode = moveElementInNode;
const helpers_1 = require("./helpers");
function moveElementInNode(path, element) {
    const children = path.node.children;
    const jsxElements = children.filter(helpers_1.jsxFilter).map((child) => {
        return child;
    });
    const elementToMove = jsxElements.find((child) => {
        if (child.type !== 'JSXElement' || !child.openingElement) {
            return false;
        }
        const oid = (0, helpers_1.getOidFromJsxElement)(child.openingElement);
        return oid === element.oid;
    });
    if (!elementToMove) {
        console.error('Element not found for move');
        return;
    }
    (0, helpers_1.addKeyToElement)(elementToMove);
    const targetIndex = Math.min(element.location.index, jsxElements.length);
    const targetChild = jsxElements[targetIndex];
    const targetChildIndex = children.indexOf(targetChild);
    const originalIndex = children.indexOf(elementToMove);
    // Move to new location
    children.splice(originalIndex, 1);
    children.splice(targetChildIndex, 0, elementToMove);
}
//# sourceMappingURL=move.js.map