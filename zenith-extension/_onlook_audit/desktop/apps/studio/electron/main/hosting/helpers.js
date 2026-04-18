"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeFiles = serializeFiles;
exports.preprocessNextBuild = preprocessNextBuild;
exports.postprocessNextBuild = postprocessNextBuild;
exports.copyDir = copyDir;
exports.updateGitignore = updateGitignore;
const foundation_1 = require("@onlook/foundation");
const constants_1 = require("@onlook/models/constants");
const fs_1 = require("fs");
const istextorbinary_1 = require("istextorbinary");
const node_path_1 = require("node:path");
const SUPPORTED_LOCK_FILES = ['bun.lock', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
function serializeFiles(currentDir, basePath = '') {
    const files = {};
    for (const entry of (0, fs_1.readdirSync)(currentDir)) {
        const entryPath = (0, node_path_1.join)(currentDir, entry);
        if (entryPath.includes('node_modules')) {
            continue;
        }
        const stats = (0, fs_1.statSync)(entryPath);
        if (stats.isDirectory()) {
            Object.assign(files, serializeFiles(entryPath, `${basePath}${entry}/`));
        }
        else if (stats.isFile()) {
            const buffer = (0, fs_1.readFileSync)(entryPath);
            // @ts-expect-error - incorrect type signature
            if ((0, istextorbinary_1.isBinary)(entryPath, buffer)) {
                files[`${basePath}${entry}`] = {
                    content: buffer.toString('base64'),
                    encoding: 'base64',
                };
            }
            else {
                files[`${basePath}${entry}`] = {
                    content: buffer.toString('utf-8'),
                    encoding: 'utf-8',
                };
            }
        }
    }
    return files;
}
async function preprocessNextBuild(projectDir) {
    const res = await (0, foundation_1.addNextBuildConfig)(projectDir);
    if (!res) {
        return {
            success: false,
            error: 'Failed to add standalone config to Next.js project. Make sure project is Next.js and next.config.{js|ts|mjs|cjs} is present',
        };
    }
    return { success: true };
}
async function postprocessNextBuild(projectDir) {
    const entrypointExists = await checkEntrypointExists(projectDir);
    if (!entrypointExists) {
        return {
            success: false,
            error: `Failed to find entrypoint server.js in ${constants_1.CUSTOM_OUTPUT_DIR}/standalone`,
        };
    }
    copyDir(`${projectDir}/public`, `${projectDir}/${constants_1.CUSTOM_OUTPUT_DIR}/standalone/public`);
    copyDir(`${projectDir}/${constants_1.CUSTOM_OUTPUT_DIR}/static`, `${projectDir}/${constants_1.CUSTOM_OUTPUT_DIR}/standalone/${constants_1.CUSTOM_OUTPUT_DIR}/static`);
    for (const lockFile of SUPPORTED_LOCK_FILES) {
        if ((0, fs_1.existsSync)(`${projectDir}/${lockFile}`)) {
            (0, fs_1.copyFileSync)(`${projectDir}/${lockFile}`, `${projectDir}/${constants_1.CUSTOM_OUTPUT_DIR}/standalone/${lockFile}`);
            return { success: true };
        }
    }
    return {
        success: false,
        error: 'Failed to find lock file. Supported lock files: ' + SUPPORTED_LOCK_FILES.join(', '),
    };
}
async function checkEntrypointExists(projectDir) {
    return (0, fs_1.existsSync)((0, node_path_1.join)(projectDir, `/${constants_1.CUSTOM_OUTPUT_DIR}/standalone/server.js`));
}
function copyDir(src, dest) {
    if (!(0, fs_1.existsSync)(src)) {
        return;
    }
    (0, fs_1.mkdirSync)(dest, { recursive: true });
    for (const entry of (0, fs_1.readdirSync)(src, { withFileTypes: true })) {
        const srcPath = (0, node_path_1.join)(src, entry.name);
        const destPath = (0, node_path_1.join)(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        }
        else {
            (0, fs_1.copyFileSync)(srcPath, destPath);
        }
    }
}
function updateGitignore(projectDir, target) {
    const gitignorePath = (0, node_path_1.join)(projectDir, '.gitignore');
    try {
        // Create .gitignore if it doesn't exist
        if (!(0, fs_1.existsSync)(gitignorePath)) {
            (0, fs_1.appendFileSync)(gitignorePath, target + '\n');
            return true;
        }
        // Check if target is already in the file
        const gitignoreContent = (0, fs_1.readFileSync)(gitignorePath, 'utf-8');
        const lines = gitignoreContent.split(/\r?\n/);
        // Look for exact match of target
        if (!lines.some((line) => line.trim() === target)) {
            // Ensure there's a newline before adding if the file doesn't end with one
            const separator = gitignoreContent.endsWith('\n') ? '' : '\n';
            (0, fs_1.appendFileSync)(gitignorePath, `${separator}${target}\n`);
        }
        return true;
    }
    catch (error) {
        console.error(`Failed to update .gitignore: ${error}`);
        return false;
    }
}
//# sourceMappingURL=helpers.js.map