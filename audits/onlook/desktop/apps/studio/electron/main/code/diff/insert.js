"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertElementToNode = insertElementToNode;
exports.createInsertedElement = createInsertedElement;
exports.insertAtIndex = insertAtIndex;
const t = __importStar(require("@babel/types"));
const constants_1 = require("@onlook/models/constants");
const helpers_1 = require("../helpers");
const helpers_2 = require("./helpers");
const helpers_3 = require("/common/helpers");
function insertElementToNode(path, element) {
    const newElement = createInsertedElement(element);
    switch (element.location.type) {
        case 'append':
            path.node.children.push(newElement);
            break;
        case 'prepend':
            path.node.children.unshift(newElement);
            break;
        case 'index':
            insertAtIndex(path, newElement, element.location.index);
            break;
        default:
            console.error(`Unhandled position: ${element.location}`);
            path.node.children.push(newElement);
            (0, helpers_3.assertNever)(element.location);
    }
    path.stop();
}
function createInsertedElement(insertedChild) {
    let element;
    if (insertedChild.codeBlock) {
        element =
            (0, helpers_1.parseJsxCodeBlock)(insertedChild.codeBlock, true) || createJSXElement(insertedChild);
        (0, helpers_2.addParamToElement)(element, constants_1.EditorAttributes.DATA_ONLOOK_ID, insertedChild.oid);
    }
    else {
        element = createJSXElement(insertedChild);
    }
    if (insertedChild.pasteParams) {
        addPasteParamsToElement(element, insertedChild.pasteParams);
    }
    (0, helpers_2.addKeyToElement)(element);
    return element;
}
function addPasteParamsToElement(element, pasteParams) {
    (0, helpers_2.addParamToElement)(element, constants_1.EditorAttributes.DATA_ONLOOK_ID, pasteParams.oid);
}
function createJSXElement(insertedChild) {
    const attributes = Object.entries(insertedChild.attributes || {}).map(([key, value]) => t.jsxAttribute(t.jsxIdentifier(key), typeof value === 'string'
        ? t.stringLiteral(value)
        : t.jsxExpressionContainer(t.stringLiteral(JSON.stringify(value)))));
    const isSelfClosing = ['img', 'input', 'br', 'hr', 'meta', 'link'].includes(insertedChild.tagName.toLowerCase());
    const openingElement = t.jsxOpeningElement(t.jsxIdentifier(insertedChild.tagName), attributes, isSelfClosing);
    let closingElement = null;
    if (!isSelfClosing) {
        closingElement = t.jsxClosingElement(t.jsxIdentifier(insertedChild.tagName));
    }
    const children = [];
    // Add textContent as the first child if it exists
    if (insertedChild.textContent) {
        children.push(t.jsxText(insertedChild.textContent));
    }
    // Add other children after the textContent
    children.push(...(insertedChild.children || []).map(createJSXElement));
    return t.jsxElement(openingElement, closingElement, children, isSelfClosing);
}
function insertAtIndex(path, newElement, index) {
    if (index !== -1) {
        const jsxElements = path.node.children.filter(helpers_2.jsxFilter);
        const targetIndex = Math.min(index, jsxElements.length);
        if (targetIndex === path.node.children.length) {
            path.node.children.push(newElement);
        }
        else {
            const targetChild = jsxElements[targetIndex];
            const targetChildIndex = path.node.children.indexOf(targetChild);
            path.node.children.splice(targetChildIndex, 0, newElement);
        }
    }
    else {
        console.error('Invalid index:', index);
        path.node.children.push(newElement);
    }
}
//# sourceMappingURL=insert.js.map