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
exports.getFileWithIds = getFileWithIds;
exports.createMappingFromContent = createMappingFromContent;
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const constants_1 = require("@onlook/models/constants");
const helpers_1 = require("../code/diff/helpers");
const files_1 = require("../code/files");
const helpers_2 = require("../code/helpers");
const helpers_3 = require("./helpers");
async function getFileWithIds(filePath) {
    const content = await (0, files_1.readFile)(filePath);
    if (content === null) {
        console.error(`Failed to read file: ${filePath}`);
        return null;
    }
    if (content === '') {
        console.error(`File is empty: ${filePath}`);
        return '';
    }
    const ast = (0, helpers_2.parseJsxFile)(content);
    if (!ast) {
        console.error(`Failed to parse file: ${filePath}`);
        return content;
    }
    addIdsToAst(ast);
    const generated = (0, helpers_1.generateCode)(ast, helpers_3.GENERATE_CODE_OPTIONS, content);
    const formatted = await (0, files_1.formatContent)(filePath, generated);
    return formatted;
}
function addIdsToAst(ast) {
    const ids = new Set();
    (0, traverse_1.default)(ast, {
        JSXOpeningElement(path) {
            if ((0, helpers_3.isReactFragment)(path.node)) {
                return;
            }
            const attributes = path.node.attributes;
            const existingAttrIndex = attributes.findIndex((attr) => attr.name?.name === constants_1.EditorAttributes.DATA_ONLOOK_ID);
            if (existingAttrIndex !== -1) {
                const existingId = attributes[existingAttrIndex].value.value;
                if (ids.has(existingId)) {
                    const newId = (0, helpers_3.generateId)();
                    attributes[existingAttrIndex].value.value = newId;
                    ids.add(newId);
                }
                else {
                    ids.add(existingId);
                }
                return;
            }
            const elementId = (0, helpers_3.generateId)();
            const oid = t.jSXAttribute(t.jSXIdentifier(constants_1.EditorAttributes.DATA_ONLOOK_ID), t.stringLiteral(elementId));
            attributes.push(oid);
            ids.add(elementId);
        },
    });
}
function createMappingFromContent(content, filename) {
    const ast = (0, helpers_2.parseJsxFile)(content);
    if (!ast) {
        return null;
    }
    return createMapping(ast, filename);
}
function createMapping(ast, filename) {
    const mapping = {};
    const componentStack = [];
    const dynamicTypeStack = [];
    (0, traverse_1.default)(ast, {
        FunctionDeclaration: {
            enter(path) {
                componentStack.push(path.node.id.name);
            },
            exit() {
                componentStack.pop();
            },
        },
        ClassDeclaration: {
            enter(path) {
                componentStack.push(path.node.id.name);
            },
            exit() {
                componentStack.pop();
            },
        },
        VariableDeclaration: {
            enter(path) {
                componentStack.push(path.node.declarations[0].id.name);
            },
            exit() {
                componentStack.pop();
            },
        },
        CallExpression: {
            enter(path) {
                if ((0, helpers_3.isNodeElementArray)(path.node)) {
                    dynamicTypeStack.push('array');
                }
            },
            exit(path) {
                if ((0, helpers_3.isNodeElementArray)(path.node)) {
                    dynamicTypeStack.pop();
                }
            },
        },
        ConditionalExpression: {
            enter() {
                dynamicTypeStack.push('conditional');
            },
            exit() {
                dynamicTypeStack.pop();
            },
        },
        LogicalExpression: {
            enter(path) {
                if (path.node.operator === '&&' || path.node.operator === '||') {
                    dynamicTypeStack.push('conditional');
                }
            },
            exit(path) {
                if (path.node.operator === '&&' || path.node.operator === '||') {
                    dynamicTypeStack.pop();
                }
            },
        },
        JSXElement(path) {
            if ((0, helpers_3.isReactFragment)(path.node.openingElement)) {
                return;
            }
            const attributes = path.node.openingElement.attributes;
            const idAttr = attributes.find((attr) => attr.name?.name === constants_1.EditorAttributes.DATA_ONLOOK_ID);
            if (idAttr) {
                const elementId = idAttr.value.value;
                const dynamicType = (0, helpers_3.getDynamicTypeInfo)(path);
                const coreElementType = (0, helpers_3.getCoreElementInfo)(path);
                mapping[elementId] = (0, helpers_3.getTemplateNode)(path, filename, componentStack, dynamicType, coreElementType);
            }
        },
    });
    return mapping;
}
//# sourceMappingURL=setup.js.map