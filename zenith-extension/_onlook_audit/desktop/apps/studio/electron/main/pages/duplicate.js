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
exports.duplicateNextJsPage = duplicateNextJsPage;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const helpers_1 = require("./helpers");
async function getUniqueDir(basePath, dirName) {
    let uniquePath = dirName;
    let counter = 1;
    const baseName = dirName.replace(/-copy(-\d+)?$/, '');
    while (true) {
        try {
            await fs_1.promises.access(path.join(basePath, uniquePath));
            uniquePath = `${baseName}-copy-${counter}`;
            counter++;
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return uniquePath;
            }
            throw err;
        }
    }
}
async function duplicateNextJsPage(projectRoot, sourcePath, targetPath) {
    const routerConfig = await (0, helpers_1.detectRouterType)(projectRoot);
    if (!routerConfig || routerConfig.type !== 'app') {
        throw new Error('Page duplication is only supported for App Router projects.');
    }
    // Handle root path case
    const isRootPath = helpers_1.ROOT_PATH_IDENTIFIERS.includes(sourcePath);
    if (isRootPath) {
        const sourcePageFile = path.join(routerConfig.basePath, 'page.tsx');
        const targetDir = await getUniqueDir(routerConfig.basePath, helpers_1.ROOT_PAGE_COPY_NAME);
        const targetPageFile = path.join(targetDir, 'page.tsx');
        // Check if target already exists
        if (await fs_1.promises
            .access(targetDir)
            .then(() => true)
            .catch(() => false)) {
            throw new Error('Target path already exists');
        }
        await fs_1.promises.mkdir(targetDir, { recursive: true });
        await fs_1.promises.copyFile(sourcePageFile, targetPageFile);
        return true;
    }
    // Handle non-root pages
    const normalizedSourcePath = sourcePath;
    const normalizedTargetPath = await getUniqueDir(routerConfig.basePath, targetPath);
    const sourceFull = path.join(routerConfig.basePath, normalizedSourcePath);
    const targetFull = path.join(routerConfig.basePath, normalizedTargetPath);
    // Check if target already exists
    if (await fs_1.promises
        .access(targetFull)
        .then(() => true)
        .catch(() => false)) {
        throw new Error('Target path already exists');
    }
    await fs_1.promises.cp(sourceFull, targetFull, { recursive: true });
    return true;
}
//# sourceMappingURL=duplicate.js.map