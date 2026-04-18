"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOnlookViewCode = onOnlookViewCode;
exports.removeOnlookViewCode = removeOnlookViewCode;
exports.viewCodeInOnlook = viewCodeInOnlook;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
function onOnlookViewCode(callback) {
    const subscription = (_event, data) => callback(data);
    electron_1.ipcRenderer.on(constants_1.MainChannels.VIEW_CODE_IN_ONLOOK, subscription);
    return () => electron_1.ipcRenderer.removeListener(constants_1.MainChannels.VIEW_CODE_IN_ONLOOK, subscription);
}
function removeOnlookViewCode(callback) {
    electron_1.ipcRenderer.removeListener(constants_1.MainChannels.VIEW_CODE_IN_ONLOOK, callback);
}
function viewCodeInOnlook(args) {
    return electron_1.ipcRenderer.invoke(constants_1.MainChannels.VIEW_CODE_IN_ONLOOK, args);
}
//# sourceMappingURL=code.js.map