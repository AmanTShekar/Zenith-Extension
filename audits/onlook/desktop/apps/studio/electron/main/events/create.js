"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForCreateMessages = listenForCreateMessages;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const __1 = require("..");
const create_1 = __importDefault(require("../create"));
const helpers_1 = require("../create/helpers");
const install_1 = require("../create/install");
const setup_1 = require("../create/setup");
function listenForCreateMessages() {
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_CREATE_PROJECT_PATH, (e) => {
        return (0, helpers_1.getCreateProjectPath)();
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.CREATE_NEW_PROJECT, (e, args) => {
        const progressCallback = (stage, message) => {
            __1.mainWindow?.webContents.send(constants_1.MainChannels.CREATE_NEW_PROJECT_CALLBACK, {
                stage,
                message,
            });
        };
        const { name, path } = args;
        return (0, install_1.createProject)(name, path, progressCallback);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.INSTALL_PROJECT_DEPENDENCIES, (e, args) => {
        const progressCallback = (stage, message) => {
            __1.mainWindow?.webContents.send(constants_1.MainChannels.SETUP_PROJECT_CALLBACK, {
                stage,
                message,
            });
        };
        const { folderPath, installCommand } = args;
        return (0, setup_1.installProjectDependencies)(folderPath, installCommand, progressCallback);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.REINSTALL_PROJECT_DEPENDENCIES, (e, args) => {
        const progressCallback = (stage, message) => {
            __1.mainWindow?.webContents.send(constants_1.MainChannels.SETUP_PROJECT_CALLBACK, {
                stage,
                message,
            });
        };
        const { folderPath, installCommand } = args;
        return (0, setup_1.reinstallProjectDependencies)(folderPath, installCommand, progressCallback);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.CREATE_NEW_PROJECT_PROMPT, (e, args) => {
        const { prompt, images } = args;
        return create_1.default.createProject(prompt, images);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.CREATE_NEW_BLANK_PROJECT, (e) => {
        return create_1.default.createBlankProject();
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.CANCEL_CREATE_NEW_PROJECT_PROMPT, (e) => {
        return create_1.default.cancel();
    });
}
//# sourceMappingURL=create.js.map