"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunManager = void 0;
const constants_1 = require("@onlook/models/constants");
const run_1 = require("@onlook/models/run");
const mobx_1 = require("mobx");
const utils_1 = require("../utils");
const port_1 = require("./port");
class RunManager {
    editorEngine;
    project;
    portManager;
    _state = run_1.RunState.STOPPED;
    message = null;
    isLoading = false;
    previousState = run_1.RunState.STOPPED;
    cleanupLoadingTimer;
    constructor(editorEngine, project) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
        this.project = project;
        this.portManager = new port_1.PortManager(this, project);
        this.restoreState();
        this.listenForStateChanges();
    }
    updateProject(project) {
        this.project = project;
        this.portManager.updateProject(project);
    }
    get isRunning() {
        return this.state === run_1.RunState.RUNNING;
    }
    get isStopped() {
        return this.state === run_1.RunState.STOPPED;
    }
    get isStarting() {
        return this.state === run_1.RunState.SETTING_UP || this.isLoading;
    }
    get isError() {
        return this.state === run_1.RunState.ERROR;
    }
    get port() {
        return this.portManager;
    }
    get state() {
        return this._state;
    }
    set state(state) {
        if (this.previousState === state) {
            return;
        }
        this.previousState = this._state;
        this._state = state;
    }
    async startIfPortAvailable() {
        const isPortAvailable = await this.portManager.checkPort();
        if (isPortAvailable) {
            this.start();
        }
    }
    async start() {
        this.state = run_1.RunState.SETTING_UP;
        this.startLoadingTimer();
        return await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.RUN_START, {
            id: this.project.id,
            folderPath: this.project.folderPath,
            command: this.project.commands?.run || constants_1.DefaultSettings.COMMANDS.run,
        });
    }
    startLoadingTimer() {
        // Cleanup any existing timer
        if (this.cleanupLoadingTimer) {
            this.cleanupLoadingTimer();
        }
        this.isLoading = true;
        const minLoadingDuration = 5000;
        const maxLoadingDuration = 15000;
        const gracePeriod = 3000;
        const startTime = Date.now();
        let consecutiveReadyChecks = 0;
        let graceTimeout;
        const checkInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const isRunnerReady = this.state === run_1.RunState.RUNNING || this.state === run_1.RunState.ERROR;
            if (isRunnerReady) {
                consecutiveReadyChecks++;
            }
            else {
                consecutiveReadyChecks = 0;
            }
            if (consecutiveReadyChecks >= 2 && elapsedTime >= minLoadingDuration) {
                graceTimeout = setTimeout(() => {
                    this.isLoading = false;
                }, gracePeriod);
                clearInterval(checkInterval);
                return;
            }
            if (elapsedTime >= maxLoadingDuration) {
                this.isLoading = false;
                clearInterval(checkInterval);
            }
        }, 100);
        this.cleanupLoadingTimer = () => {
            clearInterval(checkInterval);
            if (graceTimeout) {
                clearTimeout(graceTimeout);
            }
        };
    }
    async stop() {
        return await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.RUN_STOP, {
            id: this.project.id,
            folderPath: this.project.folderPath,
        });
    }
    async restart() {
        return await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.RUN_RESTART, {
            id: this.project.id,
            folderPath: this.project.folderPath,
            command: this.project.commands?.run || constants_1.DefaultSettings.COMMANDS.run,
        });
    }
    async restoreState() {
        const state = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_RUN_STATE, {
            id: this.project.id,
        });
        this.state = state;
    }
    async listenForStateChanges() {
        window.api.on(constants_1.MainChannels.RUN_STATE_CHANGED, async (args) => {
            const { state, message } = args;
            this.state = state;
            this.message = message;
            if (state === run_1.RunState.ERROR) {
                this.editorEngine.errors.addTerminalError(message);
            }
        });
        (0, mobx_1.reaction)(() => this.editorEngine.errors.errors, (errors) => {
            if (errors.length > 0) {
                this.state = run_1.RunState.ERROR;
            }
            else {
                this.state = this.previousState;
            }
        });
    }
    handleTerminalInput(data) {
        return (0, utils_1.invokeMainChannel)(constants_1.MainChannels.TERMINAL_INPUT, {
            id: this.project.id,
            data,
        });
    }
    resizeTerminal(cols, rows) {
        return (0, utils_1.invokeMainChannel)(constants_1.MainChannels.TERMINAL_RESIZE, {
            id: this.project.id,
            cols,
            rows,
        });
    }
    getHistory() {
        return (0, utils_1.invokeMainChannel)(constants_1.MainChannels.TERMINAL_GET_HISTORY, {
            id: this.project.id,
        });
    }
    async dispose() {
        if (this.cleanupLoadingTimer) {
            this.cleanupLoadingTimer();
        }
        await this.stop();
        this.portManager.dispose();
    }
}
exports.RunManager = RunManager;
//# sourceMappingURL=run.js.map