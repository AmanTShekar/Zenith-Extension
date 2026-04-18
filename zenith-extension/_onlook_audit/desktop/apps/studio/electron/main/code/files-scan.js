"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanProjectFiles = scanProjectFiles;
exports.getProjectFiles = getProjectFiles;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const nanoid_1 = require("nanoid");
const models_1 = require("@onlook/models");
// Directories to ignore during scanning
const IGNORED_DIRECTORIES = ['node_modules', '.git', '.next', 'dist', 'build', models_1.CUSTOM_OUTPUT_DIR];
// Extensions focus for code editing
const PREFERRED_EXTENSIONS = [
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.html',
    '.css',
    '.scss',
    '.json',
    '.md',
    '.mdx',
];
/**
 * Scans a directory recursively to build a tree of files and folders
 */
async function scanDirectory(dir, maxDepth = 10, currentDepth = 0) {
    // Prevents infinite recursion and going too deep
    if (currentDepth >= maxDepth) {
        return [];
    }
    try {
        const entries = await fs_1.promises.readdir(dir, { withFileTypes: true });
        const nodes = [];
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            // Skips ignored directories
            if (entry.isDirectory() && IGNORED_DIRECTORIES.includes(entry.name)) {
                continue;
            }
            if (entry.isDirectory()) {
                const children = await scanDirectory(fullPath, maxDepth, currentDepth + 1);
                if (children.length > 0) {
                    nodes.push({
                        id: (0, nanoid_1.nanoid)(),
                        name: entry.name,
                        path: fullPath,
                        isDirectory: true,
                        children,
                    });
                }
            }
            else {
                const extension = path.extname(entry.name);
                nodes.push({
                    id: (0, nanoid_1.nanoid)(),
                    name: entry.name,
                    path: fullPath,
                    isDirectory: false,
                    extension,
                });
            }
        }
        // Sorts directories first, then files
        return nodes.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) {
                return -1;
            }
            if (!a.isDirectory && b.isDirectory) {
                return 1;
            }
            return a.name.localeCompare(b.name);
        });
    }
    catch (error) {
        console.error(`Error scanning directory ${dir}:`, error);
        return [];
    }
}
/**
 * Scans project files and returns a tree structure
 */
async function scanProjectFiles(projectRoot) {
    try {
        return await scanDirectory(projectRoot);
    }
    catch (error) {
        console.error('Error scanning project files:', error);
        return [];
    }
}
/**
 * Gets a flat list of all files with specified extensions
 */
async function getProjectFiles(projectRoot, extensions = PREFERRED_EXTENSIONS) {
    const allFiles = [];
    async function collectFiles(dir) {
        try {
            const entries = await fs_1.promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (!IGNORED_DIRECTORIES.includes(entry.name)) {
                        await collectFiles(fullPath);
                    }
                }
                else {
                    const extension = path.extname(entry.name);
                    if (extensions.length === 0 || extensions.includes(extension)) {
                        allFiles.push({
                            id: (0, nanoid_1.nanoid)(),
                            name: entry.name,
                            path: fullPath,
                            isDirectory: false,
                            extension,
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error(`Error collecting files from ${dir}:`, error);
        }
    }
    await collectFiles(projectRoot);
    return allFiles;
}
//# sourceMappingURL=files-scan.js.map