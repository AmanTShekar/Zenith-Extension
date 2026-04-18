"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const read_file_1 = require("@onlook/ai/src/tools/classes/read-file");
const bun_test_1 = require("bun:test");
(0, bun_test_1.describe)('ReadFileTool', () => {
    (0, bun_test_1.test)('should format file content with line numbers', async () => {
        const mockFileSystem = {
            initialize: (0, bun_test_1.mock)(() => Promise.resolve()),
            readFile: (0, bun_test_1.mock)(() => Promise.resolve('line 1\nline 2\nline 3'))
        };
        const mockEditorEngine = {
            branches: {
                getBranchDataById: (0, bun_test_1.mock)(() => ({ codeEditor: mockFileSystem }))
            }
        };
        const tool = new read_file_1.ReadFileTool();
        const result = await tool.handle({
            branchId: 'test-branch',
            file_path: './test.txt'
        }, mockEditorEngine);
        (0, bun_test_1.expect)(result.content).toBe('1→line 1\n2→line 2\n3→line 3');
        (0, bun_test_1.expect)(result.lines).toBe(3);
    });
    (0, bun_test_1.test)('should handle partial reading with offset and limit', async () => {
        const mockFileSystem = {
            initialize: (0, bun_test_1.mock)(() => Promise.resolve()),
            readFile: (0, bun_test_1.mock)(() => Promise.resolve('line 1\nline 2\nline 3\nline 4\nline 5'))
        };
        const mockEditorEngine = {
            branches: {
                getBranchDataById: (0, bun_test_1.mock)(() => ({ codeEditor: mockFileSystem }))
            }
        };
        const tool = new read_file_1.ReadFileTool();
        const result = await tool.handle({
            branchId: 'test-branch',
            file_path: './test.txt',
            offset: 2,
            limit: 2
        }, mockEditorEngine);
        (0, bun_test_1.expect)(result.content).toBe('2→line 2\n3→line 3');
        (0, bun_test_1.expect)(result.lines).toBe(2);
    });
    (0, bun_test_1.test)('should truncate very large files', async () => {
        const largeContent = Array.from({ length: 3000 }, (_, i) => `line ${i + 1}`).join('\n');
        const mockFileSystem = {
            initialize: (0, bun_test_1.mock)(() => Promise.resolve()),
            readFile: (0, bun_test_1.mock)(() => Promise.resolve(largeContent))
        };
        const mockEditorEngine = {
            branches: {
                getBranchDataById: (0, bun_test_1.mock)(() => ({ codeEditor: mockFileSystem }))
            }
        };
        const tool = new read_file_1.ReadFileTool();
        const result = await tool.handle({
            branchId: 'test-branch',
            file_path: './large.txt'
        }, mockEditorEngine);
        (0, bun_test_1.expect)(result.lines).toBe(2000);
        (0, bun_test_1.expect)(result.content).toContain('... (truncated, showing first 2000 of 3000 lines)');
    });
    (0, bun_test_1.test)('should reject binary files', async () => {
        const mockFileSystem = {
            initialize: (0, bun_test_1.mock)(() => Promise.resolve()),
            readFile: (0, bun_test_1.mock)(() => Promise.resolve(new Uint8Array([1, 2, 3])))
        };
        const mockEditorEngine = {
            branches: {
                getBranchDataById: (0, bun_test_1.mock)(() => ({ codeEditor: mockFileSystem }))
            }
        };
        const tool = new read_file_1.ReadFileTool();
        await (0, bun_test_1.expect)(tool.handle({
            branchId: 'test-branch',
            file_path: './binary.bin'
        }, mockEditorEngine)).rejects.toThrow('file is not text');
    });
    (0, bun_test_1.test)('should handle missing file system', async () => {
        const mockEditorEngine = {
            branches: {
                getBranchDataById: (0, bun_test_1.mock)(() => null)
            }
        };
        const tool = new read_file_1.ReadFileTool();
        await (0, bun_test_1.expect)(tool.handle({
            branchId: 'invalid-branch',
            file_path: './test.txt'
        }, mockEditorEngine)).rejects.toThrow('file system not found');
    });
});
//# sourceMappingURL=read.test.js.map