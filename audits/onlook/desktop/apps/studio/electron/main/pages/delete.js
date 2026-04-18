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
exports.deleteNextJsPage = deleteNextJsPage;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const helpers_1 = require("./helpers");
async function deleteNextJsPage(projectRoot, pagePath, isDir) {
    try {
        const routerConfig = await (0, helpers_1.detectRouterType)(projectRoot);
        if (!routerConfig) {
            throw new Error('Could not detect Next.js router type');
        }
        if (routerConfig.type !== 'app') {
            throw new Error('Page deletion is only supported for App Router projects for now.');
        }
        const fullPath = path.join(routerConfig.basePath, pagePath);
        // Check if file/folder exists
        let stats;
        try {
            stats = await fs_1.promises.stat(fullPath);
        }
        catch (err) {
            if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
                throw new Error('Selected page not found');
            }
            throw err;
        }
        if (isDir) {
            await fs_1.promises.rm(fullPath, { recursive: true, force: true });
        }
        else {
            const selectedFilePath = path.join(fullPath, 'page.tsx');
            await fs_1.promises.unlink(selectedFilePath);
            await (0, helpers_1.cleanupEmptyFolders)(path.dirname(fullPath));
        }
        console.log(`Deleted: ${fullPath}`);
        return true;
    }
    catch (error) {
        console.error('Error deleting page:', error);
        throw error;
    }
}
//# sourceMappingURL=delete.js.map