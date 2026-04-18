"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsertLocation = getInsertLocation;
exports.insertElement = insertElement;
exports.createElement = createElement;
exports.removeElement = removeElement;
const constants_1 = require("@onlook/models/constants");
const ids_1 = require("../../ids");
const style_1 = __importDefault(require("../../style"));
const helpers_1 = require("../helpers");
const helpers_2 = require("/common/helpers");
const ids_2 = require("/common/helpers/ids");
function findClosestIndex(container, y) {
    const children = Array.from(container.children);
    if (children.length === 0) {
        return 0;
    }
    let closestIndex = 0;
    let minDistance = Infinity;
    children.forEach((child, index) => {
        const rect = child.getBoundingClientRect();
        const childMiddle = rect.top + rect.height / 2;
        const distance = Math.abs(y - childMiddle);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });
    const closestRect = children[closestIndex].getBoundingClientRect();
    const closestMiddle = closestRect.top + closestRect.height / 2;
    return y > closestMiddle ? closestIndex + 1 : closestIndex;
}
function getInsertLocation(x, y) {
    const targetEl = findNearestBlockLevelContainer(x, y);
    if (!targetEl) {
        return;
    }
    const display = window.getComputedStyle(targetEl).display;
    const isStackOrGrid = display === 'flex' || display === 'grid';
    if (isStackOrGrid) {
        const index = findClosestIndex(targetEl, y);
        return {
            type: 'index',
            targetDomId: (0, ids_1.getOrAssignDomId)(targetEl),
            targetOid: (0, ids_2.getInstanceId)(targetEl) || (0, ids_2.getOid)(targetEl) || null,
            index,
            originalIndex: index,
        };
    }
    return {
        type: 'append',
        targetDomId: (0, ids_1.getOrAssignDomId)(targetEl),
        targetOid: (0, ids_2.getInstanceId)(targetEl) || (0, ids_2.getOid)(targetEl) || null,
    };
}
function findNearestBlockLevelContainer(x, y) {
    let targetEl = (0, helpers_1.getDeepElement)(x, y);
    if (!targetEl) {
        return null;
    }
    let inlineOnly = true;
    while (targetEl && inlineOnly) {
        inlineOnly = constants_1.INLINE_ONLY_CONTAINERS.has(targetEl.tagName.toLowerCase());
        if (inlineOnly) {
            targetEl = targetEl.parentElement;
        }
    }
    return targetEl;
}
function insertElement(element, location) {
    const targetEl = (0, helpers_2.elementFromDomId)(location.targetDomId);
    if (!targetEl) {
        console.warn(`Target element not found: ${location.targetDomId}`);
        return;
    }
    const newEl = createElement(element);
    switch (location.type) {
        case 'append':
            targetEl.appendChild(newEl);
            break;
        case 'prepend':
            targetEl.prepend(newEl);
            break;
        case 'index':
            if (location.index === undefined || location.index < 0) {
                console.warn(`Invalid index: ${location.index}`);
                return;
            }
            if (location.index >= targetEl.children.length) {
                targetEl.appendChild(newEl);
            }
            else {
                targetEl.insertBefore(newEl, targetEl.children.item(location.index));
            }
            break;
        default:
            console.warn(`Invalid position: ${location}`);
            (0, helpers_2.assertNever)(location);
    }
    const domEl = (0, helpers_1.getDomElement)(newEl, true);
    return domEl;
}
function createElement(element) {
    const newEl = document.createElement(element.tagName);
    newEl.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_INSERTED, 'true');
    for (const [key, value] of Object.entries(element.attributes)) {
        newEl.setAttribute(key, value);
    }
    if (element.textContent !== null && element.textContent !== undefined) {
        newEl.textContent = element.textContent;
    }
    for (const [key, value] of Object.entries(element.styles)) {
        newEl.style.setProperty(style_1.default.jsToCssProperty(key), value);
    }
    for (const child of element.children) {
        const childEl = createElement(child);
        newEl.appendChild(childEl);
    }
    return newEl;
}
function removeElement(location) {
    const targetEl = (0, helpers_2.elementFromDomId)(location.targetDomId);
    if (!targetEl) {
        console.warn(`Target element not found: ${location.targetDomId}`);
        return null;
    }
    let elementToRemove = null;
    switch (location.type) {
        case 'append':
            elementToRemove = targetEl.lastElementChild;
            break;
        case 'prepend':
            elementToRemove = targetEl.firstElementChild;
            break;
        case 'index':
            if (location.index !== -1) {
                elementToRemove = targetEl.children.item(location.index);
            }
            else {
                console.warn(`Invalid index: ${location.index}`);
                return null;
            }
            break;
        default:
            console.warn(`Invalid position: ${location}`);
            (0, helpers_2.assertNever)(location);
    }
    if (elementToRemove) {
        const domEl = (0, helpers_1.getDomElement)(elementToRemove, true);
        elementToRemove.style.display = 'none';
        return domEl;
    }
    else {
        console.warn(`No element found to remove at the specified location`);
        return null;
    }
}
//# sourceMappingURL=insert.js.map