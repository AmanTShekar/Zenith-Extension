"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupElements = groupElements;
exports.ungroupElements = ungroupElements;
const constants_1 = require("@onlook/models/constants");
const ids_1 = require("../../ids");
const helpers_1 = require("../helpers");
const helpers_2 = require("/common/helpers");
function groupElements(parent, container, children) {
    const parentEl = (0, helpers_2.elementFromDomId)(parent.domId);
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
    parentEl.insertBefore(containerEl, parentEl.children[insertIndex]);
    // Move children into container
    childrenWithIndices.forEach(({ element }) => {
        const newElement = element.cloneNode(true);
        newElement.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_INSERTED, 'true');
        containerEl.appendChild(newElement);
        element.style.display = 'none';
        removeIdsFromChildElement(element);
    });
    return (0, helpers_1.getDomElement)(containerEl, true);
}
function ungroupElements(parent, container, children) {
    const parentEl = (0, helpers_2.elementFromDomId)(parent.domId);
    if (!parentEl) {
        console.warn('Failed to find parent element', parent.domId);
        return null;
    }
    const containerEl = Array.from(parentEl.children).find((child) => child.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID) === container.domId);
    if (!containerEl) {
        console.warn('Failed to find container element', parent.domId);
        return null;
    }
    // Insert container children in order into parent behind container
    Array.from(containerEl.children).forEach((child) => {
        child.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_INSERTED, 'true');
        parentEl.insertBefore(child, containerEl);
    });
    containerEl.style.display = 'none';
    return (0, helpers_1.getDomElement)(parentEl, true);
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