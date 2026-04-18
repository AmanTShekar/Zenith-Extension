"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveElement = moveElement;
exports.getElementIndex = getElementIndex;
exports.moveElToIndex = moveElToIndex;
const helpers_1 = require("../../../helpers");
const dom_1 = require("../../dom");
const helpers_2 = require("../helpers");
function moveElement(domId, newIndex) {
    const el = (0, helpers_1.getHtmlElement)(domId);
    if (!el) {
        console.warn(`Move element not found: ${domId}`);
        return null;
    }
    const movedEl = moveElToIndex(el, newIndex);
    if (!movedEl) {
        console.warn(`Failed to move element: ${domId}`);
        return null;
    }
    const domEl = (0, helpers_2.getDomElement)(movedEl, true);
    const newMap = movedEl.parentElement ? (0, dom_1.buildLayerTree)(movedEl.parentElement) : null;
    return {
        domEl,
        newMap,
    };
}
function getElementIndex(domId) {
    const el = (0, helpers_1.getHtmlElement)(domId);
    if (!el) {
        console.warn(`Element not found: ${domId}`);
        return -1;
    }
    const htmlElments = Array.from(el.parentElement?.children || []).filter(helpers_1.isValidHtmlElement);
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
    parent.insertBefore(el, referenceNode ?? null);
    return el;
}
//# sourceMappingURL=index.js.map