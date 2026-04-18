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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsxFilter = void 0;
exports.getOidFromJsxElement = getOidFromJsxElement;
exports.addParamToElement = addParamToElement;
exports.addKeyToElement = addKeyToElement;
exports.generateCode = generateCode;
const generator_1 = __importDefault(require("@babel/generator"));
const t = __importStar(require("@babel/types"));
const constants_1 = require("@onlook/models/constants");
const non_secure_1 = require("nanoid/non-secure");
function getOidFromJsxElement(element) {
    const attribute = element.attributes.find((attr) => t.isJSXAttribute(attr) && attr.name.name === constants_1.EditorAttributes.DATA_ONLOOK_ID);
    if (!attribute || !attribute.value) {
        return null;
    }
    if (t.isStringLiteral(attribute.value)) {
        return attribute.value.value;
    }
    return null;
}
function addParamToElement(element, key, value, replace = false) {
    if (!t.isJSXElement(element)) {
        console.error('addParamToElement: element is not a JSXElement', element);
        return;
    }
    const paramAttribute = t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(value));
    const existingIndex = element.openingElement.attributes.findIndex((attr) => t.isJSXAttribute(attr) && attr.name.name === key);
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
    if (!t.isJSXElement(element)) {
        console.error('addKeyToElement: element is not a JSXElement', element);
        return;
    }
    const keyIndex = element.openingElement.attributes.findIndex((attr) => t.isJSXAttribute(attr) && attr.name.name === 'key');
    if (keyIndex !== -1 && !replace) {
        return;
    }
    const keyValue = constants_1.EditorAttributes.ONLOOK_MOVE_KEY_PREFIX + (0, non_secure_1.nanoid)(4);
    const keyAttribute = t.jsxAttribute(t.jsxIdentifier('key'), t.stringLiteral(keyValue));
    // Replace existing key or add new one
    if (keyIndex !== -1) {
        element.openingElement.attributes.splice(keyIndex, 1, keyAttribute);
    }
    else {
        element.openingElement.attributes.push(keyAttribute);
    }
}
const jsxFilter = (child) => t.isJSXElement(child) || t.isJSXFragment(child);
exports.jsxFilter = jsxFilter;
function generateCode(ast, options, codeBlock) {
    return (0, generator_1.default)(ast, options, codeBlock).code;
}
//# sourceMappingURL=helpers.js.map