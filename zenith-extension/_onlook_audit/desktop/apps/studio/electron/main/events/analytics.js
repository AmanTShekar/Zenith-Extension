"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForAnalyticsMessages = listenForAnalyticsMessages;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const analytics_1 = __importDefault(require("../analytics"));
const chat_1 = __importDefault(require("../chat"));
function listenForAnalyticsMessages() {
    electron_1.ipcMain.on(constants_1.MainChannels.UPDATE_ANALYTICS_PREFERENCE, (e, args) => {
        const analyticsPref = args;
        analytics_1.default.toggleSetting(analyticsPref);
        chat_1.default.toggleAnalytics(analyticsPref);
    });
    electron_1.ipcMain.on(constants_1.MainChannels.SEND_ANALYTICS, (e, args) => {
        if (analytics_1.default) {
            const { event, data } = args;
            analytics_1.default.track(event, data);
        }
    });
    electron_1.ipcMain.on(constants_1.MainChannels.SEND_ANALYTICS_ERROR, (e, args) => {
        if (analytics_1.default) {
            const { event, data } = args;
            analytics_1.default.trackError(event, data);
        }
    });
}
//# sourceMappingURL=analytics.js.map