"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDrag = startDrag;
exports.drag = drag;
exports.endDrag = endDrag;
exports.endAllDrag = endAllDrag;
const constants_1 = require("@onlook/models/constants");
const ids_1 = require("../../ids");
const helpers_1 = require("../helpers");
const helpers_2 = require("./helpers");
const stub_1 = require("./stub");
const helpers_3 = require("/common/helpers");
function startDrag(domId) {
    const el = (0, helpers_3.elementFromDomId)(domId);
    if (!el) {
        console.warn(`Start drag element not found: ${domId}`);
        return null;
    }
    const parent = el.parentElement;
    if (!parent) {
        console.warn('Start drag parent not found');
        return null;
    }
    const htmlChildren = Array.from(parent.children).filter(helpers_3.isValidHtmlElement);
    const originalIndex = htmlChildren.indexOf(el);
    prepareElementForDragging(el);
    (0, stub_1.createStub)(el);
    const pos = getAbsolutePosition(el);
    el.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_START_POSITION, JSON.stringify(pos));
    return originalIndex;
}
function drag(domId, dx, dy, x, y) {
    const el = (0, helpers_3.elementFromDomId)(domId);
    if (!el) {
        console.warn('Dragging element not found');
        return;
    }
    const styles = window.getComputedStyle(el);
    const pos = JSON.parse(el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_START_POSITION) || '{}');
    const left = pos.left + dx - window.scrollX;
    const top = pos.top + dy - window.scrollY;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.width = styles.width + 1;
    el.style.height = styles.height + 1;
    el.style.position = 'fixed';
    (0, stub_1.moveStub)(el, x, y);
}
function endDrag(domId) {
    const el = (0, helpers_3.elementFromDomId)(domId);
    if (!el) {
        console.warn('End drag element not found');
        endAllDrag();
        return null;
    }
    const parent = el.parentElement;
    if (!parent) {
        console.warn('End drag parent not found');
        cleanUpElementAfterDragging(el);
        return null;
    }
    const stubIndex = (0, stub_1.getCurrentStubIndex)(parent, el);
    cleanUpElementAfterDragging(el);
    (0, stub_1.removeStub)();
    if (stubIndex === -1) {
        return null;
    }
    const elementIndex = Array.from(parent.children).indexOf(el);
    if (stubIndex === elementIndex) {
        return null;
    }
    return {
        newIndex: stubIndex,
        child: (0, helpers_1.getDomElement)(el, false),
        parent: (0, helpers_1.getDomElement)(parent, false),
    };
}
function prepareElementForDragging(el) {
    const saved = el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_SAVED_STYLE);
    if (saved) {
        return;
    }
    const style = {
        position: el.style.position,
        transform: el.style.transform,
        width: el.style.width,
        height: el.style.height,
        left: el.style.left,
        top: el.style.top,
    };
    el.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_SAVED_STYLE, JSON.stringify(style));
    el.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAGGING, 'true');
    if (el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_DIRECTION) !== null) {
        const parent = el.parentElement;
        if (parent) {
            const displayDirection = (0, helpers_2.getDisplayDirection)(parent);
            el.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_DIRECTION, displayDirection);
        }
    }
}
function getDragElement() {
    const el = document.querySelector(`[${constants_1.EditorAttributes.DATA_ONLOOK_DRAGGING}]`);
    if (!el) {
        return;
    }
    return el;
}
function cleanUpElementAfterDragging(el) {
    (0, helpers_1.restoreElementStyle)(el);
    removeDragAttributes(el);
    (0, ids_1.getOrAssignDomId)(el);
}
function removeDragAttributes(el) {
    el.removeAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_SAVED_STYLE);
    el.removeAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAGGING);
    el.removeAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_DIRECTION);
    el.removeAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_START_POSITION);
}
function getAbsolutePosition(element) {
    const rect = element.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
    };
}
function endAllDrag() {
    const draggingElements = document.querySelectorAll(`[${constants_1.EditorAttributes.DATA_ONLOOK_DRAGGING}]`);
    for (const el of draggingElements) {
        cleanUpElementAfterDragging(el);
    }
    (0, stub_1.removeStub)();
}
//# sourceMappingURL=drag.js.map