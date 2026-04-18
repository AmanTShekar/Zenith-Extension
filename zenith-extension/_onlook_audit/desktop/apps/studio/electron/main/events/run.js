"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForRunMessages = listenForRunMessages;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const bun_1 = require("../bun");
const run_1 = __importDefault(require("../run"));
const helpers_1 = require("../run/helpers");
const terminal_1 = __importDefault(require("../run/terminal"));
async function listenForRunMessages() {
    electron_1.ipcMain.handle(constants_1.MainChannels.RUN_START, (e, args) => {
        const { id, folderPath, command } = args;
        return run_1.default.start(id, folderPath, command);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.RUN_STOP, (e, args) => {
        const { id, folderPath } = args;
        return run_1.default.stop(id, folderPath);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.RUN_RESTART, (e, args) => {
        const { id, folderPath, command } = args;
        return run_1.default.restart(id, folderPath, command);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_TEMPLATE_NODE, (e, args) => {
        const { id } = args;
        return run_1.default.getTemplateNode(id);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_RUN_STATE, (_, args) => {
        return run_1.default.state;
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.TERMINAL_INPUT, (_, args) => {
        const { id, data } = args;
        return terminal_1.default.write(id, data);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.TERMINAL_EXECUTE_COMMAND, (_, args) => {
        const { id, command } = args;
        return terminal_1.default.executeCommand(id, command);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.TERMINAL_RESIZE, (_, args) => {
        const { id, cols, rows } = args;
        return terminal_1.default.resize(id, cols, rows);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.TERMINAL_GET_HISTORY, (_, args) => {
        const { id } = args;
        return terminal_1.default.getHistory(id);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.RUN_COMMAND, async (_, args) => {
        const { cwd, command } = args;
        return await (0, bun_1.runBunCommand)(command, { cwd });
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.IS_PORT_AVAILABLE, async (e, args) => {
        const { port } = args;
        return await (0, helpers_1.isPortAvailable)(port);
    });
}
//# sourceMappingURL=run.js.map