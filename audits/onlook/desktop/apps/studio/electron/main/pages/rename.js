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
exports.renameNextJsPage = renameNextJsPage;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const helpers_1 = require("./helpers");
async function renameNextJsPage(projectRoot, oldPath, newName) {
    try {
        const routerConfig = await (0, helpers_1.detectRouterType)(projectRoot);
        if (!routerConfig || routerConfig.type !== 'app') {
            throw new Error('Page renaming is only supported for App Router projects.');
        }
        if (helpers_1.ROOT_PATH_IDENTIFIERS.includes(oldPath)) {
            throw new Error('Cannot rename root page');
        }
        const oldFullPath = path.join(routerConfig.basePath, oldPath);
        const parentDir = path.dirname(oldFullPath);
        const newFullPath = path.join(parentDir, newName);
        // Check if source exists
        if (!(await fs_1.promises
            .access(oldFullPath)
            .then(() => true)
            .catch(() => false))) {
            throw new Error(`Source page not found: ${oldFullPath}`);
        }
        // Check if target already exists
        if (await fs_1.promises
            .access(newFullPath)
            .then(() => true)
            .catch(() => false)) {
            throw new Error(`Target path already exists: ${newFullPath}`);
        }
        // Add a small delay to ensure any file operations are complete
        await new Promise((resolve) => setTimeout(resolve, 200));
        await fs_1.promises.rename(oldFullPath, newFullPath);
        return true;
    }
    catch (error) {
        console.error('Error renaming page:', error);
        throw error;
    }
}
//# sourceMappingURL=rename.js.map