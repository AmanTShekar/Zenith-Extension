"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addClassToNode = addClassToNode;
exports.replaceNodeClasses = replaceNodeClasses;
exports.updateNodeProp = updateNodeProp;
const utility_1 = require("@onlook/utility");
const packages_1 = require("../packages");
function addClassToNode(node, className) {
    const openingElement = node.openingElement;
    const classNameAttr = openingElement.attributes.find((attr) => packages_1.t.isJSXAttribute(attr) && attr.name.name === 'className');
    if (classNameAttr) {
        if (packages_1.t.isStringLiteral(classNameAttr.value)) {
            classNameAttr.value.value = (0, utility_1.customTwMerge)(classNameAttr.value.value, className);
        }
        else if (packages_1.t.isJSXExpressionContainer(classNameAttr.value) &&
            packages_1.t.isCallExpression(classNameAttr.value.expression)) {
            classNameAttr.value.expression.arguments.push(packages_1.t.stringLiteral(className));
        }
    }
    else {
        insertAttribute(openingElement, 'className', className);
    }
}
function replaceNodeClasses(node, className) {
    const openingElement = node.openingElement;
    const classNameAttr = openingElement.attributes.find((attr) => packages_1.t.isJSXAttribute(attr) && attr.name.name === 'className');
    if (classNameAttr) {
        classNameAttr.value = packages_1.t.stringLiteral(className);
    }
    else {
        insertAttribute(openingElement, 'className', className);
    }
}
function insertAttribute(element, attribute, className) {
    const newClassNameAttr = packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier(attribute), packages_1.t.stringLiteral(className));
    element.attributes.push(newClassNameAttr);
}
function updateNodeProp(node, key, value) {
    const openingElement = node.openingElement;
    const existingAttr = openingElement.attributes.find((attr) => packages_1.t.isJSXAttribute(attr) && attr.name.name === key);
    if (value === undefined || value === null) {
        return;
    }
    if (existingAttr) {
        if (typeof value === 'boolean') {
            existingAttr.value = packages_1.t.jsxExpressionContainer(packages_1.t.booleanLiteral(value));
        }
        else if (typeof value === 'string') {
            existingAttr.value = packages_1.t.stringLiteral(value);
        }
        else if (typeof value === 'function') {
            existingAttr.value = packages_1.t.jsxExpressionContainer(packages_1.t.arrowFunctionExpression([], packages_1.t.blockStatement([])));
        }
        else {
            existingAttr.value = packages_1.t.jsxExpressionContainer(packages_1.t.identifier(value.toString()));
        }
    }
    else {
        let newAttr;
        if (typeof value === 'boolean') {
            newAttr = packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier(key), packages_1.t.jsxExpressionContainer(packages_1.t.booleanLiteral(value)));
        }
        else if (typeof value === 'string') {
            newAttr = packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier(key), packages_1.t.stringLiteral(value));
        }
        else if (typeof value === 'function') {
            newAttr = packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier(key), packages_1.t.jsxExpressionContainer(packages_1.t.arrowFunctionExpression([], packages_1.t.blockStatement([]))));
        }
        else {
            newAttr = packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier(key), packages_1.t.jsxExpressionContainer(packages_1.t.identifier(value.toString())));
        }
        openingElement.attributes.push(newAttr);
    }
}
//# sourceMappingURL=style.js.map