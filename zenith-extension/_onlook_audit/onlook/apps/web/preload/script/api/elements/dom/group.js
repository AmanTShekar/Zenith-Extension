"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupElements = groupElements;
exports.ungroupElements = ungroupElements;
const constants_1 = require("@onlook/constants");
const helpers_1 = require("../../../helpers");
const ids_1 = require("../../../helpers/ids");
const dom_1 = require("../../dom");
const helpers_2 = require("../helpers");
function groupElements(parent, container, children) {
    const parentEl = (0, helpers_1.getHtmlElement)(parent.domId);
    if (!parentEl) {
        console.warn('Failed to find parent element', parent.domId);
        return null;
    }
    const containerEl = createContainerElement(container);
    // Find child elements and their positions
    const childrenMap = new Set(children.map((c) => c.domId));
    const childrenWithIndices = Array.from(parentEl.children)
        .map((child, index) => ({
        element: child,
        index,
        domId: (0, ids_1.getOrAssignDomId)(child),
    }))
        .filter(({ domId }) => childrenMap.has(domId));
    if (childrenWithIndices.length === 0) {
        console.warn('No valid children found to group');
        return null;
    }
    // Insert container at the position of the first child
    const insertIndex = Math.min(...childrenWithIndices.map((c) => c.index));
    parentEl.insertBefore(containerEl, parentEl.children[insertIndex] ?? null);
    // Move children into container
    childrenWithIndices.forEach(({ element }) => {
        const newElement = element.cloneNode(true);
        newElement.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_INSERTED, 'true');
        containerEl.appendChild(newElement);
        element.style.display = 'none';
        removeIdsFromChildElement(element);
    });
    const domEl = (0, helpers_2.getDomElement)(containerEl, true);
    return {
        domEl,
        newMap: (0, dom_1.buildLayerTree)(containerEl),
    };
}
function ungroupElements(parent, container) {
    const parentEl = (0, helpers_1.getHtmlElement)(parent.domId);
    if (!parentEl) {
        console.warn(`Parent element not found: ${parent.domId}`);
        return null;
    }
    let containerEl;
    if (container.domId) {
        containerEl = (0, helpers_1.getHtmlElement)(container.domId);
    }
    else {
        console.warn(`Container domId is required for ungrouping`);
        return null;
    }
    if (!containerEl) {
        console.warn(`Container element not found for ungrouping`);
        return null;
    }
    // Move all children of the container to the parent
    const children = Array.from(containerEl.children);
    children.forEach(child => {
        parentEl.appendChild(child);
    });
    // Remove the empty container
    containerEl.remove();
    const domEl = (0, helpers_2.getDomElement)(parentEl, true);
    return {
        domEl,
        newMap: (0, dom_1.buildLayerTree)(parentEl),
    };
}
function createContainerElement(target) {
    const containerEl = document.createElement(target.tagName);
    Object.entries(target.attributes).forEach(([key, value]) => {
        containerEl.setAttribute(key, value);
    });
    containerEl.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_INSERTED, 'true');
    containerEl.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID, target.domId);
    containerEl.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_ID, target.oid);
    return containerEl;
}
function removeIdsFromChildElement(el) {
    el.removeAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID);
    el.removeAttribute(constants_1.EditorAttributes.DATA_ONLOOK_ID);
    el.removeAttribute(constants_1.EditorAttributes.DATA_ONLOOK_INSERTED);
    const children = Array.from(el.children);
    if (children.length === 0) {
        return;
    }
    children.forEach((child) => {
        removeIdsFromChildElement(child);
    });
}
//# sourceMappingURL=group.js.map