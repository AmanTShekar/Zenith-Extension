"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortManager = void 0;
const models_1 = require("@onlook/models");
const mobx_1 = require("mobx");
const utils_1 = require("../utils");
class PortManager {
    runManager;
    project;
    isPortAvailable = true;
    suggestedPort = 3000;
    currentPort = 3000;
    portCheckInterval = null;
    constructor(runManager, project) {
        this.runManager = runManager;
        this.project = project;
        (0, mobx_1.makeAutoObservable)(this);
        this.currentPort = this.getPortFromProject();
        this.listenForPortChanges();
        (0, mobx_1.reaction)(() => this.runManager.state, () => {
            if (this.runManager.state !== models_1.RunState.STOPPED) {
                this.isPortAvailable = true;
            }
        });
    }
    listenForPortChanges() {
        this.clearPortCheckInterval();
        this.portCheckInterval = setInterval(async () => {
            await this.checkPort();
        }, 3000);
    }
    getPortFromProject() {
        try {
            const url = this.project.url;
            const urlObj = new URL(url);
            return parseInt(urlObj.port, 10);
        }
        catch (error) {
            console.error('Failed to get port from project:', error);
            return 3000;
        }
    }
    updateProject(project) {
        this.project = project;
        this.currentPort = this.getPortFromProject();
    }
    async checkPort() {
        if (this.runManager.state !== models_1.RunState.STOPPED) {
            this.isPortAvailable = true;
            return this.isPortAvailable;
        }
        const response = await (0, utils_1.invokeMainChannel)(models_1.MainChannels.IS_PORT_AVAILABLE, {
            port: this.currentPort,
        });
        this.isPortAvailable = response.isPortAvailable;
        this.suggestedPort = response.availablePort;
        return this.isPortAvailable;
    }
    clearPortCheckInterval() {
        if (this.portCheckInterval) {
            clearInterval(this.portCheckInterval);
            this.portCheckInterval = null;
        }
    }
    dispose() {
        this.clearPortCheckInterval();
    }
}
exports.PortManager = PortManager;
//# sourceMappingURL=port.js.map