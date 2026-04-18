"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesManager = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
class FilesManager {
    editorEngine;
    projectsManager;
    files = [];
    isLoading = false;
    constructor(editorEngine, projectsManager) {
        this.editorEngine = editorEngine;
        this.projectsManager = projectsManager;
        (0, mobx_1.makeAutoObservable)(this);
    }
    get tree() {
        return this.files;
    }
    get loading() {
        return this.isLoading;
    }
    /**
     * Scan all files in the project
     */
    async scanFiles() {
        try {
            const projectRoot = this.projectsManager.project?.folderPath;
            if (!projectRoot) {
                console.warn('No project root found');
                this.setFiles([]);
                return;
            }
            this.isLoading = true;
            const files = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SCAN_FILES, projectRoot);
            if (files?.length) {
                this.setFiles(files);
            }
            else {
                this.setFiles([]);
            }
        }
        catch (error) {
            console.error('Failed to scan files:', error);
            this.setFiles([]);
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * Get a flat list of files with specific extensions
     */
    async getProjectFiles(extensions) {
        try {
            const projectRoot = this.projectsManager.project?.folderPath;
            if (!projectRoot) {
                throw new Error('No project root found');
            }
            this.isLoading = true;
            const files = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_PROJECT_FILES, { projectRoot, extensions });
            return files || [];
        }
        catch (error) {
            console.error('Failed to get project files:', error);
            return [];
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * Get file content by path
     */
    async getFileContent(filePath) {
        try {
            return await this.editorEngine.code.getFileContent(filePath, false);
        }
        catch (error) {
            console.error('Failed to get file content:', error);
            return null;
        }
    }
    /**
     * Update the files tree
     */
    setFiles(files) {
        this.files = files;
    }
    /**
     * Clean up resources
     */
    dispose() {
        this.files = [];
        this.editorEngine = null;
    }
}
exports.FilesManager = FilesManager;
//# sourceMappingURL=index.js.map