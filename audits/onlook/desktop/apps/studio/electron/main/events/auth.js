"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForAuthMessages = listenForAuthMessages;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const auth_1 = require("../auth");
function listenForAuthMessages() {
    electron_1.ipcMain.handle(constants_1.MainChannels.SIGN_IN, (e, args) => {
        (0, auth_1.signIn)(args.provider);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.SIGN_OUT, (e, args) => {
        (0, auth_1.signOut)();
    });
}
//# sourceMappingURL=auth.js.map