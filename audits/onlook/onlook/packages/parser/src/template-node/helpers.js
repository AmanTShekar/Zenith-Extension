"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTemplateNode = createTemplateNode;
exports.getNodeClasses = getNodeClasses;
const packages_1 = require("../packages");
function createTemplateNode(path, branchId, filename, componentStack, dynamicType, coreElementType) {
    const startTag = getTemplateTag(path.node.openingElement);
    const endTag = path.node.closingElement
        ? getTemplateTag(path.node.closingElement)
        : null;
    const component = componentStack.length > 0 ? componentStack[componentStack.length - 1] : null;
    const domNode = {
        path: filename,
        branchId,
        startTag,
        endTag,
        component: component ?? null,
        dynamicType,
        coreElementType,
    };
    return domNode;
}
function getTemplateTag(element) {
    return {
        start: {
            line: element.loc?.start?.line ?? 0,
            column: element.loc?.start?.column ?? 0 + 1,
        },
        end: {
            line: element.loc?.end?.line ?? 0,
            column: element.loc?.end?.column ?? 0,
        },
    };
}
function getNodeClasses(node) {
    const openingElement = node.openingElement;
    const classNameAttr = openingElement.attributes.find((attr) => packages_1.t.isJSXAttribute(attr) && attr.name.name === 'className');
    if (!classNameAttr) {
        return {
            type: 'classes',
            value: [''],
        };
    }
    if (packages_1.t.isStringLiteral(classNameAttr.value)) {
        return {
            type: 'classes',
            value: classNameAttr.value.value.split(/\s+/).filter(Boolean),
        };
    }
    if (packages_1.t.isJSXExpressionContainer(classNameAttr.value) &&
        packages_1.t.isStringLiteral(classNameAttr.value.expression)) {
        return {
            type: 'classes',
            value: classNameAttr.value.expression.value.split(/\s+/).filter(Boolean),
        };
    }
    if (packages_1.t.isJSXExpressionContainer(classNameAttr.value) &&
        packages_1.t.isTemplateLiteral(classNameAttr.value.expression)) {
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
//# sourceMappingURL=helpers.js.map