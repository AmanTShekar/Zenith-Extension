"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const env = {
    WEBVIEW_PRELOAD_PATH: process.env.WEBVIEW_PRELOAD_PATH,
    APP_VERSION: process.env.APP_VERSION,
    IS_DEV: process.env.NODE_ENV === 'development',
    PLATFORM: process.platform,
};
const store = {
    get(val) {
        return electron_1.ipcRenderer.sendSync('electron-store-get', val);
    },
    set(property, val) {
        electron_1.ipcRenderer.send('electron-store-set', property, val);
    },
    has(val) {
        return electron_1.ipcRenderer.sendSync('electron-store-has', val);
    },
};
const api = {
    send(channel, args) {
        electron_1.ipcRenderer.send(channel, args);
    },
    on(channel, func) {
        const subscription = (_event, ...args) => func(...args);
        electron_1.ipcRenderer.on(channel, subscription);
        return () => electron_1.ipcRenderer.removeListener(channel, subscription);
    },
    once(channel, func) {
        electron_1.ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(channel, ...args) {
        return electron_1.ipcRenderer.invoke(channel, ...args);
    },
    removeListener(channel, listener) {
        electron_1.ipcRenderer.removeListener(channel, listener);
    },
    removeAllListeners(channel) {
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
};
electron_1.contextBridge.exposeInMainWorld('api', api);
electron_1.contextBridge.exposeInMainWorld('store', store);
electron_1.contextBridge.exposeInMainWorld('env', env);
electron_1.contextBridge.exposeInMainWorld('process', process);
// Set zoom level
electron_1.webFrame.setZoomFactor(1);
electron_1.webFrame.setVisualZoomLevelLimits(1, 1);
//# sourceMappingURL=index.js.map