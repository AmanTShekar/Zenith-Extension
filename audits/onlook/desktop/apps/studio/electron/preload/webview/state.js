"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setWebviewId = setWebviewId;
exports.getWebviewId = getWebviewId;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
function setWebviewId(webviewId) {
    window._onlookWebviewId = webviewId;
}
function getWebviewId() {
    const webviewId = window._onlookWebviewId;
    if (!webviewId) {
        console.warn('Webview id not found');
        electron_1.ipcRenderer.sendToHost(constants_1.WebviewChannels.GET_WEBVIEW_ID);
        return '';
    }
    return webviewId;
}
//# sourceMappingURL=state.js.map