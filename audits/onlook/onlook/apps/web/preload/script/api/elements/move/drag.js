"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDrag = startDrag;
exports.dragAbsolute = dragAbsolute;
exports.drag = drag;
exports.endDragAbsolute = endDragAbsolute;
exports.endDrag = endDrag;
exports.endAllDrag = endAllDrag;
const constants_1 = require("@onlook/constants");
const helpers_1 = require("../../../helpers");
const ids_1 = require("../../../helpers/ids");
const helpers_2 = require("../helpers");
const helpers_3 = require("./helpers");
const stub_1 = require("./stub");
function startDrag(domId) {
    const el = (0, helpers_1.getHtmlElement)(domId);
    if (!el) {
        console.warn(`Start drag element not found: ${domId}`);
        return null;
    }
    const parent = el.parentElement;
    if (!parent) {
        console.warn('Start drag parent not found');
        return null;
    }
    const htmlChildren = Array.from(parent.children).filter(helpers_1.isValidHtmlElement);
    const originalIndex = htmlChildren.indexOf(el);
    const styles = window.getComputedStyle(el);
    prepareElementForDragging(el);
    if (styles.position !== 'absolute') {
        (0, stub_1.createStub)(el);
    }
    const pos = getAbsolutePosition(el);
    const rect = el.getBoundingClientRect();
    const offset = styles.position === 'absolute' ? {
        x: pos.left,
        y: pos.top
    } : {
        x: pos.left - rect.left,
        y: pos.top - rect.top
    };
    el.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_START_POSITION, JSON.stringify({ ...pos, offset }));
    return originalIndex;
}
function dragAbsolute(domId, x, y, origin) {
    const el = (0, helpers_1.getHtmlElement)(domId);
    if (!el) {
        console.warn('Dragging element not found');
        return;
    }
    const parent = el.parentElement;
    if (parent) {
        const pos = JSON.parse(el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_START_POSITION) || '{}');
        const parentRect = parent.getBoundingClientRect();
        const newLeft = x - parentRect.left - (origin.x - pos.offset.x);
        const newTop = y - parentRect.top - (origin.y - pos.offset.y);
        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;
    }
    el.style.transform = 'none';
}
function drag(domId, dx, dy, x, y) {
    const el = (0, helpers_1.getHtmlElement)(domId);
    if (!el) {
        console.warn('Dragging element not found');
        return;
    }
    if (!el.style.transition) {
        el.style.transition = 'transform 0.05s cubic-bezier(0.2, 0, 0, 1)';
    }
    const pos = JSON.parse(el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_START_POSITION) || '{}');
    if (el.style.position !== 'fixed') {
        const styles = window.getComputedStyle(el);
        el.style.position = 'fixed';
        el.style.width = styles.width;
        el.style.height = styles.height;
        el.style.left = `${pos.left}px`;
        el.style.top = `${pos.top}px`;
    }
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    const parent = el.parentElement;
    if (parent) {
        (0, stub_1.moveStub)(el, x, y);
    }
}
function endDragAbsolute(domId) {
    const el = (0, helpers_1.getHtmlElement)(domId);
    if (!el) {
        console.warn('End drag element not found');
        return null;
    }
    const styles = window.getComputedStyle(el);
    removeDragAttributes(el);
    (0, ids_1.getOrAssignDomId)(el);
    return {
        left: styles.left,
        top: styles.top,
    };
}
function endDrag(domId) {
    const el = (0, helpers_1.getHtmlElement)(domId);
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
        child: (0, helpers_2.getDomElement)(el, false),
        parent: (0, helpers_2.getDomElement)(parent, false),
    };
}
function prepareElementForDragging(el) {
    const saved = el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_SAVED_STYLE);
    if (saved) {
        return;
    }
    // Save all relevant style properties for later restoration
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
    // Ensure element appears above others during drag
    el.style.zIndex = '1000';
    if (el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_DIRECTION) !== null) {
        const parent = el.parentElement;
        if (parent) {
            const displayDirection = (0, helpers_3.getDisplayDirection)(parent);
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
    (0, helpers_2.restoreElementStyle)(el);
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
    for (const el of Array.from(draggingElements)) {
        cleanUpElementAfterDragging(el);
    }
    (0, stub_1.removeStub)();
}
//# sourceMappingURL=drag.js.map