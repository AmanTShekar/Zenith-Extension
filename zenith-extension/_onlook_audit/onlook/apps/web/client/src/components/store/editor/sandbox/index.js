"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxManager = exports.PreloadScriptState = void 0;
const sync_engine_1 = require("@/services/sync-engine/sync-engine");
const constants_1 = require("@onlook/constants");
const mobx_1 = require("mobx");
const git_1 = require("../git");
const helper_1 = require("../pages/helper");
const preload_script_1 = require("./preload-script");
const session_1 = require("./session");
var PreloadScriptState;
(function (PreloadScriptState) {
    PreloadScriptState["NOT_INJECTED"] = "not-injected";
    PreloadScriptState["LOADING"] = "loading";
    PreloadScriptState["INJECTED"] = "injected";
})(PreloadScriptState || (exports.PreloadScriptState = PreloadScriptState = {}));
class SandboxManager {
    branch;
    editorEngine;
    errorManager;
    fs;
    session;
    gitManager;
    providerReactionDisposer;
    sync = null;
    preloadScriptState = PreloadScriptState.NOT_INJECTED;
    routerConfig = null;
    constructor(branch, editorEngine, errorManager, fs) {
        this.branch = branch;
        this.editorEngine = editorEngine;
        this.errorManager = errorManager;
        this.fs = fs;
        this.session = new session_1.SessionManager(this.branch, this.errorManager);
        this.gitManager = new git_1.GitManager(this);
        (0, mobx_1.makeAutoObservable)(this);
    }
    async init() {
        // Start connection asynchronously (don't wait)
        if (!this.session.provider) {
            this.session.start(this.branch.sandbox.id).catch(err => {
                console.error('[SandboxManager] Initial connection failed:', err);
                // Don't throw - let reaction handle retries/reconnects
            });
        }
        // React to provider becoming available (now or later)
        this.providerReactionDisposer = (0, mobx_1.reaction)(() => this.session.provider, async (provider) => {
            if (provider) {
                await this.initializeSyncEngine(provider);
                await this.gitManager.init();
            }
            else if (this.sync) {
                // If the provider is null, release the sync engine reference
                this.sync.release();
                this.sync = null;
            }
        }, { fireImmediately: true });
    }
    async getRouterConfig() {
        if (!!this.routerConfig) {
            return this.routerConfig;
        }
        if (!this.session.provider) {
            throw new Error('Provider not initialized');
        }
        this.routerConfig = await (0, helper_1.detectRouterConfig)(this.session.provider);
        return this.routerConfig;
    }
    async initializeSyncEngine(provider) {
        if (this.sync) {
            this.sync.release();
            this.sync = null;
        }
        this.sync = sync_engine_1.CodeProviderSync.getInstance(provider, this.fs, this.branch.sandbox.id, {
            exclude: constants_1.EXCLUDED_SYNC_PATHS,
        });
        await this.sync.start();
        await this.ensurePreloadScriptExists();
        await this.fs.rebuildIndex();
    }
    async ensurePreloadScriptExists() {
        try {
            if (this.preloadScriptState !== PreloadScriptState.NOT_INJECTED) {
                return;
            }
            this.preloadScriptState = PreloadScriptState.LOADING;
            if (!this.session.provider) {
                throw new Error('No provider available for preload script injection');
            }
            const routerConfig = await this.getRouterConfig();
            if (!routerConfig) {
                throw new Error('No router config found for preload script injection');
            }
            await (0, preload_script_1.copyPreloadScriptToPublic)(this.session.provider, routerConfig);
            this.preloadScriptState = PreloadScriptState.INJECTED;
        }
        catch (error) {
            console.error('[SandboxManager] Failed to ensure preload script exists:', error);
            // Mark as injected to prevent blocking frames indefinitely
            // Frames will handle the missing preload script gracefully
            this.preloadScriptState = PreloadScriptState.NOT_INJECTED;
        }
    }
    async getLayoutPath() {
        const routerConfig = await this.getRouterConfig();
        if (!routerConfig) {
            return null;
        }
        return (0, preload_script_1.getLayoutPath)(routerConfig, (path) => this.fileExists(path));
    }
    get errors() {
        return this.errorManager.errors;
    }
    get syncEngine() {
        return this.sync;
    }
    async readFile(path) {
        if (!this.fs)
            throw new Error('File system not initialized');
        return this.fs.readFile(path);
    }
    async writeFile(path, content) {
        if (!this.fs)
            throw new Error('File system not initialized');
        return this.fs.writeFile(path, content);
    }
    listAllFiles() {
        if (!this.fs)
            throw new Error('File system not initialized');
        return this.fs.listAll();
    }
    async readDir(dir) {
        if (!this.fs)
            throw new Error('File system not initialized');
        return this.fs.readDirectory(dir);
    }
    async listFilesRecursively(dir) {
        if (!this.fs)
            throw new Error('File system not initialized');
        return this.fs.listFiles(dir);
    }
    async fileExists(path) {
        if (!this.fs)
            throw new Error('File system not initialized');
        return this.fs?.exists(path);
    }
    async copyFile(path, targetPath) {
        if (!this.fs)
            throw new Error('File system not initialized');
        return this.fs.copyFile(path, targetPath);
    }
    async copyDirectory(path, targetPath) {
        if (!this.fs)
            throw new Error('File system not initialized');
        return this.fs.copyDirectory(path, targetPath);
    }
    async deleteFile(path) {
        if (!this.fs)
            throw new Error('File system not initialized');
        return this.fs.deleteFile(path);
    }
    async deleteDirectory(path) {
        if (!this.fs)
            throw new Error('File system not initialized');
        return this.fs.deleteDirectory(path);
    }
    async rename(oldPath, newPath) {
        if (!this.fs)
            throw new Error('File system not initialized');
        return this.fs.moveFile(oldPath, newPath);
    }
    // Download the code as a zip
    async downloadFiles(projectName) {
        if (!this.session.provider) {
            console.error('No sandbox provider found for download');
            return null;
        }
        try {
            const { url } = await this.session.provider.downloadFiles({
                args: {
                    path: './',
                },
            });
            return {
                // in case there is no URL provided then the code must be updated
                // to handle this case
                downloadUrl: url ?? '',
                fileName: `${projectName ?? 'onlook-project'}-${Date.now()}.zip`,
            };
        }
        catch (error) {
            console.error('Error generating download URL:', error);
            return null;
        }
    }
    clear() {
        this.providerReactionDisposer?.();
        this.providerReactionDisposer = undefined;
        this.sync?.release();
        this.sync = null;
        this.preloadScriptState = PreloadScriptState.NOT_INJECTED;
        this.session.clear();
    }
}
exports.SandboxManager = SandboxManager;
//# sourceMappingURL=index.js.map