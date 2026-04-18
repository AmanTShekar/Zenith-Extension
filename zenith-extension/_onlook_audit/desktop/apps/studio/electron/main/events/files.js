"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForFileMessages = listenForFileMessages;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const files_scan_1 = require("../code/files-scan");
function listenForFileMessages() {
    // Scan all project files and return a tree structure
    electron_1.ipcMain.handle(constants_1.MainChannels.SCAN_FILES, async (_event, projectRoot) => {
        const files = await (0, files_scan_1.scanProjectFiles)(projectRoot);
        return files;
    });
    // Get a flat list of all files with the given extensions
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_PROJECT_FILES, async (_event, { projectRoot, extensions }) => {
        return await (0, files_scan_1.getProjectFiles)(projectRoot, extensions);
    });
}
//# sourceMappingURL=files.js.map