"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewMessageBridge = void 0;
const eventHandler_1 = require("./eventHandler");
class WebviewMessageBridge {
    webviews = new Map();
    eventHandlers;
    constructor(editorEngine) {
        const webviewEventHandler = new eventHandler_1.WebviewEventHandler(editorEngine);
        this.eventHandlers = {
            'ipc-message': webviewEventHandler.handleIpcMessage,
            'console-message': webviewEventHandler.handleConsoleMessage,
        };
    }
    register(webview, id) {
        const handlerRemovers = [];
        Object.entries(this.eventHandlers).forEach(([event, handler]) => {
            webview.addEventListener(event, handler);
            handlerRemovers.push(() => {
                webview.removeEventListener(event, handler);
            });
        });
        this.webviews.set(id, { handlerRemovers });
    }
    deregister(webview) {
        const context = this.webviews.get(webview.id);
        if (!context) {
            return;
        }
        context.handlerRemovers.forEach((removeHandler) => removeHandler());
        this.webviews.delete(webview.id);
    }
    dispose() {
        // Clean up all webview event handlers
        Array.from(this.webviews.values()).forEach((context) => {
            context.handlerRemovers.forEach((removeHandler) => removeHandler());
        });
        this.webviews.clear();
        // Clear event handlers
        this.eventHandlers = {};
    }
}
exports.WebviewMessageBridge = WebviewMessageBridge;
//# sourceMappingURL=messageBridge.js.map