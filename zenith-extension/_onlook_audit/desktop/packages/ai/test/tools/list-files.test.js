"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("@onlook/ai/src/tools/helpers");
const bun_test_1 = require("bun:test");
const fs_1 = require("fs");
const path_1 = require("path");
(0, bun_test_1.describe)('getAllFiles', () => {
    const testDir = (0, path_1.join)(__dirname, 'test-files');
    (0, bun_test_1.beforeEach)(() => {
        // Create test directory structure
        (0, fs_1.mkdirSync)(testDir);
        (0, fs_1.mkdirSync)((0, path_1.join)(testDir, 'subdir'));
        (0, fs_1.mkdirSync)((0, path_1.join)(testDir, 'node_modules'));
        // Create test files
        (0, fs_1.writeFileSync)((0, path_1.join)(testDir, 'file1.txt'), 'content');
        (0, fs_1.writeFileSync)((0, path_1.join)(testDir, 'file2.js'), 'content');
        (0, fs_1.writeFileSync)((0, path_1.join)(testDir, 'subdir', 'file3.ts'), 'content');
        (0, fs_1.writeFileSync)((0, path_1.join)(testDir, 'node_modules', 'file4.js'), 'content');
    });
    (0, bun_test_1.afterEach)(() => {
        // Cleanup test directory
        (0, fs_1.rmSync)(testDir, { recursive: true, force: true });
    });
    (0, bun_test_1.test)('should get all files without filters', async () => {
        const { files } = await (0, helpers_1.getAllFiles)(testDir, { patterns: ['**/*'], ignore: [] });
        (0, bun_test_1.expect)(files?.length).toBe(4);
        (0, bun_test_1.expect)(files?.some((f) => f.endsWith('file1.txt'))).toBe(true);
        (0, bun_test_1.expect)(files?.some((f) => f.endsWith('file2.js'))).toBe(true);
        (0, bun_test_1.expect)(files?.some((f) => f.endsWith('file3.ts'))).toBe(true);
        (0, bun_test_1.expect)(files?.some((f) => f.endsWith('file4.js'))).toBe(true);
    });
    (0, bun_test_1.test)('should filter by extensions', async () => {
        const { files } = await (0, helpers_1.getAllFiles)(testDir, { patterns: ['**/*.js'], ignore: [] });
        (0, bun_test_1.expect)(files?.length).toBe(2);
        (0, bun_test_1.expect)(files?.every((f) => f.endsWith('.js'))).toBe(true);
    });
    (0, bun_test_1.test)('should exclude specified paths', async () => {
        const { files } = await (0, helpers_1.getAllFiles)(testDir, {
            patterns: ['**/*'],
            ignore: ['node_modules/**'],
        });
        (0, bun_test_1.expect)(files?.length).toBe(3);
        (0, bun_test_1.expect)(files?.every((f) => !f.includes('node_modules'))).toBe(true);
    });
    (0, bun_test_1.test)('should handle both extensions and exclusions', async () => {
        const { files } = await (0, helpers_1.getAllFiles)(testDir, {
            patterns: ['**/*.js'],
            ignore: ['node_modules/**'],
        });
        (0, bun_test_1.expect)(files?.length).toBe(1);
        (0, bun_test_1.expect)(files?.[0].endsWith('file2.js')).toBe(true);
    });
    (0, bun_test_1.test)('should exclude specific subdirectory', async () => {
        const { files } = await (0, helpers_1.getAllFiles)(testDir, { patterns: ['**/*'], ignore: ['subdir/**'] });
        (0, bun_test_1.expect)(files?.length).toBe(3);
        (0, bun_test_1.expect)(files?.every((f) => !f.includes('subdir'))).toBe(true);
    });
    (0, bun_test_1.test)('should exclude specific file', async () => {
        const { files } = await (0, helpers_1.getAllFiles)(testDir, { patterns: ['**/*'], ignore: ['file1.txt'] });
        (0, bun_test_1.expect)(files?.length).toBe(3);
        (0, bun_test_1.expect)(files?.every((f) => !f.endsWith('file1.txt'))).toBe(true);
    });
    (0, bun_test_1.test)('should handle multiple ignore patterns', async () => {
        const { files } = await (0, helpers_1.getAllFiles)(testDir, {
            patterns: ['**/*'],
            ignore: ['subdir/**', 'file1.txt', 'node_modules/**'],
        });
        (0, bun_test_1.expect)(files?.length).toBe(1);
        (0, bun_test_1.expect)(files?.[0].endsWith('file2.js')).toBe(true);
    });
});
//# sourceMappingURL=list-files.test.js.map