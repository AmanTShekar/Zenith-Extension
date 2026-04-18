"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updater = void 0;
const electron_updater_1 = __importDefault(require("electron-updater"));
const { autoUpdater } = electron_updater_1.default;
const constants_1 = require("@onlook/models/constants");
const electron_log_1 = __importDefault(require("electron-log"));
const __1 = require("..");
class AppUpdater {
    static instance = null;
    static getInstance() {
        if (!AppUpdater.instance) {
            AppUpdater.instance = new AppUpdater();
        }
        return AppUpdater.instance;
    }
    constructor() {
        if (AppUpdater.instance) {
            return AppUpdater.instance;
        }
        electron_log_1.default.transports.file.level = 'info';
        autoUpdater.logger = electron_log_1.default;
        autoUpdater.autoDownload = true;
        AppUpdater.instance = this;
    }
    async quitAndInstall() {
        autoUpdater.quitAndInstall();
    }
    listen() {
        const checkForUpdates = () => {
            autoUpdater.checkForUpdates().catch((err) => {
                electron_log_1.default.error('Error checking for updates:', err);
            });
        };
        checkForUpdates();
        setInterval(checkForUpdates, 60 * 60 * 1000);
        autoUpdater.on('update-available', () => {
            electron_log_1.default.info('Update available');
        });
        autoUpdater.on('update-not-available', () => {
            electron_log_1.default.info('Update not available');
            __1.mainWindow?.webContents.send(constants_1.MainChannels.UPDATE_NOT_AVAILABLE);
        });
        autoUpdater.on('download-progress', (progress) => {
            let log_message = 'Download speed: ' + progress.bytesPerSecond;
            log_message = log_message + ' - Downloaded ' + progress.percent + '%';
            log_message = log_message + ' (' + progress.transferred + '/' + progress.total + ')';
            electron_log_1.default.info(log_message);
        });
        autoUpdater.on('update-downloaded', () => {
            electron_log_1.default.info('Update downloaded');
            __1.mainWindow?.webContents.send(constants_1.MainChannels.UPDATE_DOWNLOADED);
        });
        autoUpdater.on('error', (err) => {
            electron_log_1.default.error('AutoUpdater error:', err);
        });
    }
}
exports.updater = AppUpdater.getInstance();
//# sourceMappingURL=index.js.map