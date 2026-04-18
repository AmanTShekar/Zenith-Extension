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
exports.getTemplateNodeProps = getTemplateNodeProps;
const t = __importStar(require("@babel/types"));
const element_1 = require("@onlook/models/element");
const _1 = require(".");
const helpers_1 = require("./helpers");
async function getTemplateNodeProps(templateNode) {
    const codeBlock = await (0, _1.readCodeBlock)(templateNode);
    if (codeBlock == null) {
        console.error(`Failed to read code block: ${templateNode.path}`);
        return { type: 'error', reason: 'Code block could not be read.' };
    }
    const ast = (0, helpers_1.parseJsxCodeBlock)(codeBlock);
    if (!ast) {
        return { type: 'error', reason: 'AST could not be parsed.' };
    }
    return getNodeAttributes(ast);
}
function getNodeAttributes(node) {
    try {
        const openingElement = node.openingElement;
        const props = [];
        openingElement.attributes.forEach((attr) => {
            if (!t.isJSXAttribute(attr) ||
                attr.name.name === 'className' ||
                attr.name.name === 'data-oid') {
                return;
            }
            const attrName = attr.name.name;
            let attrValue = true;
            let attrType = element_1.PropsType.Code;
            if (attr.value) {
                if (t.isStringLiteral(attr.value)) {
                    attrValue = attr.value.value;
                    attrType = element_1.PropsType.String;
                }
                else if (t.isJSXExpressionContainer(attr.value)) {
                    const expr = attr.value.expression;
                    if (t.isBooleanLiteral(expr)) {
                        attrValue = expr.value;
                        attrType = element_1.PropsType.Boolean;
                    }
                    else if (t.isStringLiteral(expr)) {
                        attrValue = expr.value;
                        attrType = element_1.PropsType.String;
                    }
                    else if (t.isNumericLiteral(expr)) {
                        attrValue = expr.value;
                        attrType = element_1.PropsType.Number;
                    }
                    else {
                        attrValue = `{${expr.type}}`;
                        attrType = element_1.PropsType.Code;
                    }
                }
                else {
                    attrValue = `Unsupported type: ${attr.value.type}`;
                    attrType = element_1.PropsType.Code;
                }
            }
            else {
                attrType = element_1.PropsType.Boolean;
            }
            props.push({ key: attrName, value: attrValue, type: attrType });
        });
        return {
            type: 'props',
            props,
        };
    }
    catch (error) {
        console.error('Failed to parse component props:', error);
        return {
            type: 'error',
            reason: 'Failed to parse component props.',
        };
    }
}
//# sourceMappingURL=props.js.map