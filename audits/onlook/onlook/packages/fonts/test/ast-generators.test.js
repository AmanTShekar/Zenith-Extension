"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("@onlook/parser");
const ast_generators_1 = require("../src/helpers/ast-generators");
const test_utils_1 = require("./test-utils");
const bun_test_1 = require("bun:test");
const path_1 = __importDefault(require("path"));
const parser_2 = require("@onlook/parser");
const __dirname = import.meta.dir;
(0, bun_test_1.describe)('generateFontVariableExport', () => {
    (0, test_utils_1.runDataDrivenTests)({
        casesDir: path_1.default.resolve(__dirname, 'data/generate-font-variable-export'),
        inputFileName: 'config',
        expectedFileName: 'expected',
    }, async (font) => {
        const ast = (0, ast_generators_1.generateFontVariableExport)(font);
        return (0, parser_1.generate)(ast).code;
    }, (content) => {
        const config = JSON.parse(content);
        return config.font;
    });
});
(0, bun_test_1.describe)('createFontSrcObjects', () => {
    (0, test_utils_1.runDataDrivenTests)({
        casesDir: path_1.default.resolve(__dirname, 'data/create-font-src-objects'),
        inputFileName: 'config',
        expectedFileName: 'expected',
    }, async (config) => {
        const objects = (0, ast_generators_1.createFontSrcObjects)(config.sources);
        return (0, parser_1.generate)(parser_2.t.program([parser_2.t.expressionStatement(parser_2.t.arrayExpression(objects))])).code.trim();
    }, (content) => {
        const config = JSON.parse(content);
        return config;
    });
});
(0, bun_test_1.describe)('createLocalFontConfig', () => {
    (0, test_utils_1.runDataDrivenTests)({
        casesDir: path_1.default.resolve(__dirname, 'data/create-local-font-config'),
        inputFileName: 'config',
        expectedFileName: 'expected',
    }, async (config) => {
        // Create a minimal AST with just the program body
        const ast = parser_2.t.file(parser_2.t.program([]));
        // Create font source objects
        const fontSrcObjects = (0, ast_generators_1.createFontSrcObjects)(config.sources);
        // Create local font config
        const resultAst = (0, ast_generators_1.createLocalFontConfig)(ast, config.fontName, fontSrcObjects);
        return (0, parser_1.generate)(resultAst).code.trim();
    }, (content) => {
        const config = JSON.parse(content);
        return config;
    });
});
//# sourceMappingURL=ast-generators.test.js.map