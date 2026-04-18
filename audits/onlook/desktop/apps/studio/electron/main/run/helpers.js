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
exports.generateId = exports.GENERATE_CODE_OPTIONS = exports.IGNORED_DIRECTORIES = exports.ALLOWED_EXTENSIONS = void 0;
exports.getValidFiles = getValidFiles;
exports.isReactFragment = isReactFragment;
exports.getTemplateNode = getTemplateNode;
exports.isNodeElementArray = isNodeElementArray;
exports.getDynamicTypeInfo = getDynamicTypeInfo;
exports.getCoreElementInfo = getCoreElementInfo;
exports.isPortAvailable = isPortAvailable;
const t = __importStar(require("@babel/types"));
const constants_1 = require("@onlook/models/constants");
const detect_port_1 = require("detect-port");
const fs = __importStar(require("fs"));
const non_secure_1 = require("nanoid/non-secure");
const nodePath = __importStar(require("path"));
const ids_1 = require("/common/helpers/ids");
exports.ALLOWED_EXTENSIONS = ['.jsx', '.tsx'];
exports.IGNORED_DIRECTORIES = [
    'node_modules',
    'dist',
    'build',
    '.next',
    '.git',
    constants_1.CUSTOM_OUTPUT_DIR,
];
exports.GENERATE_CODE_OPTIONS = {
    compact: false, // Keep normal spacing
    retainLines: true, // Retain original line numbers
    jsescOption: {
        minimal: true, // Nice string escaping
    },
    jsonCompatibleStrings: true, // Readable string literals
};
exports.generateId = (0, non_secure_1.customAlphabet)(ids_1.VALID_DATA_ATTR_CHARS, 7);
async function getValidFiles(dirPath) {
    const validFiles = [];
    function scanDirectory(currentPath) {
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
            const filepath = nodePath.join(currentPath, file);
            const stat = fs.statSync(filepath);
            if (stat.isDirectory()) {
                if (!exports.IGNORED_DIRECTORIES.includes(file)) {
                    scanDirectory(filepath);
                }
            }
            else {
                const fileExt = nodePath.extname(file);
                if (exports.ALLOWED_EXTENSIONS.includes(fileExt)) {
                    validFiles.push(filepath);
                }
            }
        }
    }
    scanDirectory(dirPath);
    return validFiles;
}
function isReactFragment(openingElement) {
    const name = openingElement.name;
    if (t.isJSXIdentifier(name)) {
        return name.name === 'Fragment';
    }
    if (t.isJSXMemberExpression(name)) {
        return (t.isJSXIdentifier(name.object) &&
            name.object.name === 'React' &&
            t.isJSXIdentifier(name.property) &&
            name.property.name === 'Fragment');
    }
    return false;
}
function getTemplateNode(path, filename, componentStack, dynamicType, coreElementType) {
    const startTag = getTemplateTag(path.node.openingElement);
    const endTag = path.node.closingElement
        ? getTemplateTag(path.node.closingElement)
        : null;
    const component = componentStack.length > 0 ? componentStack[componentStack.length - 1] : null;
    const domNode = {
        path: filename,
        startTag,
        endTag,
        component,
        dynamicType,
        coreElementType,
    };
    return domNode;
}
function getTemplateTag(element) {
    return {
        start: {
            line: element.loc.start.line,
            column: element.loc.start.column + 1,
        },
        end: {
            line: element.loc.end.line,
            column: element.loc.end.column,
        },
    };
}
function isNodeElementArray(node) {
    return (t.isMemberExpression(node.callee) &&
        t.isIdentifier(node.callee.property) &&
        node.callee.property.name === 'map');
}
function getDynamicTypeInfo(path) {
    const parent = path.parent;
    const grandParent = path.parentPath?.parent;
    // Check for conditional root element
    const isConditionalRoot = (t.isConditionalExpression(parent) || t.isLogicalExpression(parent)) &&
        t.isJSXExpressionContainer(grandParent);
    // Check for array map root element
    const isArrayMapRoot = t.isArrowFunctionExpression(parent) ||
        (t.isJSXFragment(parent) && path.parentPath?.parentPath?.isArrowFunctionExpression());
    const dynamicType = isConditionalRoot ? 'conditional' : isArrayMapRoot ? 'array' : undefined;
    return dynamicType;
}
function getCoreElementInfo(path) {
    const parent = path.parent;
    const isComponentRoot = t.isReturnStatement(parent) || t.isArrowFunctionExpression(parent);
    const isBodyTag = t.isJSXIdentifier(path.node.openingElement.name) &&
        path.node.openingElement.name.name.toLocaleLowerCase() === 'body';
    const coreElementType = isComponentRoot ? 'component-root' : isBodyTag ? 'body-tag' : undefined;
    return coreElementType;
}
async function isPortAvailable(port) {
    try {
        const availablePort = await (0, detect_port_1.detect)(port);
        return {
            isPortAvailable: port === availablePort,
            availablePort: availablePort,
        };
    }
    catch (error) {
        console.error('Error detecting port:', error);
        return {
            isPortAvailable: false,
            availablePort: 3000,
        };
    }
}
//# sourceMappingURL=helpers.js.map