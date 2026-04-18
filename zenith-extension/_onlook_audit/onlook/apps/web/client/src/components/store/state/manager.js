"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = void 0;
const models_1 = require("@onlook/models");
const mobx_1 = require("mobx");
class StateManager {
    isSubscriptionModalOpen = false;
    isSettingsModalOpen = false;
    settingsTab = models_1.SettingsTabValue.SITE;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
    }
}
exports.StateManager = StateManager;
//# sourceMappingURL=manager.js.map