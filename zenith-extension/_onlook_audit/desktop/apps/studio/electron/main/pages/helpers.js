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
exports.APP_ROUTER_FILES = exports.ROOT_PAGE_NAME = exports.ROOT_PAGE_COPY_NAME = exports.ROOT_PATH_IDENTIFIERS = exports.DEFAULT_PAGE_CONTENT = exports.PAGES_ROUTER_PATHS = exports.APP_ROUTER_PATHS = exports.IGNORED_DIRECTORIES = void 0;
exports.detectRouterType = detectRouterType;
exports.cleanupEmptyFolders = cleanupEmptyFolders;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const helpers_1 = require("../run/helpers");
exports.IGNORED_DIRECTORIES = ['api', 'components', 'lib', 'utils', 'node_modules'];
exports.APP_ROUTER_PATHS = ['src/app', 'app'];
exports.PAGES_ROUTER_PATHS = ['src/pages', 'pages'];
exports.DEFAULT_PAGE_CONTENT = `export default function Page() {
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-200 flex-col p-4 gap-[32px]">
            <div className="text-center text-gray-900 dark:text-gray-100 p-4">
                <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">
                    This is a blank page
                </h1>
            </div>
        </div>
    );
}
`;
exports.ROOT_PATH_IDENTIFIERS = ['', '/', '.'];
exports.ROOT_PAGE_COPY_NAME = 'landing-page-copy';
exports.ROOT_PAGE_NAME = 'Home';
exports.APP_ROUTER_FILES = [
    { prefix: 'layout', required: true },
    { prefix: 'page' },
    { prefix: 'template' },
    { prefix: 'loading' },
    { prefix: 'error' },
];
async function hasFileWithPrefix(entries, fileCheck) {
    return entries.some((entry) => entry.isFile() &&
        entry.name.startsWith(`${fileCheck.prefix}.`) &&
        helpers_1.ALLOWED_EXTENSIONS.includes(path.extname(entry.name)));
}
async function isAppRouter(entries) {
    const fileChecks = await Promise.all(exports.APP_ROUTER_FILES.map((check) => hasFileWithPrefix(entries, check)));
    // Must have layout.tsx and at least one other app router file
    return fileChecks[0] && fileChecks.slice(1).some((hasFile) => hasFile);
}
async function isPagesRouter(entries) {
    return hasFileWithPrefix(entries, { prefix: 'index' });
}
async function checkDirectory(fullPath, routerTypeCheck) {
    try {
        const stats = await fs_1.promises.stat(fullPath);
        if (stats.isDirectory()) {
            const entries = await fs_1.promises.readdir(fullPath, { withFileTypes: true });
            if (await routerTypeCheck(entries)) {
                return fullPath;
            }
        }
    }
    catch (error) {
        console.error(`Error checking directory ${fullPath}:`, error);
    }
    return null;
}
async function detectRouterType(projectRoot) {
    // Check for App Router
    for (const appPath of exports.APP_ROUTER_PATHS) {
        const fullPath = path.join(projectRoot, appPath);
        const result = await checkDirectory(fullPath, isAppRouter);
        if (result) {
            return { type: 'app', basePath: result };
        }
    }
    // Check for Pages Router
    for (const pagesPath of exports.PAGES_ROUTER_PATHS) {
        const fullPath = path.join(projectRoot, pagesPath);
        const result = await checkDirectory(fullPath, isPagesRouter);
        if (result) {
            return { type: 'pages', basePath: result };
        }
    }
    return null;
}
async function cleanupEmptyFolders(folderPath) {
    while (folderPath !== path.dirname(folderPath)) {
        try {
            const files = await fs_1.promises.readdir(folderPath);
            if (files.length === 0) {
                await fs_1.promises.rm(folderPath, { recursive: true, force: true });
                folderPath = path.dirname(folderPath);
            }
            else {
                break;
            }
        }
        catch (err) {
            const fsError = err;
            if (fsError.code === 'ENOENT') {
                console.warn(`Folder already deleted: ${folderPath}`);
                return;
            }
            if (fsError.code === 'EACCES') {
                console.error(`Permission denied: ${folderPath}`);
                return;
            }
            throw err;
        }
    }
}
//# sourceMappingURL=helpers.js.map