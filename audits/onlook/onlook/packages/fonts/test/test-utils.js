"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDataDrivenTests = runDataDrivenTests;
const bun_test_1 = require("bun:test");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Runs data-driven tests for a given test cases directory.
 * Each test case folder should contain input files and expected output files.
 *
 * @param config - Test configuration including directory and file names
 * @param processor - Function that processes input and returns result string
 * @param inputParser - Optional function to parse input file content (defaults to reading as text)
 */
function runDataDrivenTests(config, processor, inputParser) {
    const { casesDir, inputFileName = 'input', expectedFileName = 'expected' } = config;
    // Check if test cases directory exists
    if (!fs_1.default.existsSync(casesDir)) {
        bun_test_1.test.skip('Test cases directory does not exist yet', () => { });
        return;
    }
    const testCases = fs_1.default.readdirSync(casesDir);
    for (const testCase of testCases) {
        (0, bun_test_1.test)(`should handle case: ${testCase}`, async () => {
            const caseDir = path_1.default.resolve(casesDir, testCase);
            const files = fs_1.default.readdirSync(caseDir);
            // Find input file (could be input.tsx, config.json, etc.)
            const inputFile = files.find((f) => {
                const nameWithoutExt = f.split('.')[0];
                return nameWithoutExt === inputFileName;
            });
            // Find expected file (usually expected.tsx)
            const expectedFile = files.find((f) => {
                const nameWithoutExt = f.split('.')[0];
                return nameWithoutExt === expectedFileName;
            });
            if (!inputFile || !expectedFile) {
                throw new Error(`Test case ${testCase} is missing ${inputFileName} or ${expectedFileName} file.`);
            }
            const inputPath = path_1.default.resolve(caseDir, inputFile);
            const expectedPath = path_1.default.resolve(caseDir, expectedFile);
            // Read and parse input
            const inputContent = await Bun.file(inputPath).text();
            const parsedInput = inputParser
                ? await inputParser(inputContent, inputPath)
                : inputContent;
            // Process input through the provided processor
            const result = await processor(parsedInput, inputPath);
            // Compare with expected output
            const expectedContent = await Bun.file(expectedPath).text();
            (0, bun_test_1.expect)(result.trim()).toBe(expectedContent.trim());
        });
    }
}
//# sourceMappingURL=test-utils.js.map