"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementFromDomId = elementFromDomId;
exports.selectorFromDomId = selectorFromDomId;
exports.getArrayString = getArrayString;
exports.escapeSelector = escapeSelector;
exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.isValidHtmlElement = isValidHtmlElement;
exports.isOnlookInDoc = isOnlookInDoc;
exports.assertNever = assertNever;
const constants_1 = require("@onlook/models/constants");
function elementFromDomId(domId) {
    return document.querySelector(`[${constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID}="${domId}"]`);
}
function selectorFromDomId(domId, escape = false) {
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
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
function assertNever(n) {
    throw new Error(`Expected \`never\`, found: ${JSON.stringify(n)}`);
}
//# sourceMappingURL=index.js.map