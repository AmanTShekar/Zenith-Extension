"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsxFilter = void 0;
exports.getOidFromJsxElement = getOidFromJsxElement;
exports.addParamToElement = addParamToElement;
exports.addKeyToElement = addKeyToElement;
exports.generateCode = generateCode;
const non_secure_1 = require("nanoid/non-secure");
const constants_1 = require("@onlook/constants");
const packages_1 = require("../packages");
function getOidFromJsxElement(element) {
    const attribute = element.attributes.find((attr) => packages_1.t.isJSXAttribute(attr) && attr.name.name === constants_1.EditorAttributes.DATA_ONLOOK_ID);
    if (!attribute?.value) {
        return null;
    }
    if (packages_1.t.isStringLiteral(attribute.value)) {
        return attribute.value.value;
    }
    return null;
}
function addParamToElement(element, key, value, replace = false) {
    if (!packages_1.t.isJSXElement(element)) {
        console.error('addParamToElement: element is not a JSXElement', element);
        return;
    }
    const paramAttribute = packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier(key), packages_1.t.stringLiteral(value));
    const existingIndex = element.openingElement.attributes.findIndex((attr) => packages_1.t.isJSXAttribute(attr) && attr.name.name === key);
    if (existingIndex !== -1 && !replace) {
        return;
    }
    // Replace existing param or add new one
    if (existingIndex !== -1) {
        element.openingElement.attributes.splice(existingIndex, 1, paramAttribute);
    }
    else {
        element.openingElement.attributes.push(paramAttribute);
    }
}
function addKeyToElement(element, replace = false) {
    if (!packages_1.t.isJSXElement(element)) {
        console.error('addKeyToElement: element is not a JSXElement', element);
        return;
    }
    const keyIndex = element.openingElement.attributes.findIndex((attr) => packages_1.t.isJSXAttribute(attr) && attr.name.name === 'key');
    if (keyIndex !== -1 && !replace) {
        return;
    }
    const keyValue = constants_1.EditorAttributes.ONLOOK_MOVE_KEY_PREFIX + (0, non_secure_1.nanoid)(4);
    const keyAttribute = packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier('key'), packages_1.t.stringLiteral(keyValue));
    // Replace existing key or add new one
    if (keyIndex !== -1) {
        element.openingElement.attributes.splice(keyIndex, 1, keyAttribute);
    }
    else {
        element.openingElement.attributes.push(keyAttribute);
    }
}
const jsxFilter = (child) => packages_1.t.isJSXElement(child) || packages_1.t.isJSXFragment(child);
exports.jsxFilter = jsxFilter;
function generateCode(ast, options, codeBlock) {
    return (0, packages_1.generate)(ast, options, codeBlock).code;
}
//# sourceMappingURL=helpers.js.map