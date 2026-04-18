"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@onlook/models/constants");
const run_1 = require("@onlook/models/run");
const watcher_1 = require("@parcel/watcher");
const __1 = require("..");
const analytics_1 = require("../analytics");
const files_1 = require("../code/files");
const cleanup_1 = require("./cleanup");
const helpers_1 = require("./helpers");
const setup_1 = require("./setup");
const terminal_1 = __importDefault(require("./terminal"));
class RunManager {
    static instance;
    mapping = new Map();
    subscription = null;
    selfModified = new Set();
    state = run_1.RunState.STOPPED;
    runningDirs = new Set();
    createdFiles = new Set();
    constructor() {
        this.mapping = new Map();
    }
    static getInstance() {
        if (!RunManager.instance) {
            RunManager.instance = new RunManager();
        }
        return RunManager.instance;
    }
    async restart(id, folderPath, command) {
        const stopped = await this.stop(id, folderPath);
        if (!stopped) {
            return false;
        }
        this.setState(run_1.RunState.STOPPED, 'Stopped.');
        const res = await this.start(id, folderPath, command);
        (0, analytics_1.sendAnalytics)('run restarted', {
            success: res,
        });
        return res;
    }
    async start(id, folderPath, command) {
        try {
            if (this.state === run_1.RunState.RUNNING) {
                this.setState(run_1.RunState.ERROR, 'Failed to run. Already running.');
                return false;
            }
            this.setState(run_1.RunState.SETTING_UP, 'Setting up...');
            this.mapping.clear();
            await this.addIdsToDirectoryAndCreateMapping(folderPath);
            await this.listen(folderPath);
            this.setState(run_1.RunState.RUNNING, 'Running...');
            this.startTerminal(id, folderPath, command);
            this.runningDirs.add(folderPath);
            (0, analytics_1.sendAnalytics)('run started', {
                command,
            });
            return true;
        }
        catch (error) {
            const errorMessage = `Failed to setup: ${error}`;
            console.error(errorMessage);
            this.setState(run_1.RunState.ERROR, errorMessage);
            return false;
        }
    }
    async stop(id, folderPath) {
        try {
            this.setState(run_1.RunState.STOPPING, 'Stopping terminal...');
            this.stopTerminal(id);
            this.setState(run_1.RunState.STOPPING, 'Cleaning up...');
            await this.cleanProjectDir(folderPath);
            await this.stopAll();
            this.setState(run_1.RunState.STOPPED, 'Stopped.');
            (0, analytics_1.sendAnalytics)('run stopped');
            return true;
        }
        catch (error) {
            const errorMessage = `Failed to stop: ${error}`;
            console.error(errorMessage);
            this.setState(run_1.RunState.ERROR, errorMessage);
            return false;
        }
    }
    getTemplateNode(id) {
        return this.mapping.get(id);
    }
    setState(state, message) {
        this.state = state;
        __1.mainWindow?.webContents.send(constants_1.MainChannels.RUN_STATE_CHANGED, {
            state,
            message,
        });
        if (state === run_1.RunState.ERROR) {
            (0, analytics_1.sendAnalytics)('run error', {
                message,
            });
        }
    }
    startTerminal(id, folderPath, command) {
        terminal_1.default.create(id, { cwd: folderPath });
        terminal_1.default.executeCommand(id, command);
        (0, analytics_1.sendAnalytics)('terminal started', {
            command,
        });
    }
    stopTerminal(id) {
        terminal_1.default.kill(id);
        (0, analytics_1.sendAnalytics)('terminal stopped');
    }
    async listen(folderPath) {
        if (this.subscription) {
            await this.subscription.unsubscribe();
            this.subscription = null;
        }
        const ignoredDirectories = helpers_1.IGNORED_DIRECTORIES.map((dir) => `**/${dir}/**`);
        this.subscription = await (0, watcher_1.subscribe)(folderPath, async (err, events) => {
            if (err) {
                console.error(`Watcher error: ${err}`);
                return;
            }
            for (const event of events) {
                if (this.selfModified.has(event.path)) {
                    this.selfModified.delete(event.path);
                    continue;
                }
                if (event.type === 'update' || event.type === 'create') {
                    if (this.isAllowedExtension(event.path)) {
                        this.selfModified.add(event.path);
                        await this.processFileForMapping(event.path);
                    }
                }
            }
        }, {
            ignore: ['**/node_modules/**', '**/.git/**', ...ignoredDirectories],
        });
    }
    isAllowedExtension(path) {
        return helpers_1.ALLOWED_EXTENSIONS.some((ext) => path.endsWith(ext));
    }
    async addIdsToDirectoryAndCreateMapping(dirPath) {
        const filePaths = await (0, helpers_1.getValidFiles)(dirPath);
        for (const filePath of filePaths) {
            await this.processFileForMapping(filePath);
        }
        return filePaths;
    }
    async processFileForMapping(filePath) {
        const content = await (0, setup_1.getFileWithIds)(filePath);
        if (!content || content.trim() === '') {
            console.error(`Failed to get content for file: ${filePath}`);
            return;
        }
        const newMapping = (0, setup_1.createMappingFromContent)(content, filePath);
        if (!newMapping) {
            console.error(`Failed to create mapping for file: ${filePath}`);
            return;
        }
        await (0, files_1.writeFile)(filePath, content);
        for (const [key, value] of Object.entries(newMapping)) {
            this.mapping.set(key, value);
        }
        return newMapping;
    }
    async stopAll() {
        for (const dir of this.runningDirs) {
            await this.cleanProjectDir(dir);
        }
        await this.clearSubscription();
        this.runningDirs.clear();
        this.mapping.clear();
        this.selfModified.clear();
    }
    async cleanProjectDir(folderPath) {
        await (0, cleanup_1.removeIdsFromDirectory)(folderPath);
        this.runningDirs.delete(folderPath);
    }
    async clearSubscription() {
        if (this.subscription) {
            await this.subscription.unsubscribe();
            this.subscription = null;
        }
        this.createdFiles.clear();
    }
}
exports.default = RunManager.getInstance();
//# sourceMappingURL=index.js.map