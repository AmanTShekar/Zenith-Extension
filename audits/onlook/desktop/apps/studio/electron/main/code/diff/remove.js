"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeElementFromNode = removeElementFromNode;
exports.removeElementAtIndex = removeElementAtIndex;
const helpers_1 = require("./helpers");
function removeElementFromNode(path, element) {
    const parentPath = path.parentPath;
    if (!parentPath) {
        console.error('No parent path found');
        return;
    }
    const siblings = parentPath.node.children?.filter(helpers_1.jsxFilter) || [];
    path.remove();
    siblings.forEach((sibling) => {
        (0, helpers_1.addKeyToElement)(sibling);
    });
    path.stop();
}
function removeElementAtIndex(index, jsxElements, children) {
    if (index >= 0 && index < jsxElements.length) {
        const elementToRemove = jsxElements[index];
        const indexInChildren = children.indexOf(elementToRemove);
        if (indexInChildren !== -1) {
            children.splice(indexInChildren, 1);
        }
        else {
            console.error('Element to be removed not found in children');
        }
    }
    else {
        console.error('Invalid element index for removal');
    }
}
//# sourceMappingURL=remove.js.map