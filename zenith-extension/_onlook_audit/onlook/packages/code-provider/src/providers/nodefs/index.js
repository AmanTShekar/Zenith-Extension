"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeFsCommand = exports.NodeFsTask = exports.NodeFsTerminal = exports.NodeFsFileWatcher = exports.NodeFsProvider = void 0;
const types_1 = require("../../types");
class NodeFsProvider extends types_1.Provider {
    options;
    constructor(options) {
        super();
        this.options = options;
    }
    async initialize(input) {
        return {};
    }
    async writeFile(input) {
        return {
            success: true,
        };
    }
    async renameFile(input) {
        return {};
    }
    async statFile(input) {
        return {
            type: 'file',
        };
    }
    async deleteFiles(input) {
        return {};
    }
    async listFiles(input) {
        return {
            files: [],
        };
    }
    async readFile(input) {
        return {
            file: {
                path: input.args.path,
                content: '',
                type: 'text',
                toString: () => {
                    return '';
                },
            },
        };
    }
    async downloadFiles(input) {
        return {
            url: '',
        };
    }
    async copyFiles(input) {
        return {};
    }
    async createDirectory(input) {
        return {};
    }
    async watchFiles(input) {
        return {
            watcher: new NodeFsFileWatcher(),
        };
    }
    async createTerminal(input) {
        return {
            terminal: new NodeFsTerminal(),
        };
    }
    async getTask(input) {
        return {
            task: new NodeFsTask(),
        };
    }
    async runCommand(input) {
        return {
            output: '',
        };
    }
    async runBackgroundCommand(input) {
        return {
            command: new NodeFsCommand(),
        };
    }
    async gitStatus(input) {
        return {
            changedFiles: [],
        };
    }
    async setup(input) {
        return {};
    }
    async createSession(input) {
        return {};
    }
    async reload() {
        // TODO: Implement
        return true;
    }
    async reconnect() {
        // TODO: Implement
    }
    async ping() {
        return true;
    }
    static async createProject(input) {
        return {
            id: input.id,
        };
    }
    static async createProjectFromGit(input) {
        throw new Error('createProjectFromGit not implemented for NodeFs provider');
    }
    async pauseProject(input) {
        return {};
    }
    async stopProject(input) {
        return {};
    }
    async listProjects(input) {
        return {};
    }
    async destroy() {
        // TODO: Implement
    }
}
exports.NodeFsProvider = NodeFsProvider;
class NodeFsFileWatcher extends types_1.ProviderFileWatcher {
    start(input) {
        return Promise.resolve();
    }
    stop() {
        return Promise.resolve();
    }
    registerEventCallback(callback) {
        // TODO: Implement
    }
}
exports.NodeFsFileWatcher = NodeFsFileWatcher;
class NodeFsTerminal extends types_1.ProviderTerminal {
    get id() {
        return 'unimplemented';
    }
    get name() {
        return 'unimplemented';
    }
    open() {
        return Promise.resolve('');
    }
    write() {
        return Promise.resolve();
    }
    run() {
        return Promise.resolve();
    }
    kill() {
        return Promise.resolve();
    }
    onOutput(callback) {
        return () => { };
    }
}
exports.NodeFsTerminal = NodeFsTerminal;
class NodeFsTask extends types_1.ProviderTask {
    get id() {
        return 'unimplemented';
    }
    get name() {
        return 'unimplemented';
    }
    get command() {
        return 'unimplemented';
    }
    open() {
        return Promise.resolve('');
    }
    run() {
        return Promise.resolve();
    }
    restart() {
        return Promise.resolve();
    }
    stop() {
        return Promise.resolve();
    }
    onOutput(callback) {
        return () => { };
    }
}
exports.NodeFsTask = NodeFsTask;
class NodeFsCommand extends types_1.ProviderBackgroundCommand {
    get name() {
        return 'unimplemented';
    }
    get command() {
        return 'unimplemented';
    }
    open() {
        return Promise.resolve('');
    }
    restart() {
        return Promise.resolve();
    }
    kill() {
        return Promise.resolve();
    }
    onOutput(callback) {
        return () => { };
    }
}
exports.NodeFsCommand = NodeFsCommand;
//# sourceMappingURL=index.js.map