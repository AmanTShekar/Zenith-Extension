"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsxFile = parseJsxFile;
exports.parseJsxCodeBlock = parseJsxCodeBlock;
const parser_1 = require("@babel/parser");
const types_1 = __importDefault(require("@babel/types"));
const cleanup_1 = require("../run/cleanup");
function parseJsxFile(code) {
    try {
        return (0, parser_1.parse)(code, {
            plugins: ['typescript', 'jsx'],
            sourceType: 'module',
            allowImportExportEverywhere: true,
        });
    }
    catch (e) {
        console.error('Error parsing code', e);
        return;
    }
}
function parseJsxCodeBlock(code, stripIds = false) {
    const ast = parseJsxFile(code);
    if (!ast) {
        return;
    }
    if (stripIds) {
        (0, cleanup_1.removeIdsFromAst)(ast);
    }
    const jsxElement = ast.program.body.find((node) => types_1.default.isExpressionStatement(node) && types_1.default.isJSXElement(node.expression));
    if (jsxElement &&
        types_1.default.isExpressionStatement(jsxElement) &&
        types_1.default.isJSXElement(jsxElement.expression)) {
        return jsxElement.expression;
    }
}
//# sourceMappingURL=helpers.js.map