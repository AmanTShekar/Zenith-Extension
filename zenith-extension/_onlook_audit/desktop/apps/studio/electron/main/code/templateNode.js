"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplateNodeChild = getTemplateNodeChild;
exports.getTemplateNode = getTemplateNode;
const traverse_1 = __importDefault(require("@babel/traverse"));
const constants_1 = require("@onlook/models/constants");
const _1 = require(".");
const helpers_1 = require("./helpers");
async function getTemplateNodeChild(parent, child, index) {
    const codeBlock = await (0, _1.readCodeBlock)(parent);
    if (codeBlock == null) {
        console.error(`Failed to read code block: ${parent.path}`);
        return null;
    }
    const ast = (0, helpers_1.parseJsxFile)(codeBlock);
    let currentIndex = 0;
    if (!ast) {
        return null;
    }
    let res = null;
    (0, traverse_1.default)(ast, {
        JSXElement(path) {
            if (!path) {
                return;
            }
            const node = path.node;
            const childName = node.openingElement.name.name;
            if (childName === child.component) {
                const instanceId = getOidFromNode(node);
                if (instanceId) {
                    res = { instanceId, component: child.component };
                }
                if (currentIndex === index || index === -1) {
                    path.stop();
                }
                currentIndex++;
            }
        },
    });
    return res;
}
function getOidFromNode(node) {
    const attr = node.openingElement.attributes.find((attr) => 'name' in attr &&
        'name' in attr.name &&
        attr.name.name === constants_1.EditorAttributes.DATA_ONLOOK_ID);
    if (!attr) {
        return null;
    }
    if (attr.value?.type === 'StringLiteral') {
        return attr.value.value;
    }
    return null;
}
function getTemplateNode(node, path, lineOffset) {
    if (!node.openingElement.loc) {
        throw new Error('No location found for opening element');
    }
    const name = node.openingElement.name.name;
    const startTag = getTemplateTag(node.openingElement, lineOffset);
    const endTag = node.closingElement
        ? getTemplateTag(node.closingElement, lineOffset)
        : null;
    const template = {
        path,
        startTag,
        endTag,
        component: name,
    };
    return template;
}
function getTemplateTag(element, lineOffset) {
    if (!element.loc) {
        throw new Error('No location found for element');
    }
    return {
        start: {
            line: element.loc.start.line + lineOffset - 1,
            column: element.loc.start.column + 1,
        },
        end: {
            line: element.loc.end.line + lineOffset - 1,
            column: element.loc.end.column,
        },
    };
}
//# sourceMappingURL=templateNode.js.map