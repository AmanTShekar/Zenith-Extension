"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHtmlElement = getHtmlElement;
exports.getDomIdSelector = getDomIdSelector;
exports.getArrayString = getArrayString;
exports.escapeSelector = escapeSelector;
exports.isValidHtmlElement = isValidHtmlElement;
exports.isOnlookInDoc = isOnlookInDoc;
const constants_1 = require("@onlook/constants");
function getHtmlElement(domId) {
    return document.querySelector(`[${constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID}="${domId}"]`);
}
function getDomIdSelector(domId, escape = false) {
    const selector = `[${constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID}="${domId}"]`;
    if (!escape) {
        return selector;
    }
    return escapeSelector(selector);
}
function getArrayString(items) {
    return `[${items.map((item) => `'${item}'`).join(',')}]`;
}
function escapeSelector(selector) {
    return CSS.escape(selector);
}
function isValidHtmlElement(element) {
    return (element &&
        element instanceof Node &&
        element.nodeType === Node.ELEMENT_NODE &&
        !constants_1.DOM_IGNORE_TAGS.includes(element.tagName) &&
        !element.hasAttribute(constants_1.EditorAttributes.DATA_ONLOOK_IGNORE) &&
        element.style.display !== 'none');
}
function isOnlookInDoc(doc) {
    const attributeExists = doc.evaluate(`//*[@${constants_1.EditorAttributes.DATA_ONLOOK_ID}]`, doc, null, XPathResult.BOOLEAN_TYPE, null).booleanValue;
    return attributeExists;
}
//# sourceMappingURL=dom.js.map