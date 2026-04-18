"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesManager = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
const helper_1 = require("./helper");
class PagesManager {
    editorEngine;
    projectsManager;
    pages = [];
    activeRoutesByWebviewId = {};
    currentPath = '';
    groupedRoutes = '';
    constructor(editorEngine, projectsManager) {
        this.editorEngine = editorEngine;
        this.projectsManager = projectsManager;
        (0, mobx_1.makeAutoObservable)(this);
        this.scanPages();
    }
    get tree() {
        return this.pages;
    }
    get activeRoute() {
        const webview = this.getActiveWebview();
        return webview ? this.activeRoutesByWebviewId[webview.id] : undefined;
    }
    getActiveWebview() {
        return this.editorEngine.webviews.selected[0] || this.editorEngine.webviews.getAll()[0];
    }
    isNodeActive(node) {
        const webview = this.getActiveWebview();
        if (!webview) {
            return false;
        }
        const activePath = this.activeRoute;
        if (!activePath) {
            return false;
        }
        if (node.children && node.children?.length > 0) {
            return false;
        }
        // Skip folder nodes
        if (node.children && node.children?.length > 0) {
            return false;
        }
        const normalizedNodePath = node.path.replace(/\\/g, '/');
        const normalizedActivePath = activePath.replace(/\\/g, '/');
        const nodeSegments = normalizedNodePath.split('/').filter(Boolean);
        const activeSegments = normalizedActivePath.split('/').filter(Boolean);
        // Handle root path
        if (nodeSegments.length === 0 && activeSegments.length === 0) {
            return true;
        }
        if (nodeSegments.length !== activeSegments.length) {
            return false;
        }
        return nodeSegments.every((nodeSegment, index) => {
            const activeSegment = activeSegments[index];
            const isDynamic = nodeSegment.startsWith('[') && nodeSegment.endsWith(']');
            // For dynamic segments, just verify the active segment exists
            if (isDynamic) {
                return activeSegment.length > 0;
            }
            // For static segments, do exact match after cleaning escapes
            return nodeSegment.replace(/\\/g, '') === activeSegment.replace(/\\/g, '');
        });
    }
    setActivePath(webviewId, path) {
        this.activeRoutesByWebviewId[webviewId] = path;
        if (webviewId === this.getActiveWebview()?.id) {
            this.currentPath = path;
        }
        this.updateActiveStates(this.pages, path);
    }
    updateActiveStates(nodes, activePath) {
        nodes.forEach((node) => {
            node.isActive = this.isNodeActive(node);
            if (node.children?.length) {
                this.updateActiveStates(node.children, activePath);
            }
        });
    }
    setPages(pages) {
        this.pages = pages;
        this.updateActiveStates(this.pages, this.currentPath);
    }
    async scanPages() {
        try {
            const projectRoot = this.projectsManager.project?.folderPath;
            if (!projectRoot) {
                console.warn('No project root found');
                this.setPages([]); // Clears pages when no project
                return;
            }
            const pages = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SCAN_PAGES, projectRoot);
            if (pages?.length) {
                this.setPages(pages);
            }
            else {
                this.setPages([]);
            }
        }
        catch (error) {
            console.error('Failed to scan pages:', error);
            this.setPages([]);
        }
    }
    async createPage(baseRoute, pageName) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            throw new Error('No project root found');
        }
        const { valid, error } = (0, helper_1.validateNextJsRoute)(pageName);
        if (!valid) {
            throw new Error(error);
        }
        const normalizedPath = (0, helper_1.normalizeRoute)(`${baseRoute}/${pageName}`);
        if ((0, helper_1.doesRouteExist)(this.pages, normalizedPath)) {
            throw new Error('This page already exists');
        }
        try {
            await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.CREATE_PAGE, {
                projectRoot,
                pagePath: normalizedPath,
            });
            await this.scanPages();
            (0, utils_1.sendAnalytics)('page create');
        }
        catch (error) {
            console.error('Failed to create page:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(errorMessage);
        }
    }
    async renamePage(oldPath, newName) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            throw new Error('No project root found');
        }
        const { valid, error } = (0, helper_1.validateNextJsRoute)(newName);
        if (!valid) {
            throw new Error(error);
        }
        if ((0, helper_1.doesRouteExist)(this.pages, `/${newName}`)) {
            throw new Error('A page with this name already exists');
        }
        try {
            await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.RENAME_PAGE, {
                projectRoot,
                oldPath,
                newName,
            });
            await this.scanPages();
            (0, utils_1.sendAnalytics)('page rename');
        }
        catch (error) {
            console.error('Failed to rename page:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(errorMessage);
        }
    }
    async duplicatePage(sourcePath, targetPath) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            throw new Error('No project root found');
        }
        try {
            await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.DUPLICATE_PAGE, {
                projectRoot,
                sourcePath: (0, helper_1.normalizeRoute)(sourcePath),
                targetPath: (0, helper_1.normalizeRoute)(targetPath),
            });
            await this.scanPages();
            (0, utils_1.sendAnalytics)('page duplicate');
        }
        catch (error) {
            console.error('Failed to duplicate page:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(errorMessage);
        }
    }
    async deletePage(pageName, isDir) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            throw new Error('No project root found');
        }
        const normalizedPath = (0, helper_1.normalizeRoute)(`${pageName}`);
        if (normalizedPath === '' || normalizedPath === '/') {
            throw new Error('Cannot delete root page');
        }
        try {
            await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.DELETE_PAGE, {
                projectRoot,
                pagePath: normalizedPath,
                isDir,
            });
            await this.scanPages();
            (0, utils_1.sendAnalytics)('page delete');
        }
        catch (error) {
            console.error('Failed to delete page:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(errorMessage);
        }
    }
    async updateMetadataPage(pagePath, metadata) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            throw new Error('No project root found');
        }
        if (!(0, helper_1.doesRouteExist)(this.pages, pagePath)) {
            throw new Error('A page with this name does not exist');
        }
        try {
            await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.UPDATE_PAGE_METADATA, {
                projectRoot,
                pagePath,
                metadata,
            });
            await this.scanPages();
        }
        catch (error) {
            console.error('Failed to update metadata:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(errorMessage);
        }
    }
    async navigateTo(path) {
        const webview = this.getActiveWebview();
        if (!webview) {
            console.warn('No webview available');
            return;
        }
        path = path.startsWith('/') ? path : `/${path}`;
        const originalPath = path;
        const normalizedPath = path.replace(/\\/g, '/');
        const splitPath = normalizedPath.split('/').filter(Boolean);
        const removedGroupedRoutes = splitPath.filter((val) => !(val.startsWith('(') && val.endsWith(')')));
        const isGroupedRoutes = splitPath.length !== removedGroupedRoutes.length;
        if (isGroupedRoutes) {
            path = '/' + removedGroupedRoutes.join('/');
            this.groupedRoutes = originalPath;
        }
        else {
            this.groupedRoutes = '';
        }
        try {
            const currentUrl = await webview.getURL();
            const baseUrl = currentUrl ? new URL(currentUrl).origin : null;
            if (!baseUrl) {
                console.warn('No base URL found');
                return;
            }
            await webview.loadURL(`${baseUrl}${path}`);
            this.setActivePath(webview.id, originalPath);
            await webview.executeJavaScript('window.api?.processDom()');
            (0, utils_1.sendAnalytics)('page navigate');
        }
        catch (error) {
            console.error('Navigation failed:', error);
        }
    }
    setCurrentPath(path) {
        this.currentPath = path;
    }
    handleWebviewUrlChange(webviewId) {
        const webview = this.editorEngine.webviews.getWebview(webviewId);
        if (!webview) {
            return;
        }
        try {
            const url = webview.getURL();
            if (!url) {
                return;
            }
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            const activePath = this.groupedRoutes ? this.groupedRoutes : path;
            this.setActivePath(webviewId, activePath);
        }
        catch (error) {
            console.error('Failed to parse URL:', error);
        }
    }
    dispose() {
        this.pages = [];
        this.currentPath = '';
        this.editorEngine = null;
    }
}
exports.PagesManager = PagesManager;
//# sourceMappingURL=index.js.map