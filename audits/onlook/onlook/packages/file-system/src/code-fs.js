"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeFileSystem = void 0;
const lodash_debounce_1 = __importDefault(require("lodash.debounce"));
const constants_1 = require("@onlook/constants");
const models_1 = require("@onlook/models");
const parser_1 = require("@onlook/parser");
const utility_1 = require("@onlook/utility");
const fs_1 = require("./fs");
const index_cache_1 = require("./index-cache");
class CodeFileSystem extends fs_1.FileSystem {
    projectId;
    branchId;
    options;
    indexPath = `${constants_1.ONLOOK_CACHE_DIRECTORY}/index.json`;
    constructor(projectId, branchId, options = {}) {
        super(`/${projectId}/${branchId}`);
        this.projectId = projectId;
        this.branchId = branchId;
        this.options = {
            routerType: options.routerType ?? models_1.RouterType.APP,
        };
    }
    async writeFile(path, content) {
        if (this.isJsxFile(path) && typeof content === 'string') {
            const processedContent = await this.processJsxFile(path, content);
            await super.writeFile(path, processedContent);
        }
        else {
            await super.writeFile(path, content);
        }
    }
    async writeFiles(files) {
        // Write files sequentially to avoid race conditions to metadata file
        for (const { path, content } of files) {
            await this.writeFile(path, content);
        }
    }
    async processJsxFile(path, content) {
        let processedContent = content;
        const ast = (0, parser_1.getAstFromContent)(content);
        if (ast) {
            if ((0, utility_1.isRootLayoutFile)(path, this.options.routerType)) {
                (0, parser_1.injectPreloadScript)(ast);
            }
            const existingOids = await this.getFileOids(path);
            const { ast: processedAst } = (0, parser_1.addOidsToAst)(ast, existingOids);
            processedContent = await (0, parser_1.getContentFromAst)(processedAst, content);
        }
        else {
            console.warn(`Failed to parse ${path}, skipping OID injection but will still format`);
        }
        const formattedContent = await (0, parser_1.formatContent)(path, processedContent);
        await this.updateMetadataForFile(path, formattedContent);
        return formattedContent;
    }
    async getFileOids(path) {
        const index = await this.loadIndex();
        const oids = new Set();
        for (const [oid, metadata] of Object.entries(index)) {
            if ((0, utility_1.pathsEqual)(metadata.path, path)) {
                oids.add(oid);
            }
        }
        return oids;
    }
    async updateMetadataForFile(path, content) {
        const index = await this.loadIndex();
        for (const [oid, metadata] of Object.entries(index)) {
            if ((0, utility_1.pathsEqual)(metadata.path, path)) {
                delete index[oid];
            }
        }
        const ast = (0, parser_1.getAstFromContent)(content);
        if (!ast)
            return;
        const templateNodeMap = (0, parser_1.createTemplateNodeMap)({
            ast,
            filename: path,
            branchId: this.branchId,
        });
        for (const [oid, node] of templateNodeMap.entries()) {
            const code = await (0, parser_1.getContentFromTemplateNode)(node, content);
            const metadata = {
                ...node,
                oid,
                code: code || '',
            };
            index[oid] = metadata;
        }
        await this.saveIndex(index);
    }
    async getJsxElementMetadata(oid) {
        const index = await this.loadIndex();
        const metadata = index[oid];
        if (!metadata) {
            console.warn(`[CodeEditorApi] No metadata found for OID: ${oid}. Total index size: ${Object.keys(index).length}`);
        }
        return metadata;
    }
    async rebuildIndex() {
        const startTime = Date.now();
        const index = {};
        const entries = await this.listAll();
        const jsxFiles = entries.filter((entry) => entry.type === 'file' && this.isJsxFile(entry.path));
        const BATCH_SIZE = 10;
        let processedCount = 0;
        for (let i = 0; i < jsxFiles.length; i += BATCH_SIZE) {
            const batch = jsxFiles.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (entry) => {
                try {
                    const content = await this.readFile(entry.path);
                    if (typeof content === 'string') {
                        const ast = (0, parser_1.getAstFromContent)(content);
                        if (!ast)
                            return;
                        const templateNodeMap = (0, parser_1.createTemplateNodeMap)({
                            ast,
                            filename: entry.path,
                            branchId: this.branchId,
                        });
                        for (const [oid, node] of templateNodeMap.entries()) {
                            const code = await (0, parser_1.getContentFromTemplateNode)(node, content);
                            index[oid] = {
                                ...node,
                                oid,
                                code: code || '',
                            };
                        }
                        processedCount++;
                    }
                }
                catch (error) {
                    console.error(`Error indexing ${entry.path}:`, error);
                }
            }));
        }
        await this.saveIndex(index);
        const duration = Date.now() - startTime;
        console.log(`[CodeEditorApi] Index built: ${Object.keys(index).length} elements from ${processedCount} files in ${duration}ms`);
    }
    async deleteFile(path) {
        await super.deleteFile(path);
        if (this.isJsxFile(path)) {
            const index = await this.loadIndex();
            let hasChanges = false;
            for (const [oid, metadata] of Object.entries(index)) {
                if ((0, utility_1.pathsEqual)(metadata.path, path)) {
                    delete index[oid];
                    hasChanges = true;
                }
            }
            if (hasChanges) {
                await this.saveIndex(index);
            }
        }
    }
    async moveFile(oldPath, newPath) {
        await super.moveFile(oldPath, newPath);
        if (this.isJsxFile(oldPath) && this.isJsxFile(newPath)) {
            const index = await this.loadIndex();
            let hasChanges = false;
            for (const metadata of Object.values(index)) {
                if ((0, utility_1.pathsEqual)(metadata.path, oldPath)) {
                    metadata.path = newPath;
                    hasChanges = true;
                }
            }
            if (hasChanges) {
                await this.saveIndex(index);
            }
        }
    }
    async loadIndex() {
        return (0, index_cache_1.getOrLoadIndex)(this.getCacheKey(), this.indexPath, (path) => this.readFile(path));
    }
    async saveIndex(index) {
        (0, index_cache_1.saveIndexToCache)(this.getCacheKey(), index);
        void this.debouncedSaveIndexToFile();
    }
    async undobounceSaveIndexToFile() {
        try {
            await this.createDirectory(constants_1.ONLOOK_CACHE_DIRECTORY);
        }
        catch {
            console.warn(`[CodeEditorApi] Failed to create ${constants_1.ONLOOK_CACHE_DIRECTORY} directory`);
        }
        const index = (0, index_cache_1.getIndexFromCache)(this.getCacheKey());
        if (index) {
            await super.writeFile(this.indexPath, JSON.stringify(index));
        }
    }
    debouncedSaveIndexToFile = (0, lodash_debounce_1.default)(this.undobounceSaveIndexToFile, 1000);
    isJsxFile(path) {
        // Exclude the onlook preload script from JSX processing
        if (path.endsWith(constants_1.ONLOOK_PRELOAD_SCRIPT_FILE)) {
            return false;
        }
        return /\.(jsx?|tsx?)$/i.test(path);
    }
    async cleanup() {
        const cacheKey = this.getCacheKey();
        if ((0, index_cache_1.getIndexFromCache)(cacheKey)) {
            await this.undobounceSaveIndexToFile();
        }
        (0, index_cache_1.clearIndexCache)(cacheKey);
    }
    getCacheKey() {
        return `${this.projectId}/${this.branchId}`;
    }
}
exports.CodeFileSystem = CodeFileSystem;
//# sourceMappingURL=code-fs.js.map