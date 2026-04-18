"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCacheManager = void 0;
const unified_cache_1 = require("./unified-cache");
class FileCacheManager {
    fileCache;
    directoryCache;
    constructor(projectId, branchId) {
        this.fileCache = new unified_cache_1.UnifiedCacheManager({
            name: `${projectId}-${branchId}-sandbox-files`,
            maxItems: 500,
            maxSizeBytes: 50 * 1024 * 1024, // 50MB
            ttlMs: 1000 * 60 * 30, // 30 minutes
            persistent: true,
        });
        this.directoryCache = new unified_cache_1.UnifiedCacheManager({
            name: `${projectId}-${branchId}-sandbox-directories`,
            maxItems: 1000,
            maxSizeBytes: 5 * 1024 * 1024, // 5MB
            ttlMs: 1000 * 60 * 60, // 1 hour
            persistent: true,
        });
    }
    async init() {
        await Promise.all([
            this.fileCache.init(),
            this.directoryCache.init(),
        ]);
    }
    // File cache methods
    hasFile(filePath) {
        return this.fileCache.has(filePath);
    }
    getFile(filePath) {
        return this.fileCache.get(filePath);
    }
    setFile(file, contentHash) {
        this.fileCache.set(file.path, file, contentHash);
    }
    deleteFile(filePath) {
        return this.fileCache.delete(filePath);
    }
    // Directory cache methods
    hasDirectory(dirPath) {
        return this.directoryCache.has(dirPath);
    }
    setDirectory(directory) {
        this.directoryCache.set(directory.path, directory);
    }
    deleteDirectory(dirPath) {
        return this.directoryCache.delete(dirPath);
    }
    isFileLoaded(file) {
        return file && file.content !== null;
    }
    async readOrFetch(filePath, readFile) {
        const cachedFile = this.getFile(filePath);
        if (cachedFile && cachedFile.content !== null) {
            return cachedFile;
        }
        const newFile = await readFile(filePath);
        if (newFile) {
            this.setFile(newFile);
        }
        return newFile;
    }
    async write(filePath, content, writeFile) {
        try {
            const writeSuccess = await writeFile(filePath, content);
            if (writeSuccess) {
                const type = content instanceof Uint8Array ? 'binary' : 'text';
                const newFile = {
                    type,
                    path: filePath,
                    content,
                };
                this.setFile(newFile);
            }
            return writeSuccess;
        }
        catch (error) {
            console.error(`Error writing file ${filePath}:`, error);
            return false;
        }
    }
    rename(oldPath, newPath) {
        const oldFile = this.getFile(oldPath);
        if (oldFile) {
            const newFile = { ...oldFile, path: newPath };
            this.setFile(newFile);
            this.deleteFile(oldPath);
        }
    }
    renameDirectory(oldPath, newPath) {
        // Normalize paths to handle trailing slash edge cases
        const normalizeDir = (path) => {
            if (path === '/' || path === '')
                return '/';
            const normalized = path.replace(/\/+$/, ''); // Remove trailing slashes
            return normalized === '' ? '/' : normalized;
        };
        const normalizedOldPath = normalizeDir(oldPath);
        const normalizedNewPath = normalizeDir(newPath);
        // No-op when paths are identical
        if (normalizedOldPath === normalizedNewPath) {
            return;
        }
        // Guard against renaming root directory
        if (normalizedOldPath === '/') {
            throw new Error('Cannot rename root directory');
        }
        // Create prefix for matching files (handle root case)
        const prefix = normalizedOldPath === '/' ? '/' : normalizedOldPath + '/';
        // Update all files in the directory
        for (const [filePath, file] of this.fileCache.entries()) {
            if (filePath.startsWith(prefix)) {
                const relativePath = filePath.substring(prefix.length);
                const newFilePath = normalizedNewPath === '/'
                    ? '/' + relativePath
                    : normalizedNewPath + '/' + relativePath;
                const updatedFile = { ...file, path: newFilePath };
                this.setFile(updatedFile);
                this.deleteFile(filePath);
            }
        }
        // Update all nested directories in the directory
        for (const [dirPath, directory] of this.directoryCache.entries()) {
            if (dirPath.startsWith(prefix)) {
                const relativePath = dirPath.substring(prefix.length);
                const newDirPath = normalizedNewPath === '/'
                    ? '/' + relativePath
                    : normalizedNewPath + '/' + relativePath;
                const updatedDirectory = { ...directory, path: newDirPath };
                this.setDirectory(updatedDirectory);
                this.deleteDirectory(dirPath);
            }
        }
        // Update directory entry using normalized paths
        const directory = this.directoryCache.get(normalizedOldPath);
        if (directory) {
            const newDirectory = { ...directory, path: normalizedNewPath };
            this.setDirectory(newDirectory);
            this.deleteDirectory(normalizedOldPath);
        }
    }
    listAllFiles() {
        return Array.from(this.fileCache.keys());
    }
    listAllDirectories() {
        return Array.from(this.directoryCache.keys());
    }
    writeEmptyFile(filePath, type) {
        if (this.hasFile(filePath)) {
            return;
        }
        const emptyFile = {
            type,
            path: filePath,
            content: null,
        };
        this.setFile(emptyFile);
    }
    async clear() {
        try {
            this.fileCache.clear();
            this.directoryCache.clear();
            await Promise.all([
                this.fileCache.clearPersistent(),
                this.directoryCache.clearPersistent(),
            ]);
        }
        catch (error) {
            console.error('Error clearing file cache persistent storage:', error);
        }
    }
    get fileCount() {
        return this.fileCache.size;
    }
    get directoryCount() {
        return this.directoryCache.size;
    }
}
exports.FileCacheManager = FileCacheManager;
//# sourceMappingURL=file-cache.js.map