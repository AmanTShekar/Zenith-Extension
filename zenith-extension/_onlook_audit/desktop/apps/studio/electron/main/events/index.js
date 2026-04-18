"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForIpcMessages = listenForIpcMessages;
exports.removeIpcListeners = removeIpcListeners;
const constants_1 = require("@onlook/models/constants");
const projects_1 = require("@onlook/models/projects");
const electron_1 = require("electron");
const __1 = require("..");
const images_1 = require("../storage/images");
const update_1 = require("../update");
const analytics_1 = require("./analytics");
const asset_1 = require("./asset");
const auth_1 = require("./auth");
const chat_1 = require("./chat");
const code_1 = require("./code");
const create_1 = require("./create");
const files_1 = require("./files");
const hosting_1 = require("./hosting");
const page_1 = require("./page");
const payments_1 = require("./payments");
const run_1 = require("./run");
const storage_1 = require("./storage");
const versions_1 = require("./versions");
function listenForIpcMessages() {
    listenForGeneralMessages();
    (0, analytics_1.listenForAnalyticsMessages)();
    (0, code_1.listenForCodeMessages)();
    (0, storage_1.listenForStorageMessages)();
    (0, auth_1.listenForAuthMessages)();
    (0, create_1.listenForCreateMessages)();
    (0, chat_1.listenForChatMessages)();
    (0, run_1.listenForRunMessages)();
    (0, hosting_1.listenForHostingMessages)();
    (0, payments_1.listenForPaymentMessages)();
    (0, page_1.listenForPageMessages)();
    (0, asset_1.listenForAssetMessages)();
    (0, versions_1.listenForVersionsMessages)();
    (0, files_1.listenForFileMessages)();
}
function removeIpcListeners() {
    Object.values(constants_1.MainChannels).forEach((channel) => {
        electron_1.ipcMain.removeHandler(channel);
    });
}
function listenForGeneralMessages() {
    electron_1.ipcMain.handle(constants_1.MainChannels.RELOAD_APP, (e, args) => {
        return __1.mainWindow?.reload();
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.OPEN_IN_EXPLORER, (e, args) => {
        return electron_1.shell.showItemInFolder(args);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.OPEN_EXTERNAL_WINDOW, (e, args) => {
        return electron_1.shell.openExternal(args);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.QUIT_AND_INSTALL, (e, args) => {
        return update_1.updater.quitAndInstall();
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_IMAGE, (e, args) => {
        return images_1.imageStorage.readImage(args);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.SAVE_IMAGE, (e, args) => {
        return images_1.imageStorage.writeImage(args.name, args.img);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.SEND_WINDOW_COMMAND, (e, args) => {
        const window = electron_1.BrowserWindow.getFocusedWindow();
        const command = args;
        switch (command) {
            case projects_1.WindowCommand.MINIMIZE:
                window?.minimize();
                break;
            case projects_1.WindowCommand.MAXIMIZE:
                window?.maximize();
                break;
            case projects_1.WindowCommand.UNMAXIMIZE:
                window?.unmaximize();
                break;
            case projects_1.WindowCommand.CLOSE:
                window?.close();
                break;
        }
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.DELETE_FOLDER, (e, args) => {
        return electron_1.shell.trashItem(args);
    });
}
//# sourceMappingURL=index.js.map