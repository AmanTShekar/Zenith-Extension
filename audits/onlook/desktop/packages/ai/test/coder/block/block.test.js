"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const path_1 = __importDefault(require("path"));
const block_1 = require("../../../src/coder/block");
const __dirname = import.meta.dir;
(0, bun_test_1.describe)('Extract Code Blocks', () => {
    const coder = new block_1.CodeBlockProcessor();
    (0, bun_test_1.test)('should extract multiple code blocks with metadata', async () => {
        const input = await Bun.file(path_1.default.resolve(__dirname, './data/multiple.txt')).text();
        const blocks = coder.extractCodeBlocks(input);
        (0, bun_test_1.expect)(blocks).toHaveLength(4);
        (0, bun_test_1.expect)(blocks[0]).toEqual({
            fileName: 'file1.ts',
            language: 'typescript',
            content: 'const x = 1;',
        });
        (0, bun_test_1.expect)(blocks[1]).toEqual({
            language: 'javascript',
            content: 'const y = 2;',
        });
        (0, bun_test_1.expect)(blocks[2]).toEqual({
            fileName: 'src/file2.tsx',
            content: 'const z = 3;',
        });
        (0, bun_test_1.expect)(blocks[3]).toEqual({
            content: 'const z = 4;',
        });
    });
    (0, bun_test_1.test)('should handle empty input for code blocks', () => {
        const blocks = coder.extractCodeBlocks('');
        (0, bun_test_1.expect)(blocks).toHaveLength(0);
    });
});
//# sourceMappingURL=block.test.js.map