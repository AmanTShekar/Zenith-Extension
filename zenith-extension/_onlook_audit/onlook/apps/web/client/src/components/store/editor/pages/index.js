"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagesManager = void 0;
const mobx_1 = require("mobx");
const helper_1 = require("./helper");
class PagesManager {
    editorEngine;
    pages = [];
    activeRoutesByFrameId = {};
    currentPath = '';
    groupedRoutes = '';
    _isScanning = false;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    init() { }
    async scanPages() {
        try {
            if (this._isScanning) {
                return;
            }
            this._isScanning = true;
            const realPages = await (0, helper_1.scanPagesFromSandbox)(this.editorEngine.activeSandbox);
            this.setPages(realPages);
            return;
        }
        catch (error) {
            console.error('Failed to scan pages from sandbox:', error);
            this.setPages([]);
        }
        finally {
            this._isScanning = false;
        }
    }
    get isScanning() {
        return this._isScanning;
    }
    get tree() {
        return this.pages;
    }
    get activeRoute() {
        const frame = this.getActiveFrame();
        return frame ? this.activeRoutesByFrameId[frame.frame.id] : undefined;
    }
    getActiveFrame() {
        if (!this.editorEngine?.frames) {
            return undefined;
        }
        return this.editorEngine.frames.selected[0] ?? this.editorEngine.frames.getAll()[0];
    }
    isNodeActive(node) {
        const frameView = this.getActiveFrame();
        if (!frameView) {
            return false;
        }
        const activePath = this.activeRoute;
        if (!activePath) {
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
            if (!activeSegment) {
                return false;
            }
            const isDynamic = nodeSegment.startsWith('[') && nodeSegment.endsWith(']');
            // For dynamic segments, just verify the active segment exists
            if (isDynamic) {
                return activeSegment.length > 0;
            }
            // For static segments, do exact match after cleaning escapes
            return nodeSegment.replace(/\\/g, '') === activeSegment.replace(/\\/g, '');
        });
    }
    setActivePath(frameId, path) {
        this.activeRoutesByFrameId[frameId] = path;
        if (frameId === this.getActiveFrame()?.frame.id) {
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
        if (this.editorEngine?.frames) {
            // If no pages, clear active states by using empty path
            const pathToUse = pages.length === 0 ? '' : this.currentPath;
            this.updateActiveStates(this.pages, pathToUse);
        }
    }
    async createPage(baseRoute, pageName) {
        const { valid, error } = (0, helper_1.validateNextJsRoute)(pageName);
        if (!valid) {
            throw new Error(error);
        }
        const normalizedPath = (0, helper_1.normalizeRoute)(`${baseRoute}/${pageName}`);
        if ((0, helper_1.doesRouteExist)(this.pages, normalizedPath)) {
            throw new Error('This page already exists');
        }
        try {
            await (0, helper_1.createPageInSandbox)(this.editorEngine.activeSandbox, normalizedPath);
            await this.scanPages();
            this.editorEngine.posthog.capture('page_create');
        }
        catch (error) {
            console.error('Failed to create page:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(errorMessage);
        }
    }
    async renamePage(oldPath, newName) {
        const { valid, error } = (0, helper_1.validateNextJsRoute)(newName);
        if (!valid) {
            throw new Error(error);
        }
        if ((0, helper_1.doesRouteExist)(this.pages, `/${newName}`)) {
            throw new Error('A page with this name already exists');
        }
        try {
            await (0, helper_1.renamePageInSandbox)(this.editorEngine.activeSandbox, oldPath, newName);
            await this.scanPages();
            this.editorEngine.posthog.capture('page_rename');
        }
        catch (error) {
            console.error('Failed to rename page:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(errorMessage);
        }
    }
    async duplicatePage(sourcePath, targetPath) {
        try {
            await (0, helper_1.duplicatePageInSandbox)(this.editorEngine.activeSandbox, (0, helper_1.normalizeRoute)(sourcePath), (0, helper_1.normalizeRoute)(targetPath));
            await this.scanPages();
            this.editorEngine.posthog.capture('page_duplicate');
        }
        catch (error) {
            console.error('Failed to duplicate page:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(errorMessage);
        }
    }
    async deletePage(pageName, isDir) {
        const normalizedPath = (0, helper_1.normalizeRoute)(`${pageName}`);
        if (normalizedPath === '' || normalizedPath === '/') {
            throw new Error('Cannot delete root page');
        }
        try {
            await (0, helper_1.deletePageInSandbox)(this.editorEngine.activeSandbox, normalizedPath, isDir);
            await this.scanPages();
            this.editorEngine.posthog.capture('page_delete');
        }
        catch (error) {
            console.error('Failed to delete page:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(errorMessage);
        }
    }
    async updateMetadataPage(pagePath, metadata) {
        if (!(0, helper_1.doesRouteExist)(this.pages, pagePath)) {
            throw new Error('A page with this name does not exist');
        }
        try {
            await (0, helper_1.updatePageMetadataInSandbox)(this.editorEngine.activeSandbox, pagePath, metadata);
            await this.scanPages();
        }
        catch (error) {
            console.error('Failed to update metadata:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(errorMessage);
        }
    }
    async navigateTo(path, addToHistory = true) {
        const frameData = this.getActiveFrame();
        if (!frameData?.view) {
            console.warn('No frameView available');
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
        await this.editorEngine.frames.navigateToPath(frameData.frame.id, path, addToHistory);
        this.setActivePath(frameData.frame.id, originalPath);
    }
    setCurrentPath(path) {
        this.currentPath = path;
    }
    handleFrameUrlChange(frameId) {
        if (!this.editorEngine?.frames) {
            return;
        }
        const frameData = this.editorEngine.frames.get(frameId);
        if (!frameData?.view) {
            console.error('No frame view found');
            return;
        }
        try {
            const url = frameData.view.src;
            if (!url) {
                return;
            }
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            const activePath = this.groupedRoutes ? this.groupedRoutes : path;
            this.setActivePath(frameId, activePath);
        }
        catch (error) {
            console.error('Failed to parse URL:', error);
        }
    }
    clear() {
        this.pages = [];
        this.currentPath = '';
        this.activeRoutesByFrameId = {};
        this.groupedRoutes = '';
    }
}
exports.PagesManager = PagesManager;
//# sourceMappingURL=index.js.map