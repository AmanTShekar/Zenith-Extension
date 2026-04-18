"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const src_1 = require("src");
const __dirname = import.meta.dir;
(0, bun_test_1.describe)('injectPreloadScript', () => {
    const SHOULD_UPDATE_EXPECTED = true;
    const casesDir = path_1.default.resolve(__dirname, 'data/layout');
    const testCases = fs_1.default.readdirSync(casesDir);
    for (const testCase of testCases) {
        (0, bun_test_1.test)(`should handle case: ${testCase}`, async () => {
            const caseDir = path_1.default.resolve(casesDir, testCase);
            const files = fs_1.default.readdirSync(caseDir);
            const inputFile = files.find((f) => f.startsWith('input.'));
            const expectedFile = files.find((f) => f.startsWith('expected.'));
            if (!inputFile || !expectedFile) {
                throw new Error(`Test case ${testCase} is missing input or expected file.`);
            }
            const inputPath = path_1.default.resolve(caseDir, inputFile);
            const expectedPath = path_1.default.resolve(caseDir, expectedFile);
            const inputContent = await Bun.file(inputPath).text();
            const ast = (0, src_1.getAstFromContent)(inputContent);
            if (!ast)
                throw new Error('Failed to parse input code');
            const resultAst = (0, src_1.injectPreloadScript)(ast);
            const result = await (0, src_1.getContentFromAst)(resultAst, inputContent);
            if (SHOULD_UPDATE_EXPECTED) {
                await Bun.write(expectedPath, result);
            }
            const expectedContent = await Bun.file(expectedPath).text();
            (0, bun_test_1.expect)(result).toBe(expectedContent);
        });
    }
});
//# sourceMappingURL=layout.test.js.map