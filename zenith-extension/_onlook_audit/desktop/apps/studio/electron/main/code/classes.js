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
exports.getTemplateNodeClass = getTemplateNodeClass;
exports.getNodeClasses = getNodeClasses;
const t = __importStar(require("@babel/types"));
const _1 = require(".");
const helpers_1 = require("./helpers");
async function getTemplateNodeClass(templateNode) {
    const codeBlock = await (0, _1.readCodeBlock)(templateNode);
    if (codeBlock == null) {
        console.error(`Failed to read code block: ${templateNode.path}`);
        return { type: 'error', reason: 'Code block could not be read.' };
    }
    const ast = (0, helpers_1.parseJsxCodeBlock)(codeBlock);
    if (!ast) {
        return { type: 'error', reason: 'AST could not be parsed.' };
    }
    return getNodeClasses(ast);
}
function getNodeClasses(node) {
    const openingElement = node.openingElement;
    const classNameAttr = openingElement.attributes.find((attr) => t.isJSXAttribute(attr) && attr.name.name === 'className');
    if (!classNameAttr) {
        return {
            type: 'classes',
            value: [''],
        };
    }
    if (t.isStringLiteral(classNameAttr.value)) {
        return {
            type: 'classes',
            value: classNameAttr.value.value.split(/\s+/).filter(Boolean),
        };
    }
    if (t.isJSXExpressionContainer(classNameAttr.value) &&
        t.isStringLiteral(classNameAttr.value.expression)) {
        return {
            type: 'classes',
            value: classNameAttr.value.expression.value.split(/\s+/).filter(Boolean),
        };
    }
    if (t.isJSXExpressionContainer(classNameAttr.value) &&
        t.isTemplateLiteral(classNameAttr.value.expression)) {
        const templateLiteral = classNameAttr.value.expression;
        // Immediately return error if dynamic classes are detected within the template literal
        if (templateLiteral.expressions.length > 0) {
            return {
                type: 'error',
                reason: 'Dynamic classes detected.',
            };
        }
        // Extract and return static classes from the template literal if no dynamic classes are used
        const quasis = templateLiteral.quasis.map((quasi) => quasi.value.raw.split(/\s+/));
        return {
            type: 'classes',
            value: quasis.flat().filter(Boolean),
        };
    }
    return {
        type: 'error',
        reason: 'Unsupported className format.',
    };
}
//# sourceMappingURL=classes.js.map