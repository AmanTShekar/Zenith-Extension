"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateManager = void 0;
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
const utils_1 = require("../utils");
class UpdateManager {
    updateAvailable = false;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
        this.listen();
    }
    listen() {
        window.api.on(constants_1.MainChannels.UPDATE_DOWNLOADED, async (e, args) => {
            this.updateAvailable = true;
        });
        window.api.on(constants_1.MainChannels.UPDATE_NOT_AVAILABLE, async (e, args) => {
            this.updateAvailable = false;
        });
    }
    quitAndInstall() {
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.QUIT_AND_INSTALL);
    }
}
exports.UpdateManager = UpdateManager;
//# sourceMappingURL=index.js.map