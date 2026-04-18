"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const parser_1 = require("@onlook/parser");
const ast_manipulators_1 = require("../src/helpers/ast-manipulators");
const validators_1 = require("../src/helpers/validators");
const test_utils_1 = require("./test-utils");
const path_1 = __importDefault(require("path"));
const ast_generators_1 = require("../src/helpers/ast-generators");
const __dirname = import.meta.dir;
function makeDataDrivenTest(testName, processor, casesDir, parseInput) {
    (0, bun_test_1.describe)(testName, () => {
        (0, test_utils_1.runDataDrivenTests)({
            casesDir,
            inputFileName: 'config',
            expectedFileName: 'expected',
        }, processor, async (content, filePath) => {
            const config = JSON.parse(content);
            const testCaseDir = path_1.default.dirname(filePath || '');
            const inputPath = path_1.default.resolve(testCaseDir, 'input.tsx');
            try {
                const inputContent = await Bun.file(inputPath).text();
                return parseInput(config, inputContent);
            }
            catch (error) {
                const testCaseName = path_1.default.basename(testCaseDir);
                throw new Error(`Failed to read input.tsx for test case ${testCaseName}: ${error}`);
            }
        });
    });
}
makeDataDrivenTest('removeFontDeclaration', async (input) => {
    const result = (0, ast_manipulators_1.removeFontDeclaration)(input.font, input.content);
    return (0, parser_1.generate)(result.ast).code;
}, path_1.default.resolve(__dirname, 'data/ast-manipulators/remove-font-declaration'), (config, inputContent) => ({ font: config.font, content: inputContent }));
makeDataDrivenTest('addFontToTailwindTheme', async (input) => {
    return (0, ast_manipulators_1.addFontToTailwindTheme)(input.font, input.content);
}, path_1.default.resolve(__dirname, 'data/ast-manipulators/add-font-to-tailwind-theme'), (config, inputContent) => ({ font: config.font, content: inputContent }));
makeDataDrivenTest('removeFontFromTailwindTheme', async (input) => {
    return (0, ast_manipulators_1.removeFontFromTailwindTheme)(input.fontId, input.content);
}, path_1.default.resolve(__dirname, 'data/ast-manipulators/remove-font-from-tailwind-theme'), (config, inputContent) => ({ fontId: config.fontId, content: inputContent }));
makeDataDrivenTest('addGoogleFontSpecifier', async (input) => {
    const ast = (0, parser_1.parse)(input.content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
    });
    (0, ast_manipulators_1.addGoogleFontSpecifier)(ast, input.importName);
    return (0, parser_1.generate)(ast).code;
}, path_1.default.resolve(__dirname, 'data/ast-manipulators/add-google-font-specifier'), (config, inputContent) => ({ importName: config.importName, content: inputContent }));
makeDataDrivenTest('mergeLocalFontSources', async (input) => {
    const ast = (0, parser_1.parse)(input.content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
    });
    const { existingFontNode } = (0, validators_1.findFontExportDeclaration)(ast, input.fontName);
    if (!existingFontNode) {
        throw new Error(`Font export declaration for "${input.fontName}" not found`);
    }
    const fontsSrc = (0, ast_generators_1.createFontSrcObjects)(input.newSources);
    (0, ast_manipulators_1.mergeLocalFontSources)(ast, existingFontNode, input.fontName, fontsSrc);
    return (0, parser_1.generate)(ast).code;
}, path_1.default.resolve(__dirname, 'data/ast-manipulators/merge-local-font-sources'), (config, inputContent) => ({
    fontName: config.fontName,
    newSources: config.newSources,
    content: inputContent,
}));
//# sourceMappingURL=ast-manipulators.test.js.map