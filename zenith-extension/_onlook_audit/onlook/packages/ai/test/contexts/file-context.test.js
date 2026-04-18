"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("@onlook/models");
const bun_test_1 = require("bun:test");
const file_1 = require("../../src/contexts/classes/file");
(0, bun_test_1.describe)('FileContext', () => {
    const createMockFileContext = (overrides = {}) => ({
        type: models_1.MessageContextType.FILE,
        path: 'src/components/Button.tsx',
        content: 'export const Button = () => <button>Click me</button>;',
        displayName: 'Button.tsx',
        branchId: 'main-branch-123',
        ...overrides,
    });
    const createMockHighlightContext = (overrides = {}) => ({
        type: models_1.MessageContextType.HIGHLIGHT,
        path: 'src/components/Button.tsx',
        start: 1,
        end: 2,
        content: 'export const Button',
        displayName: 'Button.tsx',
        branchId: 'main-branch-123',
        ...overrides,
    });
    (0, bun_test_1.describe)('static properties', () => {
        (0, bun_test_1.test)('should have correct context type', () => {
            (0, bun_test_1.expect)(file_1.FileContext.contextType).toBe(models_1.MessageContextType.FILE);
        });
        (0, bun_test_1.test)('should have correct display name', () => {
            (0, bun_test_1.expect)(file_1.FileContext.displayName).toBe('File');
        });
        (0, bun_test_1.test)('should have an icon', () => {
            (0, bun_test_1.expect)(file_1.FileContext.icon).toBeDefined();
        });
    });
    (0, bun_test_1.describe)('getPrompt', () => {
        (0, bun_test_1.test)('should generate correct prompt format for TypeScript file', () => {
            const context = createMockFileContext();
            const prompt = file_1.FileContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<path>src/components/Button.tsx</path>');
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: "main-branch-123"</branch>');
            (0, bun_test_1.expect)(prompt).toContain('```tsx');
            (0, bun_test_1.expect)(prompt).toContain('export const Button = () => <button>Click me</button>;');
            (0, bun_test_1.expect)(prompt).toContain('```');
        });
        (0, bun_test_1.test)('should generate correct prompt format for JavaScript file', () => {
            const context = createMockFileContext({
                path: 'utils/helper.js',
                content: 'function helper() { return true; }',
            });
            const prompt = file_1.FileContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<path>utils/helper.js</path>');
            (0, bun_test_1.expect)(prompt).toContain('```js');
            (0, bun_test_1.expect)(prompt).toContain('function helper() { return true; }');
        });
        (0, bun_test_1.test)('should generate correct prompt format for file without extension', () => {
            const context = createMockFileContext({
                path: 'README',
                content: '# Project README',
            });
            const prompt = file_1.FileContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<path>README</path>');
            (0, bun_test_1.expect)(prompt).toContain('```');
            (0, bun_test_1.expect)(prompt).toContain('# Project README');
        });
        (0, bun_test_1.test)('should handle empty content', () => {
            const context = createMockFileContext({
                content: '',
            });
            const prompt = file_1.FileContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<path>src/components/Button.tsx</path>');
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: "main-branch-123"</branch>');
            (0, bun_test_1.expect)(prompt).toContain('```tsx');
            (0, bun_test_1.expect)(prompt).toContain('```');
        });
        (0, bun_test_1.test)('should handle content with special characters', () => {
            const context = createMockFileContext({
                content: 'const message = "Hello & welcome to <our> site!";',
            });
            const prompt = file_1.FileContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('const message = "Hello & welcome to <our> site!";');
        });
        (0, bun_test_1.test)('should handle very long file paths', () => {
            const context = createMockFileContext({
                path: 'src/very/deep/nested/folder/structure/with/many/levels/Component.tsx',
            });
            const prompt = file_1.FileContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<path>src/very/deep/nested/folder/structure/with/many/levels/Component.tsx</path>');
        });
        (0, bun_test_1.test)('should handle branch IDs with special characters', () => {
            const context = createMockFileContext({
                branchId: 'feature/user-auth-&-permissions',
            });
            const prompt = file_1.FileContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: "feature/user-auth-&-permissions"</branch>');
        });
    });
    (0, bun_test_1.describe)('getLabel', () => {
        (0, bun_test_1.test)('should extract filename from path', () => {
            const context = createMockFileContext({
                path: 'src/components/Button.tsx',
            });
            const label = file_1.FileContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Button.tsx');
        });
        (0, bun_test_1.test)('should handle file in root directory', () => {
            const context = createMockFileContext({
                path: 'package.json',
            });
            const label = file_1.FileContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('package.json');
        });
        (0, bun_test_1.test)('should handle path with no filename', () => {
            const context = createMockFileContext({
                path: 'src/components/',
            });
            const label = file_1.FileContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('File');
        });
        (0, bun_test_1.test)('should handle empty path', () => {
            const context = createMockFileContext({
                path: '',
            });
            const label = file_1.FileContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('File');
        });
        (0, bun_test_1.test)('should handle path with trailing slash', () => {
            const context = createMockFileContext({
                path: 'src/utils/helper.js/',
            });
            const label = file_1.FileContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('File');
        });
    });
    (0, bun_test_1.describe)('getFilesContent', () => {
        (0, bun_test_1.test)('should generate content for single file', () => {
            const files = [createMockFileContext()];
            const highlights = [];
            const content = file_1.FileContext.getFilesContent(files, highlights);
            (0, bun_test_1.expect)(content).toContain('I have added these files to the chat');
            (0, bun_test_1.expect)(content).toContain('<file>');
            (0, bun_test_1.expect)(content).toContain('<path>src/components/Button.tsx</path>');
            (0, bun_test_1.expect)(content).toContain('```tsx');
        });
        (0, bun_test_1.test)('should generate content for multiple files', () => {
            const files = [
                createMockFileContext({ path: 'file1.ts', content: 'content1' }),
                createMockFileContext({ path: 'file2.ts', content: 'content2' }),
            ];
            const highlights = [];
            const content = file_1.FileContext.getFilesContent(files, highlights);
            (0, bun_test_1.expect)(content).toContain('<file-1>');
            (0, bun_test_1.expect)(content).toContain('<file-2>');
            (0, bun_test_1.expect)(content).toContain('content1');
            (0, bun_test_1.expect)(content).toContain('content2');
        });
        (0, bun_test_1.test)('should include highlights for matching files', () => {
            const files = [createMockFileContext({ path: 'test.ts' })];
            const highlights = [createMockHighlightContext({ path: 'test.ts' })];
            const content = file_1.FileContext.getFilesContent(files, highlights);
            (0, bun_test_1.expect)(content).toContain('<highlight>');
            (0, bun_test_1.expect)(content).toContain('export const Button');
        });
        (0, bun_test_1.test)('should return empty string for empty files array', () => {
            const content = file_1.FileContext.getFilesContent([], []);
            (0, bun_test_1.expect)(content).toBe('');
        });
        (0, bun_test_1.test)('should handle files with same names in different directories', () => {
            const files = [
                createMockFileContext({ path: 'src/Button.tsx' }),
                createMockFileContext({ path: 'tests/Button.tsx' }),
            ];
            const content = file_1.FileContext.getFilesContent(files, []);
            (0, bun_test_1.expect)(content).toContain('<file-1>');
            (0, bun_test_1.expect)(content).toContain('<file-2>');
            (0, bun_test_1.expect)(content).toContain('src/Button.tsx');
            (0, bun_test_1.expect)(content).toContain('tests/Button.tsx');
        });
    });
    (0, bun_test_1.describe)('getTruncatedFilesContent', () => {
        (0, bun_test_1.test)('should generate truncated content for files', () => {
            const files = [createMockFileContext()];
            const content = file_1.FileContext.getTruncatedFilesContent(files);
            (0, bun_test_1.expect)(content).toContain('This context originally included the content of files');
            (0, bun_test_1.expect)(content).toContain('<path>src/components/Button.tsx</path>');
            (0, bun_test_1.expect)(content).toContain('<branch>id: "main-branch-123"</branch>');
            (0, bun_test_1.expect)(content).not.toContain('```');
            (0, bun_test_1.expect)(content).not.toContain('export const Button');
        });
        (0, bun_test_1.test)('should handle multiple files', () => {
            const files = [
                createMockFileContext({ path: 'file1.ts' }),
                createMockFileContext({ path: 'file2.ts' }),
            ];
            const content = file_1.FileContext.getTruncatedFilesContent(files);
            (0, bun_test_1.expect)(content).toContain('<file-1>');
            (0, bun_test_1.expect)(content).toContain('<file-2>');
        });
        (0, bun_test_1.test)('should return empty string for empty files array', () => {
            const content = file_1.FileContext.getTruncatedFilesContent([]);
            (0, bun_test_1.expect)(content).toBe('');
        });
    });
    (0, bun_test_1.describe)('edge cases', () => {
        (0, bun_test_1.test)('should handle null or undefined properties gracefully', () => {
            const context = {
                type: models_1.MessageContextType.FILE,
                path: 'test.ts',
                content: 'test',
                displayName: 'test.ts',
                branchId: '',
            };
            const prompt = file_1.FileContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: ""</branch>');
        });
        (0, bun_test_1.test)('should handle unicode characters in content', () => {
            const context = createMockFileContext({
                content: 'const emoji = "👋 Hello 世界";',
            });
            const prompt = file_1.FileContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('👋 Hello 世界');
        });
        (0, bun_test_1.test)('should handle multiline content', () => {
            const context = createMockFileContext({
                content: 'function test() {\n  return true;\n}',
            });
            const prompt = file_1.FileContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('function test() {\n  return true;\n}');
        });
    });
});
//# sourceMappingURL=file-context.test.js.map