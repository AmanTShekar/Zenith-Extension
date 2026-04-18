"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodesandboxBackgroundCommand = exports.CodesandboxTask = exports.CodesandboxTerminal = exports.CodesandboxFileWatcher = exports.CodesandboxProvider = void 0;
const sdk_1 = require("@codesandbox/sdk");
const browser_1 = require("@codesandbox/sdk/browser");
const types_1 = require("../../types");
const list_files_1 = require("./utils/list-files");
const read_file_1 = require("./utils/read-file");
const write_file_1 = require("./utils/write-file");
class CodesandboxProvider extends types_1.Provider {
    options;
    sandbox = null;
    _client = null;
    constructor(options) {
        super();
        this.options = options;
    }
    // may be removed in the future once the code completely interfaces through the provider
    get client() {
        return this._client;
    }
    async initialize(input) {
        if (!this.options.sandboxId) {
            return {};
        }
        if (this.options.getSession) {
            const session = await this.options.getSession(this.options.sandboxId, this.options.userId);
            if (this.options.initClient) {
                this._client = await (0, browser_1.connectToSandbox)({
                    session,
                    getSession: async (id) => (await this.options.getSession?.(id, this.options.userId)) || null,
                });
                this._client.keepActiveWhileConnected(this.options.keepActiveWhileConnected ?? true);
            }
        }
        else {
            // backend path, use environment variables
            const sdk = new sdk_1.CodeSandbox();
            this.sandbox = await sdk.sandboxes.resume(this.options.sandboxId);
            if (this.options.initClient) {
                this._client = await this.sandbox.connect();
            }
        }
        return {};
    }
    async reload() {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        const task = await this.client?.tasks.get('dev');
        if (task) {
            await task.restart();
            return true;
        }
        return false;
    }
    async reconnect() {
        // TODO: Implement
    }
    async ping() {
        try {
            await this.client?.commands.run('echo "ping"');
            return true;
        }
        catch (error) {
            console.error('Failed to ping sandbox', error);
            return false;
        }
    }
    async destroy() {
        await this.client?.disconnect();
        this._client = null;
        this.sandbox = null;
    }
    static async createProject(input) {
        const sdk = new sdk_1.CodeSandbox();
        const newSandbox = await sdk.sandboxes.create({
            id: input.id,
            source: 'template',
            title: input.title,
            description: input.description,
            tags: input.tags,
        });
        return {
            id: newSandbox.id,
        };
    }
    static async createProjectFromGit(input) {
        const sdk = new sdk_1.CodeSandbox();
        const TIMEOUT_MS = 30000;
        const createPromise = sdk.sandboxes.create({
            source: 'git',
            url: input.repoUrl,
            branch: input.branch,
            async setup(session) {
                await session.setup.run();
            },
        });
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Repository access timeout')), TIMEOUT_MS);
        });
        const newSandbox = await Promise.race([createPromise, timeoutPromise]);
        return {
            id: newSandbox.id,
        };
    }
    async pauseProject(input) {
        if (this.sandbox && this.options.sandboxId) {
            const sdk = new sdk_1.CodeSandbox();
            await sdk.sandboxes.hibernate(this.options.sandboxId);
        }
        return {};
    }
    async stopProject(input) {
        if (this.sandbox && this.options.sandboxId) {
            const sdk = new sdk_1.CodeSandbox();
            await sdk.sandboxes.shutdown(this.options.sandboxId);
        }
        return {};
    }
    async listProjects(input) {
        if (this.sandbox) {
            const sdk = new sdk_1.CodeSandbox();
            const projects = await sdk.sandboxes.list();
            return {
                projects: projects.sandboxes.map((project) => ({
                    id: project.id,
                    name: project.title,
                    description: project.description,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt,
                })),
            };
        }
        return { projects: [] };
    }
    async writeFile(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        return (0, write_file_1.writeFile)(this.client, input);
    }
    async renameFile(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        await this.client.fs.rename(input.args.oldPath, input.args.newPath);
        return {};
    }
    async statFile(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        const res = await this.client.fs.stat(input.args.path);
        return {
            type: res.type,
            isSymlink: res.isSymlink,
            size: res.size,
            mtime: res.mtime,
            ctime: res.ctime,
            atime: res.atime,
        };
    }
    async deleteFiles(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        await this.client.fs.remove(input.args.path, input.args.recursive);
        return {};
    }
    async listFiles(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        return (0, list_files_1.listFiles)(this.client, input);
    }
    async readFile(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        return (0, read_file_1.readFile)(this.client, input);
    }
    async downloadFiles(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        const res = await this.client.fs.download(input.args.path);
        return {
            url: res.downloadUrl,
        };
    }
    async copyFiles(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        await this.client.fs.copy(input.args.sourcePath, input.args.targetPath, input.args.recursive, input.args.overwrite);
        return {};
    }
    async createDirectory(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        await this.client.fs.mkdir(input.args.path);
        return {};
    }
    async watchFiles(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        const watcher = new CodesandboxFileWatcher(this.client);
        await watcher.start(input);
        if (input.onFileChange) {
            watcher.registerEventCallback(async (event) => {
                if (input.onFileChange) {
                    await input.onFileChange({
                        type: event.type,
                        paths: event.paths,
                    });
                }
            });
        }
        return {
            watcher,
        };
    }
    async createTerminal(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        const csTerminal = await this.client.terminals.create();
        return {
            terminal: new CodesandboxTerminal(csTerminal),
        };
    }
    async getTask(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        const task = this.client.tasks.get(input.args.id);
        if (!task) {
            throw new Error(`Task ${input.args.id} not found`);
        }
        return {
            task: new CodesandboxTask(task),
        };
    }
    async runCommand({ args }) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        const output = await this.client.commands.run(args.command);
        return {
            output,
        };
    }
    async runBackgroundCommand(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        const command = await this.client.commands.runBackground(input.args.command);
        return {
            command: new CodesandboxBackgroundCommand(command),
        };
    }
    async gitStatus(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        const status = await this.client.git.status();
        return {
            changedFiles: status.changedFiles,
        };
    }
    async setup(input) {
        if (!this.client) {
            throw new Error('Client not initialized');
        }
        await this.client.setup.run();
        await this.client.setup.waitUntilComplete();
        return {};
    }
    async createSession(input) {
        if (!this.sandbox) {
            throw new Error('Client not initialized');
        }
        return this.sandbox.createBrowserSession({
            id: input.args.id,
        });
    }
}
exports.CodesandboxProvider = CodesandboxProvider;
class CodesandboxFileWatcher extends types_1.ProviderFileWatcher {
    client;
    watcher = null;
    constructor(client) {
        super();
        this.client = client;
    }
    async start(input) {
        this.watcher = await this.client.fs.watch(input.args.path, {
            recursive: input.args.recursive,
            excludes: input.args.excludes || [],
        });
    }
    registerEventCallback(callback) {
        if (!this.watcher) {
            throw new Error('Watcher not initialized');
        }
        this.watcher.onEvent(callback);
    }
    async stop() {
        if (!this.watcher) {
            throw new Error('Watcher not initialized');
        }
        this.watcher.dispose();
        this.watcher = null;
    }
}
exports.CodesandboxFileWatcher = CodesandboxFileWatcher;
class CodesandboxTerminal extends types_1.ProviderTerminal {
    _terminal;
    constructor(_terminal) {
        super();
        this._terminal = _terminal;
    }
    get id() {
        return this._terminal.id;
    }
    get name() {
        return this._terminal.name;
    }
    open(dimensions) {
        return this._terminal.open(dimensions);
    }
    write(input, dimensions) {
        return this._terminal.write(input, dimensions);
    }
    run(input, dimensions) {
        return this._terminal.run(input, dimensions);
    }
    kill() {
        return this._terminal.kill();
    }
    onOutput(callback) {
        const disposable = this._terminal.onOutput(callback);
        return () => {
            disposable.dispose();
        };
    }
}
exports.CodesandboxTerminal = CodesandboxTerminal;
class CodesandboxTask extends types_1.ProviderTask {
    _task;
    constructor(_task) {
        super();
        this._task = _task;
    }
    get id() {
        return this._task.id;
    }
    get name() {
        return this._task.name;
    }
    get command() {
        return this._task.command;
    }
    open() {
        return this._task.open();
    }
    run() {
        return this._task.run();
    }
    restart() {
        return this._task.restart();
    }
    stop() {
        return this._task.stop();
    }
    onOutput(callback) {
        const disposable = this._task.onOutput(callback);
        return () => {
            disposable.dispose();
        };
    }
}
exports.CodesandboxTask = CodesandboxTask;
class CodesandboxBackgroundCommand extends types_1.ProviderBackgroundCommand {
    _command;
    constructor(_command) {
        super();
        this._command = _command;
    }
    get name() {
        return this._command.name;
    }
    get command() {
        return this._command.command;
    }
    open() {
        return this._command.open();
    }
    restart() {
        return this._command.restart();
    }
    kill() {
        return this._command.kill();
    }
    onOutput(callback) {
        const disposable = this._command.onOutput(callback);
        return () => {
            disposable.dispose();
        };
    }
}
exports.CodesandboxBackgroundCommand = CodesandboxBackgroundCommand;
//# sourceMappingURL=index.js.map