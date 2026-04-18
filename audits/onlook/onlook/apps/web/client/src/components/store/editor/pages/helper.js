"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRepoUrl = exports.updatePackageJson = exports.addSetupTask = exports.updatePageMetadataInSandbox = exports.duplicatePageInSandbox = exports.renamePageInSandbox = exports.deletePageInSandbox = exports.createPageInSandbox = exports.detectRouterConfig = exports.scanPagesFromSandbox = exports.scanAppDirectory = exports.doesRouteExist = exports.validateNextJsRoute = exports.normalizeRoute = void 0;
const models_1 = require("@onlook/models");
const parser_1 = require("@onlook/parser");
const nanoid_1 = require("nanoid");
const DEFAULT_LAYOUT_CONTENT = `export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}`;
const normalizeRoute = (route) => {
    return route
        .replace(/\\/g, '/') // Replace backslashes with forward slashes
        .replace(/\/+/g, '/') // Replace multiple slashes with single slash
        .replace(/^\/|\/$/g, '') // Remove leading and trailing slashes
        .toLowerCase(); // Ensure lowercase
};
exports.normalizeRoute = normalizeRoute;
const validateNextJsRoute = (route) => {
    if (!route) {
        return { valid: false, error: 'Page name is required' };
    }
    // Checks if it's a dynamic route
    const hasMatchingBrackets = /\[[^\]]*\]/.test(route);
    if (hasMatchingBrackets) {
        const dynamicRegex = /^\[([a-z0-9-]+)\]$/;
        if (!dynamicRegex.test(route)) {
            return {
                valid: false,
                error: 'Invalid dynamic route format. Example: [id] or [blog]',
            };
        }
        return { valid: true };
    }
    // For regular routes, allow lowercase letters, numbers, and hyphens
    const validCharRegex = /^[a-z0-9-]+$/;
    if (!validCharRegex.test(route)) {
        return {
            valid: false,
            error: 'Page name can only contain lowercase letters, numbers, and hyphens',
        };
    }
    return { valid: true };
};
exports.validateNextJsRoute = validateNextJsRoute;
const doesRouteExist = (nodes, route) => {
    const normalizedRoute = (0, exports.normalizeRoute)(route);
    const checkNode = (nodes) => {
        for (const node of nodes) {
            if ((0, exports.normalizeRoute)(node.path) === normalizedRoute) {
                return true;
            }
            if (Array.isArray(node.children) &&
                node.children.length > 0 &&
                checkNode(node.children)) {
                return true;
            }
        }
        return false;
    };
    return checkNode(nodes);
};
exports.doesRouteExist = doesRouteExist;
const IGNORED_DIRECTORIES = ['api', 'components', 'lib', 'utils', 'node_modules'];
const APP_ROUTER_PATHS = ['src/app', 'app'];
const PAGES_ROUTER_PATHS = ['src/pages', 'pages'];
const ALLOWED_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const ROOT_PAGE_NAME = 'Home';
const ROOT_PATH_IDENTIFIERS = ['', '/', '.'];
const ROOT_PAGE_COPY_NAME = 'landing-page-copy';
const DEFAULT_PAGE_CONTENT = `export default function Page() {
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
const getFileExtension = (fileName) => {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot !== -1 ? fileName.substring(lastDot) : '';
};
const getBaseName = (filePath) => {
    const parts = filePath.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1] || '';
};
const getDirName = (filePath) => {
    const parts = filePath.replace(/\\/g, '/').split('/');
    return parts.slice(0, -1).join('/');
};
const joinPath = (...parts) => {
    return parts.filter(Boolean).join('/').replace(/\/+/g, '/');
};
// Helper function to extract metadata from file content
const extractMetadata = async (content) => {
    try {
        if (typeof content !== 'string') {
            throw new Error('Content is not a string');
        }
        const ast = (0, parser_1.getAstFromContent)(content);
        if (!ast) {
            throw new Error('Failed to parse page file');
        }
        let metadata;
        // Helper functions for AST traversal
        const extractObjectValue = (obj) => {
            const result = {};
            for (const prop of obj.properties) {
                if (parser_1.t.isObjectProperty(prop) && parser_1.t.isIdentifier(prop.key)) {
                    const key = prop.key.name;
                    if (parser_1.t.isStringLiteral(prop.value)) {
                        result[key] = prop.value.value;
                    }
                    else if (parser_1.t.isObjectExpression(prop.value)) {
                        result[key] = extractObjectValue(prop.value);
                    }
                    else if (parser_1.t.isArrayExpression(prop.value)) {
                        result[key] = extractArrayValue(prop.value);
                    }
                }
            }
            return result;
        };
        const extractArrayValue = (arr) => {
            return arr.elements
                .map((element) => {
                if (parser_1.t.isStringLiteral(element)) {
                    return element.value;
                }
                else if (parser_1.t.isObjectExpression(element)) {
                    return extractObjectValue(element);
                }
                else if (parser_1.t.isArrayExpression(element)) {
                    return extractArrayValue(element);
                }
                return null;
            })
                .filter(Boolean);
        };
        // Traverse the AST to find metadata export
        (0, parser_1.traverse)(ast, {
            ExportNamedDeclaration(path) {
                const declaration = path.node.declaration;
                if (parser_1.t.isVariableDeclaration(declaration)) {
                    const declarator = declaration.declarations[0];
                    if (declarator &&
                        parser_1.t.isIdentifier(declarator.id) &&
                        declarator.id.name === 'metadata' &&
                        parser_1.t.isObjectExpression(declarator.init)) {
                        metadata = {};
                        // Extract properties from the object expression
                        for (const prop of declarator.init.properties) {
                            if (parser_1.t.isObjectProperty(prop) && parser_1.t.isIdentifier(prop.key)) {
                                const key = prop.key.name;
                                try {
                                    if (parser_1.t.isStringLiteral(prop.value)) {
                                        metadata[key] = prop.value.value;
                                    }
                                    else if (parser_1.t.isObjectExpression(prop.value)) {
                                        metadata[key] = extractObjectValue(prop.value);
                                    }
                                    else if (parser_1.t.isArrayExpression(prop.value)) {
                                        metadata[key] = extractArrayValue(prop.value);
                                    }
                                }
                                catch (error) {
                                    console.error(`Error extracting metadata:`, error);
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
        console.error(`Error reading metadata:`, error);
        return undefined;
    }
};
const scanAppDirectory = async (sandboxManager, dir, parentPath = '') => {
    const nodes = [];
    let entries;
    try {
        entries = await sandboxManager.readDir(dir);
    }
    catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
        return nodes;
    }
    const { pageFile, layoutFile } = getPageAndLayoutFiles(entries);
    const childDirectories = entries.filter((entry) => entry.isDirectory && !IGNORED_DIRECTORIES.includes(entry.name));
    if (pageFile) {
        const fileEntries = [
            pageFile,
            layoutFile || null
        ];
        const childPromises = childDirectories.map((entry) => {
            const fullPath = `${dir}/${entry.name}`;
            const relativePath = joinPath(parentPath, entry.name);
            return (0, exports.scanAppDirectory)(sandboxManager, fullPath, relativePath);
        });
        const childResults = await Promise.all(childPromises);
        const children = childResults.flat();
        const { pageMetadata, layoutMetadata } = await getPageAndLayoutMetadata(fileEntries, sandboxManager, dir);
        const metadata = {
            ...layoutMetadata,
            ...pageMetadata,
        };
        // Create page node
        const currentDir = getBaseName(dir);
        const isDynamicRoute = currentDir.startsWith('[') && currentDir.endsWith(']');
        let cleanPath;
        if (isDynamicRoute) {
            const paramName = currentDir;
            cleanPath = parentPath ? joinPath(getDirName(parentPath), paramName) : '/' + paramName;
        }
        else {
            cleanPath = parentPath ? `/${parentPath}` : '/';
        }
        cleanPath = '/' + cleanPath.replace(/^\/|\/$/g, '');
        const isRoot = ROOT_PATH_IDENTIFIERS.includes(cleanPath);
        nodes.push({
            id: (0, nanoid_1.nanoid)(),
            name: isDynamicRoute
                ? currentDir
                : parentPath
                    ? getBaseName(parentPath)
                    : ROOT_PAGE_NAME,
            path: cleanPath,
            children,
            isActive: false,
            isRoot,
            metadata: metadata ?? {},
        });
    }
    else {
        const childPromises = childDirectories.map(async (entry) => {
            const fullPath = `${dir}/${entry.name}`;
            const relativePath = joinPath(parentPath, entry.name);
            const children = await (0, exports.scanAppDirectory)(sandboxManager, fullPath, relativePath);
            if (children.length > 0) {
                const currentDirName = getBaseName(dir);
                const containerPath = parentPath ? `/${parentPath}` : `/${currentDirName}`;
                const cleanPath = containerPath.replace(/\/+/g, '/');
                return {
                    id: (0, nanoid_1.nanoid)(),
                    name: currentDirName,
                    path: cleanPath,
                    children,
                    isActive: false,
                    isRoot: false,
                    metadata: {},
                };
            }
            return null;
        });
        const childResults = await Promise.all(childPromises);
        const validNodes = childResults.filter((node) => node !== null);
        nodes.push(...validNodes);
    }
    return nodes;
};
exports.scanAppDirectory = scanAppDirectory;
const scanPagesDirectory = async (sandboxManager, dir, parentPath = '') => {
    const nodes = [];
    let entries;
    try {
        entries = await sandboxManager.readDir(dir);
    }
    catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
        return nodes;
    }
    // Process files first
    for (const entry of entries) {
        const fileName = entry.name?.split('.')[0];
        if (!fileName) {
            console.error(`Error reading file ${entry.name}`);
            continue;
        }
        if (!entry.isDirectory &&
            ALLOWED_EXTENSIONS.includes(getFileExtension(entry.name)) &&
            !IGNORED_DIRECTORIES.includes(fileName)) {
            const isDynamicRoute = fileName.startsWith('[') && fileName.endsWith(']');
            let cleanPath;
            if (fileName === 'index') {
                cleanPath = parentPath ? `/${parentPath}` : '/';
            }
            else {
                if (isDynamicRoute) {
                    const paramName = fileName.slice(1, -1);
                    cleanPath = joinPath(parentPath, paramName);
                }
                else {
                    cleanPath = joinPath(parentPath, fileName);
                }
                // Normalize path
                cleanPath = '/' + cleanPath.replace(/\\/g, '/').replace(/^\/|\/$/g, '');
            }
            const isRoot = ROOT_PATH_IDENTIFIERS.includes(cleanPath);
            // Extract metadata from the page file
            let metadata;
            try {
                const fileContent = await sandboxManager.readFile(`${dir}/${entry.name}`);
                if (typeof fileContent !== 'string') {
                    throw new Error(`File ${dir}/${entry.name} is not a text file`);
                }
                metadata = await extractMetadata(fileContent);
            }
            catch (error) {
                console.error(`Error reading file ${dir}/${entry.name}:`, error);
            }
            nodes.push({
                id: (0, nanoid_1.nanoid)(),
                name: fileName === 'index'
                    ? parentPath
                        ? `/${getBaseName(parentPath)}`
                        : ROOT_PAGE_NAME
                    : '/' + fileName,
                path: cleanPath,
                children: [],
                isActive: false,
                isRoot,
                metadata: metadata || {},
            });
        }
    }
    // Process directories
    for (const entry of entries) {
        if (IGNORED_DIRECTORIES.includes(entry.name)) {
            continue;
        }
        const fullPath = `${dir}/${entry.name}`;
        const isDynamicDir = entry.name.startsWith('[') && entry.name.endsWith(']');
        const dirNameForPath = isDynamicDir ? entry.name.slice(1, -1) : entry.name;
        const relativePath = joinPath(parentPath, dirNameForPath);
        if (entry.isDirectory) {
            const children = await scanPagesDirectory(sandboxManager, fullPath, relativePath);
            if (children.length > 0) {
                const dirPath = relativePath.replace(/\\/g, '/');
                const cleanPath = '/' + dirPath.replace(/^\/|\/$/g, '');
                nodes.push({
                    id: (0, nanoid_1.nanoid)(),
                    name: entry.name,
                    path: cleanPath,
                    children,
                    isActive: false,
                    isRoot: false,
                    metadata: {},
                });
            }
        }
    }
    return nodes;
};
const scanPagesFromSandbox = async (sandboxManager) => {
    // Use router config from sandbox manager
    const routerConfig = await sandboxManager.getRouterConfig();
    if (!routerConfig) {
        console.log('No Next.js router detected, returning empty pages');
        return [];
    }
    if (routerConfig.type === models_1.RouterType.APP) {
        return await (0, exports.scanAppDirectory)(sandboxManager, routerConfig.basePath);
    }
    else {
        return await scanPagesDirectory(sandboxManager, routerConfig.basePath);
    }
};
exports.scanPagesFromSandbox = scanPagesFromSandbox;
// TODO: We're calling getRouterConfig in a lot of places before the provider is initialized.
// We should ensure it's initialized earlier during setup.
const detectRouterConfig = async (provider) => {
    // Check for App Router
    for (const appPath of APP_ROUTER_PATHS) {
        try {
            const result = await provider.listFiles({ args: { path: appPath } });
            const entries = result.files;
            if (entries && entries.length > 0) {
                // Check for layout file (required for App Router)
                const hasLayout = entries.some((entry) => entry.type === 'file' &&
                    entry.name.startsWith('layout.') &&
                    ALLOWED_EXTENSIONS.includes(getFileExtension(entry.name)));
                if (hasLayout) {
                    return { type: models_1.RouterType.APP, basePath: appPath };
                }
            }
        }
        catch (error) {
            // Directory doesn't exist, continue checking
        }
    }
    // Check for Pages Router if App Router not found
    for (const pagesPath of PAGES_ROUTER_PATHS) {
        try {
            const result = await provider.listFiles({ args: { path: pagesPath } });
            const entries = result.files;
            if (entries && entries.length > 0) {
                // Check for index file (common in Pages Router)
                const hasIndex = entries.some((entry) => entry.type === 'file' &&
                    entry.name.startsWith('index.') &&
                    ALLOWED_EXTENSIONS.includes(getFileExtension(entry.name)));
                if (hasIndex) {
                    console.log(`Found Pages Router at: ${pagesPath}`);
                    return { type: models_1.RouterType.PAGES, basePath: pagesPath };
                }
            }
        }
        catch (error) {
            // Directory doesn't exist, continue checking
        }
    }
    return null;
};
exports.detectRouterConfig = detectRouterConfig;
// checks if file/directory exists
const pathExists = async (sandboxManager, filePath) => {
    try {
        await sandboxManager.readDir(getDirName(filePath));
        const dirEntries = await sandboxManager.readDir(getDirName(filePath));
        const fileName = getBaseName(filePath);
        return dirEntries.some((entry) => entry.name === fileName);
    }
    catch (error) {
        return false;
    }
};
const cleanupEmptyFolders = async (sandboxManager, folderPath) => {
    while (folderPath && folderPath !== getDirName(folderPath)) {
        try {
            const entries = await sandboxManager.readDir(folderPath);
            if (entries.length === 0) {
                // Delete empty directory using remove method
                await sandboxManager.deleteDirectory(folderPath);
                folderPath = getDirName(folderPath);
            }
            else {
                break;
            }
        }
        catch (error) {
            // Directory doesn't exist or can't be accessed
            break;
        }
    }
};
const getUniqueDir = async (sandboxManager, basePath, dirName, maxAttempts = 100) => {
    let uniquePath = dirName;
    let counter = 1;
    const baseName = dirName.replace(/-copy(-\d+)?$/, '');
    while (counter <= maxAttempts) {
        const fullPath = joinPath(basePath, uniquePath);
        if (!(await pathExists(sandboxManager, fullPath))) {
            return uniquePath;
        }
        uniquePath = `${baseName}-copy-${counter}`;
        counter++;
    }
    throw new Error(`Unable to find available directory name for ${dirName}`);
};
const createPageInSandbox = async (sandboxManager, pagePath) => {
    try {
        const routerConfig = await sandboxManager.getRouterConfig();
        if (!routerConfig) {
            throw new Error('Could not detect Next.js router type');
        }
        if (routerConfig.type !== models_1.RouterType.APP) {
            throw new Error('Page creation is only supported for App Router projects.');
        }
        // Validate and normalize the path
        const normalizedPagePath = pagePath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
        if (!/^[a-zA-Z0-9\-_[\]()/]+$/.test(normalizedPagePath)) {
            throw new Error('Page path contains invalid characters');
        }
        const fullPath = joinPath(routerConfig.basePath, normalizedPagePath);
        const pageFilePath = joinPath(fullPath, 'page.tsx');
        if (await pathExists(sandboxManager, pageFilePath)) {
            throw new Error('Page already exists at this path');
        }
        await sandboxManager.writeFile(pageFilePath, DEFAULT_PAGE_CONTENT);
        console.log(`Created page at: ${pageFilePath}`);
    }
    catch (error) {
        console.error('Error creating page:', error);
        throw error;
    }
};
exports.createPageInSandbox = createPageInSandbox;
const deletePageInSandbox = async (sandboxManager, pagePath, isDir) => {
    try {
        const routerConfig = await sandboxManager.getRouterConfig();
        if (!routerConfig) {
            throw new Error('Could not detect Next.js router type');
        }
        if (routerConfig.type !== models_1.RouterType.APP) {
            throw new Error('Page deletion is only supported for App Router projects.');
        }
        const normalizedPath = pagePath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
        if (normalizedPath === '' || normalizedPath === '/') {
            throw new Error('Cannot delete root page');
        }
        const fullPath = joinPath(routerConfig.basePath, normalizedPath);
        if (!(await pathExists(sandboxManager, fullPath))) {
            throw new Error('Selected page not found');
        }
        if (isDir) {
            // Delete entire directory
            await sandboxManager.deleteDirectory(fullPath);
        }
        else {
            // Delete just the page.tsx file
            const pageFilePath = joinPath(fullPath, 'page.tsx');
            await sandboxManager.deleteFile(pageFilePath);
            // Clean up empty parent directories
            await cleanupEmptyFolders(sandboxManager, fullPath);
        }
        console.log(`Deleted: ${fullPath}`);
    }
    catch (error) {
        console.error('Error deleting page:', error);
        throw error;
    }
};
exports.deletePageInSandbox = deletePageInSandbox;
const renamePageInSandbox = async (sandboxManager, oldPath, newName) => {
    try {
        const routerConfig = await sandboxManager.getRouterConfig();
        if (!routerConfig || routerConfig.type !== models_1.RouterType.APP) {
            throw new Error('Page renaming is only supported for App Router projects.');
        }
        if (ROOT_PATH_IDENTIFIERS.includes(oldPath)) {
            throw new Error('Cannot rename root page');
        }
        // Validate new name
        if (!/^[a-zA-Z0-9\-_[\]()]+$/.test(newName)) {
            throw new Error('Page name contains invalid characters');
        }
        const normalizedOldPath = oldPath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
        const oldFullPath = joinPath(routerConfig.basePath, normalizedOldPath);
        const parentDir = getDirName(oldFullPath);
        const newFullPath = joinPath(parentDir, newName);
        if (!(await pathExists(sandboxManager, oldFullPath))) {
            throw new Error(`Source page not found: ${oldFullPath}`);
        }
        if (await pathExists(sandboxManager, newFullPath)) {
            throw new Error(`Target path already exists: ${newFullPath}`);
        }
        await sandboxManager.rename(oldFullPath, newFullPath);
        console.log(`Renamed page from ${oldFullPath} to ${newFullPath}`);
    }
    catch (error) {
        console.error('Error renaming page:', error);
        throw error;
    }
};
exports.renamePageInSandbox = renamePageInSandbox;
const duplicatePageInSandbox = async (sandboxManager, sourcePath, targetPath) => {
    try {
        const routerConfig = await sandboxManager.getRouterConfig();
        if (!routerConfig || routerConfig.type !== models_1.RouterType.APP) {
            throw new Error('Page duplication is only supported for App Router projects.');
        }
        // Handle root path case
        const isRootPath = ROOT_PATH_IDENTIFIERS.includes(sourcePath);
        if (isRootPath) {
            const sourcePageFile = joinPath(routerConfig.basePath, 'page.tsx');
            const targetDir = await getUniqueDir(sandboxManager, routerConfig.basePath, ROOT_PAGE_COPY_NAME);
            const targetDirPath = joinPath(routerConfig.basePath, targetDir);
            const targetPageFile = joinPath(targetDirPath, 'page.tsx');
            if (await pathExists(sandboxManager, targetDirPath)) {
                throw new Error('Target path already exists');
            }
            await sandboxManager.copyFile(sourcePageFile, targetPageFile);
            console.log(`Duplicated root page to: ${targetPageFile}`);
            return;
        }
        // Handle non-root pages
        const normalizedSourcePath = sourcePath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
        const normalizedTargetPath = await getUniqueDir(sandboxManager, routerConfig.basePath, targetPath);
        const sourceFull = joinPath(routerConfig.basePath, normalizedSourcePath);
        const targetFull = joinPath(routerConfig.basePath, normalizedTargetPath);
        if (await pathExists(sandboxManager, targetFull)) {
            throw new Error('Target path already exists');
        }
        // Check if source directory exists
        const sourceEntries = await sandboxManager.readDir(getDirName(sourceFull));
        const sourceEntry = sourceEntries.find((entry) => entry.name === getBaseName(sourceFull));
        if (!sourceEntry) {
            throw new Error('Source page not found');
        }
        // App Router pages are always directories containing page.tsx and other files
        await sandboxManager.copyDirectory(sourceFull, targetFull);
        console.log(`Duplicated page from ${sourceFull} to ${targetFull}`);
    }
    catch (error) {
        console.error('Error duplicating page:', error);
        throw error;
    }
};
exports.duplicatePageInSandbox = duplicatePageInSandbox;
const updatePageMetadataInSandbox = async (sandboxManager, pagePath, metadata) => {
    const routerConfig = await sandboxManager.getRouterConfig();
    if (!routerConfig) {
        throw new Error('Could not detect Next.js router type');
    }
    if (routerConfig.type !== models_1.RouterType.APP) {
        throw new Error('Metadata update is only supported for App Router projects for now.');
    }
    const fullPath = joinPath(routerConfig.basePath, pagePath);
    const pageFilePath = joinPath(fullPath, 'page.tsx');
    // check if page.tsx exists
    const pageExists = await pathExists(sandboxManager, pageFilePath);
    if (!pageExists) {
        throw new Error('Page not found');
    }
    const file = await sandboxManager.readFile(pageFilePath);
    if (typeof file !== 'string') {
        throw new Error('Page file is not a text file');
    }
    const pageContent = file;
    const hasUseClient = pageContent.includes("'use client'") || pageContent.includes('"use client"');
    if (hasUseClient) {
        // check if layout.tsx exists
        const layoutFilePath = joinPath(fullPath, 'layout.tsx');
        const layoutExists = await pathExists(sandboxManager, layoutFilePath);
        if (layoutExists) {
            await updateMetadataInFile(sandboxManager, layoutFilePath, metadata);
        }
        else {
            // create layout.tsx
            // Create new layout file with metadata
            const layoutContent = `import type { Metadata } from 'next';\n\nexport const metadata: Metadata = ${JSON.stringify(metadata, null, 2)};\n\n${DEFAULT_LAYOUT_CONTENT}`;
            await sandboxManager.writeFile(layoutFilePath, layoutContent);
        }
    }
    else {
        await updateMetadataInFile(sandboxManager, pageFilePath, metadata);
    }
};
exports.updatePageMetadataInSandbox = updatePageMetadataInSandbox;
async function updateMetadataInFile(sandboxManager, filePath, metadata) {
    // Read the current file content
    const file = await sandboxManager.readFile(filePath);
    if (typeof file !== 'string') {
        throw new Error('File is not a text file');
    }
    const content = file;
    // Parse the file content using Babel
    const ast = (0, parser_1.getAstFromContent)(content);
    if (!ast) {
        throw new Error(`Failed to parse file ${filePath}`);
    }
    let hasMetadataImport = false;
    let metadataNode = null;
    // Traverse the AST to find metadata import and export
    (0, parser_1.traverse)(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value === 'next' &&
                path.node.specifiers.some((spec) => parser_1.t.isImportSpecifier(spec) &&
                    parser_1.t.isIdentifier(spec.imported) &&
                    spec.imported.name === 'Metadata')) {
                hasMetadataImport = true;
            }
        },
        ExportNamedDeclaration(path) {
            const declaration = path.node.declaration;
            if (parser_1.t.isVariableDeclaration(declaration)) {
                const declarator = declaration.declarations[0];
                if (declarator &&
                    parser_1.t.isIdentifier(declarator.id) &&
                    declarator.id.name === 'metadata') {
                    metadataNode = path.node;
                }
            }
        },
    });
    // Add Metadata import if not present
    if (!hasMetadataImport) {
        const metadataImport = parser_1.t.importDeclaration([parser_1.t.importSpecifier(parser_1.t.identifier('Metadata'), parser_1.t.identifier('Metadata'))], parser_1.t.stringLiteral('next'));
        ast.program.body.unshift(metadataImport);
    }
    // Create metadata object expression
    const metadataObject = parser_1.t.objectExpression(Object.entries(metadata).map(([key, value]) => {
        if (typeof value === 'string') {
            if (key === 'metadataBase') {
                return parser_1.t.objectProperty(parser_1.t.identifier(key), parser_1.t.newExpression(parser_1.t.identifier('URL'), [parser_1.t.stringLiteral(value)]));
            }
            return parser_1.t.objectProperty(parser_1.t.identifier(key), parser_1.t.stringLiteral(value));
        }
        else if (value === null) {
            return parser_1.t.objectProperty(parser_1.t.identifier(key), parser_1.t.nullLiteral());
        }
        else if (Array.isArray(value)) {
            return parser_1.t.objectProperty(parser_1.t.identifier(key), parser_1.t.arrayExpression(value.map((v) => {
                if (typeof v === 'string') {
                    return parser_1.t.stringLiteral(v);
                }
                else if (typeof v === 'object' && v !== null) {
                    return parser_1.t.objectExpression(Object.entries(v).map(([k, val]) => {
                        if (typeof val === 'string') {
                            return parser_1.t.objectProperty(parser_1.t.identifier(k), parser_1.t.stringLiteral(val));
                        }
                        else if (typeof val === 'number') {
                            return parser_1.t.objectProperty(parser_1.t.identifier(k), parser_1.t.numericLiteral(val));
                        }
                        return parser_1.t.objectProperty(parser_1.t.identifier(k), parser_1.t.stringLiteral(String(val)));
                    }));
                }
                return parser_1.t.stringLiteral(String(v));
            })));
        }
        else if (typeof value === 'object' && value !== null) {
            return parser_1.t.objectProperty(parser_1.t.identifier(key), parser_1.t.objectExpression(Object.entries(value).map(([k, v]) => {
                if (typeof v === 'string') {
                    return parser_1.t.objectProperty(parser_1.t.identifier(k), parser_1.t.stringLiteral(v));
                }
                else if (typeof v === 'number') {
                    return parser_1.t.objectProperty(parser_1.t.identifier(k), parser_1.t.numericLiteral(v));
                }
                else if (Array.isArray(v)) {
                    return parser_1.t.objectProperty(parser_1.t.identifier(k), parser_1.t.arrayExpression(v.map((item) => {
                        if (typeof item === 'string') {
                            return parser_1.t.stringLiteral(item);
                        }
                        else if (typeof item === 'object' && item !== null) {
                            return parser_1.t.objectExpression(Object.entries(item).map(([ik, iv]) => {
                                if (typeof iv === 'string') {
                                    return parser_1.t.objectProperty(parser_1.t.identifier(ik), parser_1.t.stringLiteral(iv));
                                }
                                else if (typeof iv === 'number') {
                                    return parser_1.t.objectProperty(parser_1.t.identifier(ik), parser_1.t.numericLiteral(iv));
                                }
                                return parser_1.t.objectProperty(parser_1.t.identifier(ik), parser_1.t.stringLiteral(String(iv)));
                            }));
                        }
                        return parser_1.t.stringLiteral(String(item));
                    })));
                }
                return parser_1.t.objectProperty(parser_1.t.identifier(k), parser_1.t.stringLiteral(String(v)));
            })));
        }
        return parser_1.t.objectProperty(parser_1.t.identifier(key), parser_1.t.stringLiteral(String(value)));
    }));
    // Create metadata variable declaration
    const metadataVarDecl = parser_1.t.variableDeclaration('const', [
        parser_1.t.variableDeclarator(parser_1.t.identifier('metadata'), metadataObject),
    ]);
    // Add type annotation
    const metadataTypeAnnotation = parser_1.t.tsTypeAnnotation(parser_1.t.tsTypeReference(parser_1.t.identifier('Metadata')));
    (metadataVarDecl.declarations[0]?.id).typeAnnotation = metadataTypeAnnotation;
    // Create metadata export
    const metadataExport = parser_1.t.exportNamedDeclaration(metadataVarDecl);
    if (metadataNode) {
        // Replace existing metadata export
        const metadataExportIndex = ast.program.body.findIndex((node) => {
            if (!parser_1.t.isExportNamedDeclaration(node) || !parser_1.t.isVariableDeclaration(node.declaration)) {
                return false;
            }
            const declarator = node.declaration.declarations[0];
            return parser_1.t.isIdentifier(declarator?.id) && declarator.id.name === 'metadata';
        });
        if (metadataExportIndex !== -1) {
            ast.program.body[metadataExportIndex] = metadataExport;
        }
    }
    else {
        // Find the default export and add metadata before it
        const defaultExportIndex = ast.program.body.findIndex((node) => parser_1.t.isExportDefaultDeclaration(node));
        if (defaultExportIndex === -1) {
            throw new Error('Could not find default export in the file');
        }
        ast.program.body.splice(defaultExportIndex, 0, metadataExport);
    }
    // Generate the updated code
    const { code } = (0, parser_1.generate)(ast);
    const formattedContent = await (0, parser_1.formatContent)(filePath, code);
    // Write the updated content back to the file
    await sandboxManager.writeFile(filePath, formattedContent);
}
const addSetupTask = async (sandboxManager) => {
    const tasks = {
        setupTasks: ['bun install'],
        tasks: {
            dev: {
                name: 'Dev Server',
                command: 'bun run dev',
                preview: {
                    port: 3000,
                },
                runAtStart: true,
            },
        },
    };
    const content = JSON.stringify(tasks, null, 2);
    await sandboxManager.writeFile('./.codesandbox/tasks.json', content);
};
exports.addSetupTask = addSetupTask;
const updatePackageJson = async (sandboxManager) => {
    const file = await sandboxManager.readFile('./package.json');
    if (typeof file !== 'string') {
        throw new Error('Package.json is not a text file');
    }
    const pkgJson = JSON.parse(file);
    pkgJson.scripts = pkgJson.scripts || {};
    pkgJson.scripts.dev = 'next dev';
    await sandboxManager.writeFile('./package.json', JSON.stringify(pkgJson, null, 2));
};
exports.updatePackageJson = updatePackageJson;
const parseRepoUrl = (repoUrl) => {
    const match = /github\.com\/([^/]+)\/([^/]+)(?:\.git)?/.exec(repoUrl);
    if (!match?.[1] || !match[2]) {
        throw new Error('Invalid GitHub URL');
    }
    return {
        owner: match[1],
        repo: match[2],
    };
};
exports.parseRepoUrl = parseRepoUrl;
const getPageAndLayoutFiles = (entries) => {
    const pageFile = entries.find((entry) => !entry.isDirectory &&
        entry.name.startsWith('page.') &&
        ALLOWED_EXTENSIONS.includes(getFileExtension(entry.name)));
    const layoutFile = entries.find((entry) => !entry.isDirectory &&
        entry.name.startsWith('layout.') &&
        ALLOWED_EXTENSIONS.includes(getFileExtension(entry.name)));
    return { pageFile, layoutFile };
};
const getPageAndLayoutMetadata = async (fileResults, sandboxManager, dir) => {
    if (!fileResults || fileResults.length === 0) {
        return { pageMetadata: undefined, layoutMetadata: undefined };
    }
    const [pageFileResult, layoutFileResult] = fileResults;
    let pageMetadata;
    let layoutMetadata;
    if (pageFileResult && !pageFileResult.isDirectory) {
        try {
            const filePath = dir ? `${dir}/${pageFileResult.name}` : pageFileResult.path;
            const fileContent = await sandboxManager.readFile(filePath);
            pageMetadata = await extractMetadata(fileContent);
        }
        catch (error) {
            console.error(`Error reading page file ${pageFileResult.path}:`, error);
        }
    }
    if (layoutFileResult && !layoutFileResult.isDirectory) {
        try {
            const filePath = dir ? `${dir}/${layoutFileResult.name}` : layoutFileResult.path;
            const fileContent = await sandboxManager.readFile(filePath);
            layoutMetadata = await extractMetadata(fileContent);
        }
        catch (error) {
            console.error(`Error reading layout file ${layoutFileResult.path}:`, error);
        }
    }
    return { pageMetadata, layoutMetadata };
};
//# sourceMappingURL=helper.js.map