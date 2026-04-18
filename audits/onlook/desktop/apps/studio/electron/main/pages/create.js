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
exports.createNextJsPage = createNextJsPage;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const helpers_1 = require("./helpers");
async function createNextJsPage(projectRoot, pagePath) {
    try {
        const routerConfig = await (0, helpers_1.detectRouterType)(projectRoot);
        if (!routerConfig) {
            throw new Error('Could not detect Next.js router type');
        }
        if (routerConfig.type !== 'app') {
            throw new Error('Page creation is only supported for App Router projects.');
        }
        // Validate and normalize the path
        const normalizedPagePath = pagePath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
        if (!/^[a-zA-Z0-9\-_[\]()/]+$/.test(normalizedPagePath)) {
            throw new Error('Page path contains invalid characters');
        }
        const fullPath = path.join(routerConfig.basePath, normalizedPagePath);
        const pageFilePath = path.join(fullPath, 'page.tsx');
        const pageExists = await fs_1.promises
            .access(pageFilePath)
            .then(() => true)
            .catch(() => false);
        if (pageExists) {
            throw new Error('Page already exists at this path');
        }
        await fs_1.promises.mkdir(fullPath, { recursive: true });
        await fs_1.promises.writeFile(pageFilePath, helpers_1.DEFAULT_PAGE_CONTENT);
        return true;
    }
    catch (error) {
        console.error('Error creating page:', error);
        throw error;
    }
}
//# sourceMappingURL=create.js.map