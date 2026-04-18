"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayDirection = void 0;
exports.getDisplayDirection = getDisplayDirection;
exports.findInsertionIndex = findInsertionIndex;
exports.findGridInsertionIndex = findGridInsertionIndex;
var DisplayDirection;
(function (DisplayDirection) {
    DisplayDirection["VERTICAL"] = "vertical";
    DisplayDirection["HORIZONTAL"] = "horizontal";
})(DisplayDirection || (exports.DisplayDirection = DisplayDirection = {}));
function getDisplayDirection(element) {
    if (!element || !element.children || element.children.length < 2) {
        return DisplayDirection.VERTICAL;
    }
    const children = Array.from(element.children);
    const firstChild = children[0];
    const secondChild = children[1];
    const firstRect = firstChild.getBoundingClientRect();
    const secondRect = secondChild.getBoundingClientRect();
    if (Math.abs(firstRect.left - secondRect.left) < Math.abs(firstRect.top - secondRect.top)) {
        return DisplayDirection.VERTICAL;
    }
    else {
        return DisplayDirection.HORIZONTAL;
    }
}
function findInsertionIndex(elements, x, y, displayDirection) {
    const midPoints = elements.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    });
    for (let i = 0; i < midPoints.length; i++) {
        if (displayDirection === DisplayDirection.VERTICAL) {
            if (y < midPoints[i].y) {
                return i;
            }
        }
        else {
            if (x < midPoints[i].x) {
                return i;
            }
        }
    }
    return elements.length;
}
function findGridInsertionIndex(parent, siblings, x, y) {
    const parentRect = parent.getBoundingClientRect();
    const gridComputedStyle = window.getComputedStyle(parent);
    const columns = gridComputedStyle.gridTemplateColumns.split(' ').length;
    const rows = gridComputedStyle.gridTemplateRows.split(' ').length;
    const cellWidth = parentRect.width / columns;
    const cellHeight = parentRect.height / rows;
    const gridX = Math.floor((x - parentRect.left) / cellWidth);
    const gridY = Math.floor((y - parentRect.top) / cellHeight);
    const targetIndex = gridY * columns + gridX;
    return Math.min(Math.max(targetIndex, 0), siblings.length);
}
//# sourceMappingURL=helpers.js.map