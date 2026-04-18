"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveElement = moveElement;
exports.getElementIndex = getElementIndex;
exports.moveElToIndex = moveElToIndex;
const helpers_1 = require("../helpers");
const helpers_2 = require("/common/helpers");
function moveElement(domId, newIndex) {
    const el = (0, helpers_2.elementFromDomId)(domId);
    if (!el) {
        console.warn(`Move element not found: ${domId}`);
        return;
    }
    const movedEl = moveElToIndex(el, newIndex);
    if (!movedEl) {
        console.warn(`Failed to move element: ${domId}`);
        return;
    }
    const domEl = (0, helpers_1.getDomElement)(movedEl, true);
    return domEl;
}
function getElementIndex(domId) {
    const el = (0, helpers_2.elementFromDomId)(domId);
    if (!el) {
        console.warn(`Element not found: ${domId}`);
        return -1;
    }
    const htmlElments = Array.from(el.parentElement?.children || []).filter(helpers_2.isValidHtmlElement);
    const index = htmlElments.indexOf(el);
    return index;
}
function moveElToIndex(el, newIndex) {
    const parent = el.parentElement;
    if (!parent) {
        console.warn('Parent not found');
        return;
    }
    parent.removeChild(el);
    if (newIndex >= parent.children.length) {
        parent.appendChild(el);
        return el;
    }
    const referenceNode = parent.children[newIndex];
    parent.insertBefore(el, referenceNode);
    return el;
}
//# sourceMappingURL=index.js.map