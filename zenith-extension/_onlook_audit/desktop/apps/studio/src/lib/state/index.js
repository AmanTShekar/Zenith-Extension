"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppStateManager = void 0;
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
class AppStateManager {
    cleaningUp = false;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
        this.listenForAppStateChanges();
    }
    listenForAppStateChanges() {
        window.api.on(constants_1.MainChannels.CLEAN_UP_BEFORE_QUIT, async (e, args) => {
            this.cleaningUp = true;
        });
    }
}
exports.AppStateManager = AppStateManager;
//# sourceMappingURL=index.js.map