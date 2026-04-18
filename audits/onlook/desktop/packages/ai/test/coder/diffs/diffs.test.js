"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const path_1 = __importDefault(require("path"));
const block_1 = require("../../../src/coder/block");
const __dirname = import.meta.dir;
(0, bun_test_1.describe)('Parse and Apply Code Block Diffs', () => {
    const coder = new block_1.CodeBlockProcessor();
    (0, bun_test_1.test)('should parse diff correctly', async () => {
        const diffText = await Bun.file(path_1.default.resolve(__dirname, './data/single/diff.txt')).text();
        const res = block_1.CodeBlockProcessor.parseDiff(diffText);
        if (!res) {
            throw new Error('Invalid diff format');
        }
        (0, bun_test_1.expect)(res).toHaveLength(1);
        (0, bun_test_1.expect)(res[0].search).toContain('FOO');
        (0, bun_test_1.expect)(res[0].replace).toContain('BAR');
    });
    (0, bun_test_1.test)('should apply single diff correctly', async () => {
        const diffText = await Bun.file(path_1.default.resolve(__dirname, './data/single/diff.txt')).text();
        const beforeText = await Bun.file(path_1.default.resolve(__dirname, './data/single/before.txt')).text();
        const afterText = await Bun.file(path_1.default.resolve(__dirname, './data/single/after.txt')).text();
        const result = await coder.applyDiff(beforeText, diffText);
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(result.text.trim()).toBe(afterText.trim());
        (0, bun_test_1.expect)(result.failures).toBeUndefined();
    });
    (0, bun_test_1.test)('should handle failed replacements', async () => {
        const diffText = coder.createDiff('non-existent-text', 'replacement');
        const originalText = 'some sample text';
        const result = await coder.applyDiff(originalText, diffText);
        (0, bun_test_1.expect)(result.success).toBe(false);
        (0, bun_test_1.expect)(result.text).toBe(originalText);
        (0, bun_test_1.expect)(result.failures).toHaveLength(1);
        (0, bun_test_1.expect)(result.failures[0]).toEqual({
            search: 'non-existent-text',
            error: 'No changes made',
        });
    });
    (0, bun_test_1.test)('should fail when any replacement fails in multiple diffs', async () => {
        const diffText = coder.createDiff('sample', 'example') +
            '\n' +
            coder.createDiff('non-existent', 'replacement');
        const originalText = 'some sample text';
        const result = await coder.applyDiff(originalText, diffText);
        (0, bun_test_1.expect)(result.success).toBe(false);
        (0, bun_test_1.expect)(result.text).toBe('some example text');
        (0, bun_test_1.expect)(result.failures).toHaveLength(1);
        (0, bun_test_1.expect)(result.failures[0]).toEqual({
            search: 'non-existent',
            error: 'No changes made',
        });
    });
    (0, bun_test_1.test)('should create diff correctly', () => {
        const searchContent = 'old content';
        const replaceContent = 'new content';
        const diff = coder.createDiff(searchContent, replaceContent);
        const parsed = block_1.CodeBlockProcessor.parseDiff(diff);
        (0, bun_test_1.expect)(parsed).toHaveLength(1);
        (0, bun_test_1.expect)(parsed[0].search).toBe(searchContent);
        (0, bun_test_1.expect)(parsed[0].replace).toBe(replaceContent);
    });
});
//# sourceMappingURL=diffs.test.js.map