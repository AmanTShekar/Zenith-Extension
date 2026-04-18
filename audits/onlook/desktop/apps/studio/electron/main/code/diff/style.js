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
exports.addClassToNode = addClassToNode;
exports.replaceNodeClasses = replaceNodeClasses;
exports.updateNodeProp = updateNodeProp;
const t = __importStar(require("@babel/types"));
const tailwind_merge_1 = require("tailwind-merge");
function addClassToNode(node, className) {
    const openingElement = node.openingElement;
    const classNameAttr = openingElement.attributes.find((attr) => t.isJSXAttribute(attr) && attr.name.name === 'className');
    if (classNameAttr) {
        if (t.isStringLiteral(classNameAttr.value)) {
            classNameAttr.value.value = (0, tailwind_merge_1.twMerge)(classNameAttr.value.value, className);
        }
        else if (t.isJSXExpressionContainer(classNameAttr.value) &&
            t.isCallExpression(classNameAttr.value.expression)) {
            classNameAttr.value.expression.arguments.push(t.stringLiteral(className));
        }
    }
    else {
        insertAttribute(openingElement, 'className', className);
    }
}
function replaceNodeClasses(node, className) {
    const openingElement = node.openingElement;
    const classNameAttr = openingElement.attributes.find((attr) => t.isJSXAttribute(attr) && attr.name.name === 'className');
    if (classNameAttr) {
        classNameAttr.value = t.stringLiteral(className);
    }
    else {
        insertAttribute(openingElement, 'className', className);
    }
}
function insertAttribute(element, attribute, className) {
    const newClassNameAttr = t.jsxAttribute(t.jsxIdentifier(attribute), t.stringLiteral(className));
    element.attributes.push(newClassNameAttr);
}
function updateNodeProp(node, key, value) {
    const openingElement = node.openingElement;
    const existingAttr = openingElement.attributes.find((attr) => t.isJSXAttribute(attr) && attr.name.name === key);
    if (existingAttr) {
        if (typeof value === 'boolean') {
            existingAttr.value = t.jsxExpressionContainer(t.booleanLiteral(value));
        }
        else if (typeof value === 'string') {
            existingAttr.value = t.stringLiteral(value);
        }
        else if (typeof value === 'function') {
            existingAttr.value = t.jsxExpressionContainer(t.arrowFunctionExpression([], t.blockStatement([])));
        }
        else {
            existingAttr.value = t.jsxExpressionContainer(t.identifier(value.toString()));
        }
    }
    else {
        let newAttr;
        if (typeof value === 'boolean') {
            newAttr = t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(t.booleanLiteral(value)));
        }
        else if (typeof value === 'string') {
            newAttr = t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(value));
        }
        else if (typeof value === 'function') {
            newAttr = t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(t.arrowFunctionExpression([], t.blockStatement([]))));
        }
        else {
            newAttr = t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(t.identifier(value.toString())));
        }
        openingElement.attributes.push(newAttr);
    }
}
//# sourceMappingURL=style.js.map