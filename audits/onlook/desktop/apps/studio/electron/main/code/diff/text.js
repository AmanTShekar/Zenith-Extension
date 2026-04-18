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
exports.updateNodeTextContent = updateNodeTextContent;
exports.isChildTextEditable = isChildTextEditable;
const t = __importStar(require("@babel/types"));
const __1 = require("..");
const run_1 = __importDefault(require("../../run"));
const helpers_1 = require("../helpers");
function updateNodeTextContent(node, textContent) {
    const textNode = node.children.find((child) => t.isJSXText(child));
    if (textNode) {
        textNode.value = textContent;
    }
    else {
        node.children.unshift(t.jsxText(textContent));
    }
}
async function isChildTextEditable(oid) {
    const templateNode = run_1.default.getTemplateNode(oid);
    if (!templateNode) {
        console.error('Failed to get code block. No template node found.');
        return null;
    }
    const code = await (0, __1.readCodeBlock)(templateNode, false);
    if (!code) {
        console.error('Failed to get code block. No code found.');
        return null;
    }
    const jsxElement = await (0, helpers_1.parseJsxCodeBlock)(code);
    if (!jsxElement) {
        console.error('Failed to parse code block. No AST found.');
        return null;
    }
    // Check if element is an img tag
    if (jsxElement.openingElement.name.type === 'JSXIdentifier' &&
        jsxElement.openingElement.name?.name?.toLowerCase() === 'img') {
        return false;
    }
    const children = jsxElement.children;
    // If no children, element is empty and can be edited
    if (children.length === 0) {
        return true;
    }
    // Check if ALL children are JSX text nodes
    return children.every((child) => t.isJSXText(child));
}
//# sourceMappingURL=text.js.map