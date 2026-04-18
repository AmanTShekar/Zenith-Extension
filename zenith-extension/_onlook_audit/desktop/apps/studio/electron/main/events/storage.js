"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForStorageMessages = listenForStorageMessages;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const analytics_1 = __importDefault(require("../analytics"));
const auth_1 = require("../auth");
const storage_1 = require("../storage");
function listenForStorageMessages() {
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_USER_SETTINGS, (e) => {
        return storage_1.PersistentStorage.USER_SETTINGS.read();
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.UPDATE_USER_SETTINGS, (e, args) => {
        storage_1.PersistentStorage.USER_SETTINGS.update(args);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_USER_METADATA, (e) => {
        return storage_1.PersistentStorage.USER_METADATA.read();
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.UPDATE_USER_METADATA, (e, args) => {
        storage_1.PersistentStorage.USER_METADATA.update(args);
        analytics_1.default.updateUserMetadata(args);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_APP_STATE, (e) => {
        return storage_1.PersistentStorage.APP_STATE.read();
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.IS_USER_SIGNED_IN, (e) => {
        return (0, auth_1.getRefreshedAuthTokens)();
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.REPLACE_APP_STATE, (e, args) => {
        storage_1.PersistentStorage.APP_STATE.replace(args);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_PROJECTS, (e) => {
        return storage_1.PersistentStorage.PROJECTS.read();
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.UPDATE_PROJECTS, (e, args) => {
        storage_1.PersistentStorage.PROJECTS.update(args);
    });
}
//# sourceMappingURL=storage.js.map