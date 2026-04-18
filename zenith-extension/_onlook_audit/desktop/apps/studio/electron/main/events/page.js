"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForPageMessages = listenForPageMessages;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const pages_1 = require("../pages");
const update_1 = require("../pages/update");
function listenForPageMessages() {
    electron_1.ipcMain.handle(constants_1.MainChannels.SCAN_PAGES, async (_event, projectRoot) => {
        const pages = await (0, pages_1.scanNextJsPages)(projectRoot);
        return pages;
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.CREATE_PAGE, async (_event, { projectRoot, pagePath }) => {
        return await (0, pages_1.createNextJsPage)(projectRoot, pagePath);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.DELETE_PAGE, async (_event, { projectRoot, pagePath, isDir, }) => {
        return await (0, pages_1.deleteNextJsPage)(projectRoot, pagePath, isDir);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.RENAME_PAGE, async (_event, { projectRoot, oldPath, newName, }) => {
        return await (0, pages_1.renameNextJsPage)(projectRoot, oldPath, newName);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.DUPLICATE_PAGE, async (_event, { projectRoot, sourcePath, targetPath, }) => {
        return await (0, pages_1.duplicateNextJsPage)(projectRoot, sourcePath, targetPath);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.UPDATE_PAGE_METADATA, async (_event, { projectRoot, pagePath, metadata, }) => {
        return await (0, update_1.updateNextJsPage)(projectRoot, pagePath, metadata);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.SCAN_PROJECT_METADATA, async (_event, { projectRoot }) => {
        const routerConfig = await (0, pages_1.detectRouterType)(projectRoot);
        if (routerConfig) {
            if (routerConfig.type === 'app') {
                const layoutPath = path_1.default.join(routerConfig.basePath, 'layout.tsx');
                return await (0, pages_1.extractMetadata)(layoutPath);
            }
            else {
                return;
            }
        }
        return null;
    });
}
//# sourceMappingURL=page.js.map