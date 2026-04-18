"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_replace_edit_1 = require("@onlook/ai/src/tools/classes/search-replace-edit");
const search_replace_multi_edit_1 = require("@onlook/ai/src/tools/classes/search-replace-multi-edit");
const bun_test_1 = require("bun:test");
(0, bun_test_1.describe)('SearchReplaceEditTool', () => {
    (0, bun_test_1.test)('should replace single occurrence', async () => {
        let writtenContent = '';
        const mockFileSystem = {
            initialize: (0, bun_test_1.mock)(() => Promise.resolve()),
            readFile: (0, bun_test_1.mock)(() => Promise.resolve('Hello world, this is a test')),
            writeFile: (0, bun_test_1.mock)((path, content) => {
                writtenContent = content;
                return Promise.resolve(true);
            })
        };
        const mockEditorEngine = {
            branches: {
                getBranchDataById: (0, bun_test_1.mock)(() => ({ codeEditor: mockFileSystem }))
            }
        };
        const tool = new search_replace_edit_1.SearchReplaceEditTool();
        const result = await tool.handle({
            branchId: 'test-branch',
            file_path: '/test/file.ts',
            old_string: 'Hello',
            new_string: 'Hi',
            replace_all: false,
        }, mockEditorEngine);
        (0, bun_test_1.expect)(result).toBe('File /test/file.ts edited successfully');
        (0, bun_test_1.expect)(writtenContent).toBe('Hi world, this is a test');
    });
    (0, bun_test_1.test)('should throw error when string not found', async () => {
        const mockFileSystem = {
            initialize: (0, bun_test_1.mock)(() => Promise.resolve()),
            readFile: (0, bun_test_1.mock)(() => Promise.resolve('Hello world')),
            writeFile: (0, bun_test_1.mock)(() => Promise.resolve(true))
        };
        const mockEditorEngine = {
            branches: {
                getBranchDataById: (0, bun_test_1.mock)(() => ({ codeEditor: mockFileSystem }))
            }
        };
        const tool = new search_replace_edit_1.SearchReplaceEditTool();
        await (0, bun_test_1.expect)(tool.handle({
            branchId: 'test-branch',
            file_path: '/test/file.ts',
            old_string: 'NotFound',
            new_string: 'Replacement',
            replace_all: false,
        }, mockEditorEngine)).rejects.toThrow('String not found in file: NotFound');
    });
    (0, bun_test_1.test)('should replace all occurrences when replace_all is true', async () => {
        let writtenContent = '';
        const mockFileSystem = {
            initialize: (0, bun_test_1.mock)(() => Promise.resolve()),
            readFile: (0, bun_test_1.mock)(() => Promise.resolve('test test test')),
            writeFile: (0, bun_test_1.mock)((path, content) => {
                writtenContent = content;
                return Promise.resolve(true);
            })
        };
        const mockEditorEngine = {
            branches: {
                getBranchDataById: (0, bun_test_1.mock)(() => ({ codeEditor: mockFileSystem }))
            }
        };
        const tool = new search_replace_edit_1.SearchReplaceEditTool();
        const result = await tool.handle({
            branchId: 'test-branch',
            file_path: '/test/file.ts',
            old_string: 'test',
            new_string: 'replacement',
            replace_all: true,
        }, mockEditorEngine);
        (0, bun_test_1.expect)(result).toBe('File /test/file.ts edited successfully');
        (0, bun_test_1.expect)(writtenContent).toBe('replacement replacement replacement');
    });
    (0, bun_test_1.test)('should handle missing file system', async () => {
        const mockEditorEngine = {
            branches: {
                getBranchDataById: (0, bun_test_1.mock)(() => null)
            }
        };
        const tool = new search_replace_edit_1.SearchReplaceEditTool();
        await (0, bun_test_1.expect)(tool.handle({
            branchId: 'invalid-branch',
            file_path: '/test/file.ts',
            old_string: 'test',
            new_string: 'replacement',
            replace_all: false,
        }, mockEditorEngine)).rejects.toThrow('file system not found');
    });
});
(0, bun_test_1.describe)('SearchReplaceMultiEditFileTool', () => {
    (0, bun_test_1.test)('should apply multiple edits sequentially', async () => {
        let writtenContent = '';
        const mockFileSystem = {
            initialize: (0, bun_test_1.mock)(() => Promise.resolve()),
            readFile: (0, bun_test_1.mock)(() => Promise.resolve('Hello world, this is a test')),
            writeFile: (0, bun_test_1.mock)((path, content) => {
                writtenContent = content;
                return Promise.resolve(true);
            })
        };
        const mockEditorEngine = {
            branches: {
                getBranchDataById: (0, bun_test_1.mock)(() => ({ codeEditor: mockFileSystem }))
            }
        };
        const tool = new search_replace_multi_edit_1.SearchReplaceMultiEditFileTool();
        const result = await tool.handle({
            branchId: 'test-branch',
            file_path: '/test/file.ts',
            edits: [
                { old_string: 'Hello', new_string: 'Hi', replace_all: false },
                { old_string: 'world', new_string: 'universe', replace_all: false },
            ],
        }, mockEditorEngine);
        (0, bun_test_1.expect)(result).toBe('File /test/file.ts edited with 2 changes');
        (0, bun_test_1.expect)(writtenContent).toBe('Hi universe, this is a test');
    });
    (0, bun_test_1.test)('should handle empty edits array', async () => {
        let writtenContent = '';
        const mockFileSystem = {
            initialize: (0, bun_test_1.mock)(() => Promise.resolve()),
            readFile: (0, bun_test_1.mock)(() => Promise.resolve('Hello world')),
            writeFile: (0, bun_test_1.mock)((path, content) => {
                writtenContent = content;
                return Promise.resolve(true);
            })
        };
        const mockEditorEngine = {
            branches: {
                getBranchDataById: (0, bun_test_1.mock)(() => ({ codeEditor: mockFileSystem }))
            }
        };
        const tool = new search_replace_multi_edit_1.SearchReplaceMultiEditFileTool();
        const result = await tool.handle({
            branchId: 'test-branch',
            file_path: '/test/file.ts',
            edits: [],
        }, mockEditorEngine);
        (0, bun_test_1.expect)(result).toBe('File /test/file.ts edited with 0 changes');
        (0, bun_test_1.expect)(writtenContent).toBe('Hello world');
    });
    (0, bun_test_1.test)('should handle missing file system', async () => {
        const mockEditorEngine = {
            branches: {
                getBranchDataById: (0, bun_test_1.mock)(() => null)
            }
        };
        const tool = new search_replace_multi_edit_1.SearchReplaceMultiEditFileTool();
        await (0, bun_test_1.expect)(tool.handle({
            branchId: 'invalid-branch',
            file_path: '/test/file.ts',
            edits: [{ old_string: 'test', new_string: 'replacement', replace_all: false }],
        }, mockEditorEngine)).rejects.toThrow('file system not found');
    });
});
//# sourceMappingURL=edit.test.js.map