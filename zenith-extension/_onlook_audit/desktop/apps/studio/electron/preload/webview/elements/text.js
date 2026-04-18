"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editTextByDomId = editTextByDomId;
exports.startEditingText = startEditingText;
exports.editText = editText;
exports.stopEditingText = stopEditingText;
const constants_1 = require("@onlook/models/constants");
const publish_1 = require("../events/publish");
const helpers_1 = require("./helpers");
const helpers_2 = require("/common/helpers");
function editTextByDomId(domId, content) {
    const el = (0, helpers_2.elementFromDomId)(domId);
    if (!el) {
        return null;
    }
    updateTextContent(el, content);
    return (0, helpers_1.getDomElement)(el, true);
}
function startEditingText(domId) {
    const el = (0, helpers_2.elementFromDomId)(domId);
    if (!el) {
        console.warn('Start editing text failed. No element for selector:', domId);
        return null;
    }
    const childNodes = Array.from(el.childNodes).filter((node) => node.nodeType !== Node.COMMENT_NODE);
    let targetEl = null;
    if (childNodes.length === 0) {
        targetEl = el;
    }
    else if (childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
        targetEl = el;
    }
    if (!targetEl) {
        console.warn('Start editing text failed. No target element found for selector:', domId);
        return null;
    }
    const originalContent = el.textContent || '';
    prepareElementForEditing(targetEl);
    return { originalContent };
}
function editText(domId, content) {
    const el = (0, helpers_2.elementFromDomId)(domId);
    if (!el) {
        console.warn('Edit text failed. No element for selector:', domId);
        return null;
    }
    prepareElementForEditing(el);
    updateTextContent(el, content);
    return (0, helpers_1.getDomElement)(el, true);
}
function stopEditingText(domId) {
    const el = (0, helpers_2.elementFromDomId)(domId);
    if (!el) {
        console.warn('Stop editing text failed. No element for selector:', domId);
        return null;
    }
    cleanUpElementAfterEditing(el);
    (0, publish_1.publishEditText)((0, helpers_1.getDomElement)(el, true));
    return { newContent: el.textContent || '', domEl: (0, helpers_1.getDomElement)(el, true) };
}
function prepareElementForEditing(el) {
    el.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_EDITING_TEXT, 'true');
}
function cleanUpElementAfterEditing(el) {
    (0, helpers_1.restoreElementStyle)(el);
    removeEditingAttributes(el);
}
function removeEditingAttributes(el) {
    el.removeAttribute(constants_1.EditorAttributes.DATA_ONLOOK_EDITING_TEXT);
}
function updateTextContent(el, content) {
    el.textContent = content;
}
//# sourceMappingURL=text.js.map