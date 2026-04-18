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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMetadata = extractMetadata;
exports.scanNextJsPages = scanNextJsPages;
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const fs_1 = require("fs");
const nanoid_1 = require("nanoid");
const path = __importStar(require("path"));
const helpers_1 = require("../run/helpers");
const helpers_2 = require("./helpers");
async function extractMetadata(filePath) {
    try {
        const content = await fs_1.promises.readFile(filePath, 'utf-8');
        // Parse the file content using Babel
        const ast = (0, parser_1.parse)(content, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
        });
        let metadata;
        // Traverse the AST to find metadata export
        (0, traverse_1.default)(ast, {
            ExportNamedDeclaration(path) {
                const declaration = path.node.declaration;
                if (t.isVariableDeclaration(declaration)) {
                    const declarator = declaration.declarations[0];
                    if (t.isIdentifier(declarator.id) &&
                        declarator.id.name === 'metadata' &&
                        t.isObjectExpression(declarator.init)) {
                        metadata = {};
                        // Extract properties from the object expression
                        for (const prop of declarator.init.properties) {
                            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                                const key = prop.key.name;
                                if (t.isStringLiteral(prop.value)) {
                                    metadata[key] = prop.value.value;
                                }
                                else if (t.isObjectExpression(prop.value)) {
                                    metadata[key] = extractObjectValue(prop.value);
                                }
                                else if (t.isArrayExpression(prop.value)) {
                                    metadata[key] = extractArrayValue(prop.value);
                                }
                            }
                        }
                    }
                }
            },
        });
        return metadata;
    }
    catch (error) {
        console.error(`Error reading metadata from ${filePath}:`, error);
        return undefined;
    }
}
function extractObjectValue(obj) {
    const result = {};
    for (const prop of obj.properties) {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            const key = prop.key.name;
            if (t.isStringLiteral(prop.value)) {
                result[key] = prop.value.value;
            }
            else if (t.isObjectExpression(prop.value)) {
                result[key] = extractObjectValue(prop.value);
            }
            else if (t.isArrayExpression(prop.value)) {
                result[key] = extractArrayValue(prop.value);
            }
        }
    }
    return result;
}
function extractArrayValue(arr) {
    return arr.elements
        .map((element) => {
        if (t.isStringLiteral(element)) {
            return element.value;
        }
        else if (t.isObjectExpression(element)) {
            return extractObjectValue(element);
        }
        else if (t.isArrayExpression(element)) {
            return extractArrayValue(element);
        }
        return null;
    })
        .filter(Boolean);
}
async function scanAppDirectory(dir, parentPath = '') {
    const nodes = [];
    const entries = await fs_1.promises.readdir(dir, { withFileTypes: true });
    // Handle page files
    const pageFile = entries.find((entry) => entry.isFile() &&
        entry.name.startsWith('page.') &&
        helpers_1.ALLOWED_EXTENSIONS.includes(path.extname(entry.name)));
    if (pageFile) {
        const currentDir = path.basename(dir);
        const isDynamicRoute = currentDir.startsWith('[') && currentDir.endsWith(']');
        let cleanPath;
        if (isDynamicRoute) {
            const paramName = currentDir;
            cleanPath = parentPath ? path.dirname(parentPath) + '/' + paramName : '/' + paramName;
        }
        else {
            cleanPath = parentPath ? `/${parentPath}` : '/';
        }
        // Normalize path and ensure leading slash & no trailing slash
        cleanPath = '/' + cleanPath.replace(/^\/|\/$/g, '');
        const isRoot = helpers_2.ROOT_PATH_IDENTIFIERS.includes(cleanPath);
        // Extract metadata from both page and layout files
        const pageMetadata = await extractMetadata(path.join(dir, pageFile.name));
        // Look for layout file in the same directory
        const layoutFile = entries.find((entry) => entry.isFile() &&
            entry.name.startsWith('layout.') &&
            helpers_1.ALLOWED_EXTENSIONS.includes(path.extname(entry.name)));
        const layoutMetadata = layoutFile
            ? await extractMetadata(path.join(dir, layoutFile.name))
            : undefined;
        // Merge metadata, with page metadata taking precedence over layout metadata
        const metadata = {
            ...layoutMetadata,
            ...pageMetadata,
        };
        nodes.push({
            id: (0, nanoid_1.nanoid)(),
            name: isDynamicRoute
                ? currentDir
                : parentPath
                    ? path.basename(parentPath)
                    : helpers_2.ROOT_PAGE_NAME,
            path: cleanPath,
            children: [],
            isActive: false,
            isRoot,
            metadata,
        });
    }
    // Handle directories
    for (const entry of entries) {
        if (helpers_2.IGNORED_DIRECTORIES.includes(entry.name)) {
            continue;
        }
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(parentPath, entry.name);
        if (entry.isDirectory()) {
            const children = await scanAppDirectory(fullPath, relativePath);
            if (children.length > 0) {
                const dirPath = relativePath.replace(/\\/g, '/');
                const cleanPath = '/' + dirPath.replace(/^\/|\/$/g, '');
                nodes.push({
                    id: (0, nanoid_1.nanoid)(),
                    name: entry.name,
                    path: cleanPath,
                    children,
                    isActive: false,
                });
            }
        }
    }
    return nodes;
}
async function scanPagesDirectory(dir, parentPath = '') {
    const nodes = [];
    const entries = await fs_1.promises.readdir(dir, { withFileTypes: true });
    // Process files first
    for (const entry of entries) {
        if (entry.isFile() &&
            helpers_1.ALLOWED_EXTENSIONS.includes(path.extname(entry.name)) &&
            !helpers_2.IGNORED_DIRECTORIES.includes(entry.name.split('.')[0])) {
            const fileName = entry.name.split('.')[0];
            const isDynamicRoute = fileName.startsWith('[') && fileName.endsWith(']');
            let cleanPath;
            if (fileName === 'index') {
                cleanPath = parentPath ? `/${parentPath}` : '/';
            }
            else {
                if (isDynamicRoute) {
                    const paramName = fileName.slice(1, -1);
                    cleanPath = path.join(parentPath, paramName);
                }
                else {
                    cleanPath = path.join(parentPath, fileName);
                }
                // Normalize path
                cleanPath = '/' + cleanPath.replace(/\\/g, '/').replace(/^\/|\/$/g, '');
            }
            const isRoot = helpers_2.ROOT_PATH_IDENTIFIERS.includes(cleanPath);
            // Extract metadata from the page file
            const metadata = await extractMetadata(path.join(dir, entry.name));
            nodes.push({
                id: (0, nanoid_1.nanoid)(),
                name: fileName === 'index'
                    ? parentPath
                        ? `/${path.basename(parentPath)}`
                        : helpers_2.ROOT_PAGE_NAME
                    : '/' + fileName,
                path: cleanPath,
                children: [],
                isActive: false,
                isRoot,
                metadata,
            });
        }
    }
    // Process directories
    for (const entry of entries) {
        if (helpers_2.IGNORED_DIRECTORIES.includes(entry.name)) {
            continue;
        }
        const fullPath = path.join(dir, entry.name);
        const isDynamicDir = entry.name.startsWith('[') && entry.name.endsWith(']');
        const dirNameForPath = isDynamicDir ? entry.name.slice(1, -1) : entry.name;
        const relativePath = path.join(parentPath, dirNameForPath);
        if (entry.isDirectory()) {
            const children = await scanPagesDirectory(fullPath, relativePath);
            if (children.length > 0) {
                const dirPath = relativePath.replace(/\\/g, '/');
                const cleanPath = '/' + dirPath.replace(/^\/|\/$/g, '');
                nodes.push({
                    id: (0, nanoid_1.nanoid)(),
                    name: entry.name,
                    path: cleanPath,
                    children,
                    isActive: false,
                });
            }
        }
    }
    return nodes;
}
async function scanNextJsPages(projectRoot) {
    try {
        const routerConfig = await (0, helpers_2.detectRouterType)(projectRoot);
        if (!routerConfig) {
            console.error('Could not detect Next.js router type');
            return [];
        }
        if (routerConfig.type === 'app') {
            return await scanAppDirectory(routerConfig.basePath);
        }
        else {
            return await scanPagesDirectory(routerConfig.basePath);
        }
    }
    catch (error) {
        console.error('Error scanning pages:', error);
        throw error;
    }
}
//# sourceMappingURL=scan.js.map