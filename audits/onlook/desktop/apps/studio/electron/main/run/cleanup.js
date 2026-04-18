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
exports.removeIdsFromDirectory = removeIdsFromDirectory;
exports.removeIdsFromFile = removeIdsFromFile;
exports.getFileContentWithoutIds = getFileContentWithoutIds;
exports.removeIdsFromAst = removeIdsFromAst;
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const constants_1 = require("@onlook/models/constants");
const helpers_1 = require("../code/diff/helpers");
const files_1 = require("../code/files");
const helpers_2 = require("../code/helpers");
const helpers_3 = require("./helpers");
async function removeIdsFromDirectory(dirPath) {
    const filePaths = await (0, helpers_3.getValidFiles)(dirPath);
    for (const filePath of filePaths) {
        await removeIdsFromFile(filePath);
    }
}
async function removeIdsFromFile(filePath) {
    const content = await getFileContentWithoutIds(filePath);
    if (!content || content.trim() === '') {
        console.error(`Failed to remove ids from file: ${filePath}`);
        return;
    }
    await (0, files_1.writeFile)(filePath, content);
}
async function getFileContentWithoutIds(filePath) {
    const content = await (0, files_1.readFile)(filePath);
    if (content == null) {
        console.error(`Failed to read file: ${filePath}`);
        return null;
    }
    const ast = (0, helpers_2.parseJsxFile)(content);
    if (!ast) {
        console.error(`Failed to parse file: ${filePath}`);
        return content;
    }
    removeIdsFromAst(ast);
    const generated = (0, helpers_1.generateCode)(ast, helpers_3.GENERATE_CODE_OPTIONS, content);
    const formatted = await (0, files_1.formatContent)(filePath, generated);
    return formatted;
}
function removeIdsFromAst(ast) {
    (0, traverse_1.default)(ast, {
        JSXOpeningElement(path) {
            if ((0, helpers_3.isReactFragment)(path.node)) {
                return;
            }
            const attributes = path.node.attributes;
            const existingAttrIndex = attributes.findIndex((attr) => attr.name?.name === constants_1.EditorAttributes.DATA_ONLOOK_ID);
            if (existingAttrIndex !== -1) {
                attributes.splice(existingAttrIndex, 1);
            }
        },
        JSXAttribute(path) {
            if (path.node.name.name === 'key') {
                const value = path.node.value;
                if (t.isStringLiteral(value) &&
                    value.value.startsWith(constants_1.EditorAttributes.ONLOOK_MOVE_KEY_PREFIX)) {
                    return path.remove();
                }
            }
        },
    });
}
//# sourceMappingURL=cleanup.js.map