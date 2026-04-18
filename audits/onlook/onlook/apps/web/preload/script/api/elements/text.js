"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editTextByDomId = editTextByDomId;
exports.startEditingText = startEditingText;
exports.editText = editText;
exports.stopEditingText = stopEditingText;
exports.isChildTextEditable = isChildTextEditable;
const constants_1 = require("@onlook/constants");
const helpers_1 = require("../../helpers");
const dom_1 = require("../dom");
const helpers_2 = require("./helpers");
function editTextByDomId(domId, content) {
    const el = (0, helpers_1.getHtmlElement)(domId);
    if (!el) {
        return null;
    }
    updateTextContent(el, content);
    return (0, helpers_2.getDomElement)(el, true);
}
function startEditingText(domId) {
    const el = (0, helpers_1.getHtmlElement)(domId);
    if (!el) {
        console.warn('Start editing text failed. No element for selector:', domId);
        return null;
    }
    const childNodes = Array.from(el.childNodes).filter((node) => node.nodeType !== Node.COMMENT_NODE);
    let targetEl = null;
    // Check for element type
    const hasOnlyTextAndBreaks = childNodes.every(node => node.nodeType === Node.TEXT_NODE ||
        (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'br'));
    if (childNodes.length === 0) {
        targetEl = el;
    }
    else if (childNodes.length === 1 && childNodes[0]?.nodeType === Node.TEXT_NODE) {
        targetEl = el;
    }
    else if (hasOnlyTextAndBreaks) {
        // Handle elements with text and <br> tags
        targetEl = el;
    }
    if (!targetEl) {
        console.warn('Start editing text failed. No target element found for selector:', domId);
        return null;
    }
    const originalContent = extractTextContent(el);
    prepareElementForEditing(targetEl);
    return { originalContent };
}
function editText(domId, content) {
    const el = (0, helpers_1.getHtmlElement)(domId);
    if (!el) {
        console.warn('Edit text failed. No element for selector:', domId);
        return null;
    }
    prepareElementForEditing(el);
    updateTextContent(el, content);
    return {
        domEl: (0, helpers_2.getDomElement)(el, true),
        newMap: (0, dom_1.buildLayerTree)(el),
    };
}
function stopEditingText(domId) {
    const el = (0, helpers_1.getHtmlElement)(domId);
    if (!el) {
        console.warn('Stop editing text failed. No element for selector:', domId);
        return null;
    }
    cleanUpElementAfterEditing(el);
    return { newContent: extractTextContent(el), domEl: (0, helpers_2.getDomElement)(el, true) };
}
function prepareElementForEditing(el) {
    el.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_EDITING_TEXT, 'true');
}
function cleanUpElementAfterEditing(el) {
    (0, helpers_2.restoreElementStyle)(el);
    removeEditingAttributes(el);
}
function removeEditingAttributes(el) {
    el.removeAttribute(constants_1.EditorAttributes.DATA_ONLOOK_EDITING_TEXT);
}
function updateTextContent(el, content) {
    // SECURITY INVARIANT: Only escaped text nodes and explicit <br> elements are allowed.
    // 1. Normalize line endings (CRLF/CR -> LF)
    // 2. Split on newlines to get text segments
    // 3. Build DOM with text nodes (auto-escaped) interleaved with <br> elements
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    el.innerHTML = '';
    lines.forEach((line, index) => {
        el.appendChild(document.createTextNode(line));
        if (index < lines.length - 1) {
            el.appendChild(document.createElement('br'));
        }
    });
}
function extractTextContent(el) {
    let content = el.innerHTML;
    content = content.replace(/<br\s*\/?>/gi, '\n');
    content = content.replace(/<[^>]*>/g, '');
    const textArea = document.createElement('textarea');
    textArea.innerHTML = content;
    return textArea.value;
}
function isChildTextEditable(oid) {
    return true;
}
//# sourceMappingURL=text.js.map