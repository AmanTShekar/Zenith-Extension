"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const file_cache_1 = require("../../src/components/store/editor/cache/file-cache");
// Mock localforage
bun_test_1.mock.module('localforage', () => ({
    createInstance: (0, bun_test_1.mock)(() => ({
        getItem: (0, bun_test_1.mock)(async () => null),
        setItem: (0, bun_test_1.mock)(async () => undefined),
        removeItem: (0, bun_test_1.mock)(async () => undefined),
        clear: (0, bun_test_1.mock)(async () => undefined),
    })),
}));
(0, bun_test_1.describe)('FileCacheManager', () => {
    let fileCacheManager;
    let mockReadFile;
    let mockWriteFile;
    (0, bun_test_1.beforeEach)(async () => {
        fileCacheManager = new file_cache_1.FileCacheManager();
        await fileCacheManager.init();
        mockReadFile = (0, bun_test_1.mock)(async (path) => {
            if (path === 'test.tsx') {
                return {
                    type: 'text',
                    path: 'test.tsx',
                    content: '<div>Test Component</div>'
                };
            }
            else if (path === 'image.png') {
                return {
                    type: 'binary',
                    path: 'image.png',
                    content: new Uint8Array([1, 2, 3, 4])
                };
            }
            return null;
        });
        mockWriteFile = (0, bun_test_1.mock)(async (path, content) => {
            return true;
        });
    });
    (0, bun_test_1.afterEach)(async () => {
        await fileCacheManager.clear();
    });
    (0, bun_test_1.test)('should store and retrieve text files', () => {
        const textFile = {
            type: 'text',
            path: 'test.tsx',
            content: '<div>Hello World</div>'
        };
        fileCacheManager.setFile(textFile);
        const retrieved = fileCacheManager.getFile('test.tsx');
        (0, bun_test_1.expect)(retrieved).toEqual(textFile);
    });
    (0, bun_test_1.test)('should store and retrieve binary files', () => {
        const binaryFile = {
            type: 'binary',
            path: 'image.png',
            content: new Uint8Array([1, 2, 3, 4])
        };
        fileCacheManager.setFile(binaryFile);
        const retrieved = fileCacheManager.getFile('image.png');
        (0, bun_test_1.expect)(retrieved).toEqual(binaryFile);
    });
    (0, bun_test_1.test)('should handle files with null content', () => {
        const emptyFile = {
            type: 'text',
            path: 'empty.tsx',
            content: null
        };
        fileCacheManager.setFile(emptyFile);
        const retrieved = fileCacheManager.getFile('empty.tsx');
        (0, bun_test_1.expect)(retrieved).toEqual(emptyFile);
    });
    (0, bun_test_1.test)('should check if file exists', () => {
        const testFile = {
            type: 'text',
            path: 'test.tsx',
            content: 'content'
        };
        (0, bun_test_1.expect)(fileCacheManager.hasFile('test.tsx')).toBe(false);
        fileCacheManager.setFile(testFile);
        (0, bun_test_1.expect)(fileCacheManager.hasFile('test.tsx')).toBe(true);
    });
    (0, bun_test_1.test)('should delete files', () => {
        const testFile = {
            type: 'text',
            path: 'test.tsx',
            content: 'content'
        };
        fileCacheManager.setFile(testFile);
        (0, bun_test_1.expect)(fileCacheManager.hasFile('test.tsx')).toBe(true);
        const deleted = fileCacheManager.deleteFile('test.tsx');
        (0, bun_test_1.expect)(deleted).toBe(true);
        (0, bun_test_1.expect)(fileCacheManager.hasFile('test.tsx')).toBe(false);
    });
    (0, bun_test_1.test)('should handle directories', () => {
        const directory = {
            type: 'directory',
            path: 'src/components'
        };
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/components')).toBe(false);
        fileCacheManager.setDirectory(directory);
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/components')).toBe(true);
        const deleted = fileCacheManager.deleteDirectory('src/components');
        (0, bun_test_1.expect)(deleted).toBe(true);
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/components')).toBe(false);
    });
    (0, bun_test_1.test)('should check if file is loaded', async () => {
        const loadedFile = {
            type: 'text',
            path: 'loaded.tsx',
            content: 'content'
        };
        const unloadedFile = {
            type: 'text',
            path: 'unloaded.tsx',
            content: null
        };
        (0, bun_test_1.expect)(fileCacheManager.isFileLoaded(loadedFile)).toBe(true);
        (0, bun_test_1.expect)(fileCacheManager.isFileLoaded(unloadedFile)).toBe(false);
    });
    (0, bun_test_1.test)('should read from cache or fetch from filesystem', async () => {
        // Test cache hit
        const cachedFile = {
            type: 'text',
            path: 'cached.tsx',
            content: 'cached content'
        };
        fileCacheManager.setFile(cachedFile);
        const result1 = await fileCacheManager.readOrFetch('cached.tsx', mockReadFile);
        (0, bun_test_1.expect)(result1).toEqual(cachedFile);
        (0, bun_test_1.expect)(mockReadFile).not.toHaveBeenCalled();
        // Test cache miss
        mockReadFile.mockClear();
        const result2 = await fileCacheManager.readOrFetch('test.tsx', mockReadFile);
        (0, bun_test_1.expect)(result2).toEqual({
            type: 'text',
            path: 'test.tsx',
            content: '<div>Test Component</div>'
        });
        (0, bun_test_1.expect)(mockReadFile).toHaveBeenCalledWith('test.tsx');
        // Verify file was cached
        (0, bun_test_1.expect)(fileCacheManager.hasFile('test.tsx')).toBe(true);
    });
    (0, bun_test_1.test)('should handle null file from readFile function', async () => {
        const result = await fileCacheManager.readOrFetch('nonexistent.tsx', mockReadFile);
        (0, bun_test_1.expect)(result).toBeNull();
        (0, bun_test_1.expect)(mockReadFile).toHaveBeenCalledWith('nonexistent.tsx');
    });
    (0, bun_test_1.test)('should write file to filesystem and cache', async () => {
        const content = '<div>New Content</div>';
        const result = await fileCacheManager.write('new.tsx', content, mockWriteFile);
        (0, bun_test_1.expect)(result).toBe(true);
        (0, bun_test_1.expect)(mockWriteFile).toHaveBeenCalledWith('new.tsx', content);
        // Verify file was cached
        const cachedFile = fileCacheManager.getFile('new.tsx');
        (0, bun_test_1.expect)(cachedFile).toEqual({
            type: 'text',
            path: 'new.tsx',
            content: content
        });
    });
    (0, bun_test_1.test)('should write binary file to filesystem and cache', async () => {
        const content = new Uint8Array([1, 2, 3, 4]);
        const result = await fileCacheManager.write('new.png', content, mockWriteFile);
        (0, bun_test_1.expect)(result).toBe(true);
        (0, bun_test_1.expect)(mockWriteFile).toHaveBeenCalledWith('new.png', content);
        // Verify file was cached
        const cachedFile = fileCacheManager.getFile('new.png');
        (0, bun_test_1.expect)(cachedFile).toEqual({
            type: 'binary',
            path: 'new.png',
            content: content
        });
    });
    (0, bun_test_1.test)('should handle write failures', async () => {
        const failingWriteFile = (0, bun_test_1.mock)(async () => {
            throw new Error('Write failed');
        });
        // Suppress console.error for this test
        const originalConsoleError = console.error;
        console.error = (0, bun_test_1.mock)(() => { });
        const result = await fileCacheManager.write('fail.tsx', 'content', failingWriteFile);
        (0, bun_test_1.expect)(result).toBe(false);
        // Restore console.error
        console.error = originalConsoleError;
    });
    (0, bun_test_1.test)('should rename files in cache', () => {
        const originalFile = {
            type: 'text',
            path: 'original.tsx',
            content: 'content'
        };
        fileCacheManager.setFile(originalFile);
        fileCacheManager.rename('original.tsx', 'renamed.tsx');
        (0, bun_test_1.expect)(fileCacheManager.hasFile('original.tsx')).toBe(false);
        (0, bun_test_1.expect)(fileCacheManager.hasFile('renamed.tsx')).toBe(true);
        const renamedFile = fileCacheManager.getFile('renamed.tsx');
        (0, bun_test_1.expect)(renamedFile).toEqual({
            type: 'text',
            path: 'renamed.tsx',
            content: 'content'
        });
    });
    (0, bun_test_1.test)('should handle renaming non-existent file', () => {
        fileCacheManager.rename('nonexistent.tsx', 'new.tsx');
        (0, bun_test_1.expect)(fileCacheManager.hasFile('new.tsx')).toBe(false);
    });
    (0, bun_test_1.test)('should rename directories and all contained files', () => {
        // Add files in directory
        const file1 = {
            type: 'text',
            path: 'src/components/Button.tsx',
            content: 'button content'
        };
        const file2 = {
            type: 'text',
            path: 'src/components/Input.tsx',
            content: 'input content'
        };
        const file3 = {
            type: 'text',
            path: 'src/utils/helper.ts',
            content: 'helper content'
        };
        fileCacheManager.setFile(file1);
        fileCacheManager.setFile(file2);
        fileCacheManager.setFile(file3);
        // Add directory
        const directory = {
            type: 'directory',
            path: 'src/components'
        };
        fileCacheManager.setDirectory(directory);
        // Rename directory
        fileCacheManager.renameDirectory('src/components', 'src/ui');
        // Check files were moved
        (0, bun_test_1.expect)(fileCacheManager.hasFile('src/components/Button.tsx')).toBe(false);
        (0, bun_test_1.expect)(fileCacheManager.hasFile('src/components/Input.tsx')).toBe(false);
        (0, bun_test_1.expect)(fileCacheManager.hasFile('src/ui/Button.tsx')).toBe(true);
        (0, bun_test_1.expect)(fileCacheManager.hasFile('src/ui/Input.tsx')).toBe(true);
        // File outside directory should be unchanged
        (0, bun_test_1.expect)(fileCacheManager.hasFile('src/utils/helper.ts')).toBe(true);
        // Directory should be renamed
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/components')).toBe(false);
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/ui')).toBe(true);
        // Check file contents and paths were updated
        const movedFile = fileCacheManager.getFile('src/ui/Button.tsx');
        (0, bun_test_1.expect)(movedFile).toEqual({
            type: 'text',
            path: 'src/ui/Button.tsx',
            content: 'button content'
        });
    });
    (0, bun_test_1.test)('should list all files', () => {
        const files = [
            { type: 'text', path: 'file1.tsx', content: 'content1' },
            { type: 'text', path: 'file2.tsx', content: 'content2' },
            { type: 'binary', path: 'image.png', content: new Uint8Array([1, 2]) }
        ];
        files.forEach(file => fileCacheManager.setFile(file));
        const fileList = fileCacheManager.listAllFiles();
        (0, bun_test_1.expect)(fileList).toHaveLength(3);
        (0, bun_test_1.expect)(fileList).toContain('file1.tsx');
        (0, bun_test_1.expect)(fileList).toContain('file2.tsx');
        (0, bun_test_1.expect)(fileList).toContain('image.png');
    });
    (0, bun_test_1.test)('should list all directories', () => {
        const directories = [
            { type: 'directory', path: 'src' },
            { type: 'directory', path: 'src/components' },
            { type: 'directory', path: 'public' }
        ];
        directories.forEach(dir => fileCacheManager.setDirectory(dir));
        const dirList = fileCacheManager.listAllDirectories();
        (0, bun_test_1.expect)(dirList).toHaveLength(3);
        (0, bun_test_1.expect)(dirList).toContain('src');
        (0, bun_test_1.expect)(dirList).toContain('src/components');
        (0, bun_test_1.expect)(dirList).toContain('public');
    });
    (0, bun_test_1.test)('should write empty file to cache', () => {
        fileCacheManager.writeEmptyFile('empty.png', 'binary');
        (0, bun_test_1.expect)(fileCacheManager.hasFile('empty.png')).toBe(true);
        const emptyFile = fileCacheManager.getFile('empty.png');
        (0, bun_test_1.expect)(emptyFile).toEqual({
            type: 'binary',
            path: 'empty.png',
            content: null
        });
    });
    (0, bun_test_1.test)('should not overwrite existing file with writeEmptyFile', () => {
        const existingFile = {
            type: 'binary',
            path: 'existing.png',
            content: new Uint8Array([1, 2, 3])
        };
        fileCacheManager.setFile(existingFile);
        fileCacheManager.writeEmptyFile('existing.png', 'binary');
        const file = fileCacheManager.getFile('existing.png');
        (0, bun_test_1.expect)(file).toEqual(existingFile); // Should remain unchanged
    });
    (0, bun_test_1.test)('should clear all files and directories', async () => {
        // Add files and directories
        fileCacheManager.setFile({ type: 'text', path: 'file.tsx', content: 'content' });
        fileCacheManager.setDirectory({ type: 'directory', path: 'src' });
        (0, bun_test_1.expect)(fileCacheManager.fileCount).toBe(1);
        (0, bun_test_1.expect)(fileCacheManager.directoryCount).toBe(1);
        await fileCacheManager.clear();
        (0, bun_test_1.expect)(fileCacheManager.fileCount).toBe(0);
        (0, bun_test_1.expect)(fileCacheManager.directoryCount).toBe(0);
        (0, bun_test_1.expect)(fileCacheManager.listAllFiles()).toHaveLength(0);
        (0, bun_test_1.expect)(fileCacheManager.listAllDirectories()).toHaveLength(0);
    });
    (0, bun_test_1.test)('should track file and directory counts', () => {
        (0, bun_test_1.expect)(fileCacheManager.fileCount).toBe(0);
        (0, bun_test_1.expect)(fileCacheManager.directoryCount).toBe(0);
        fileCacheManager.setFile({ type: 'text', path: 'file1.tsx', content: 'content' });
        fileCacheManager.setFile({ type: 'text', path: 'file2.tsx', content: 'content' });
        fileCacheManager.setDirectory({ type: 'directory', path: 'src' });
        (0, bun_test_1.expect)(fileCacheManager.fileCount).toBe(2);
        (0, bun_test_1.expect)(fileCacheManager.directoryCount).toBe(1);
        fileCacheManager.deleteFile('file1.tsx');
        (0, bun_test_1.expect)(fileCacheManager.fileCount).toBe(1);
        fileCacheManager.deleteDirectory('src');
        (0, bun_test_1.expect)(fileCacheManager.directoryCount).toBe(0);
    });
    (0, bun_test_1.test)('should handle content hash with files', () => {
        const testFile = {
            type: 'text',
            path: 'test.tsx',
            content: 'original content'
        };
        // Set file with content hash
        fileCacheManager.setFile(testFile, 'hash123');
        // File should be in cache
        (0, bun_test_1.expect)(fileCacheManager.hasFile('test.tsx')).toBe(true);
        (0, bun_test_1.expect)(fileCacheManager.getFile('test.tsx')).toEqual(testFile);
    });
    (0, bun_test_1.test)('should rename nested directories when renaming parent directory', () => {
        // Add nested directories and files
        const nestedDir1 = {
            type: 'directory',
            path: 'src/components/ui'
        };
        const nestedDir2 = {
            type: 'directory',
            path: 'src/components/forms'
        };
        const nestedDir3 = {
            type: 'directory',
            path: 'src/components/ui/buttons'
        };
        const parentDir = {
            type: 'directory',
            path: 'src/components'
        };
        const unrelatedDir = {
            type: 'directory',
            path: 'src/utils'
        };
        // Add files in nested directories
        const nestedFile = {
            type: 'text',
            path: 'src/components/ui/Button.tsx',
            content: 'button'
        };
        fileCacheManager.setDirectory(parentDir);
        fileCacheManager.setDirectory(nestedDir1);
        fileCacheManager.setDirectory(nestedDir2);
        fileCacheManager.setDirectory(nestedDir3);
        fileCacheManager.setDirectory(unrelatedDir);
        fileCacheManager.setFile(nestedFile);
        // Rename parent directory
        fileCacheManager.renameDirectory('src/components', 'src/widgets');
        // Check that all nested directories were renamed
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/components')).toBe(false);
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/components/ui')).toBe(false);
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/components/forms')).toBe(false);
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/components/ui/buttons')).toBe(false);
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/widgets')).toBe(true);
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/widgets/ui')).toBe(true);
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/widgets/forms')).toBe(true);
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/widgets/ui/buttons')).toBe(true);
        // Unrelated directory should remain unchanged
        (0, bun_test_1.expect)(fileCacheManager.hasDirectory('src/utils')).toBe(true);
        // Files in nested directories should also be renamed
        (0, bun_test_1.expect)(fileCacheManager.hasFile('src/components/ui/Button.tsx')).toBe(false);
        (0, bun_test_1.expect)(fileCacheManager.hasFile('src/widgets/ui/Button.tsx')).toBe(true);
        const renamedFile = fileCacheManager.getFile('src/widgets/ui/Button.tsx');
        (0, bun_test_1.expect)(renamedFile?.path).toBe('src/widgets/ui/Button.tsx');
        (0, bun_test_1.expect)(renamedFile?.content).toBe('button');
    });
    (0, bun_test_1.test)('should prevent renaming root directory', () => {
        (0, bun_test_1.expect)(() => {
            fileCacheManager.renameDirectory('/', '/new-root');
        }).toThrow('Cannot rename root directory');
        (0, bun_test_1.expect)(() => {
            fileCacheManager.renameDirectory('', '/new-root');
        }).toThrow('Cannot rename root directory');
        // Test with trailing slashes that normalize to root
        (0, bun_test_1.expect)(() => {
            fileCacheManager.renameDirectory('///', '/new-root');
        }).toThrow('Cannot rename root directory');
    });
});
//# sourceMappingURL=file-cache.test.js.map