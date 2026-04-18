"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorManager = void 0;
const utility_1 = require("@onlook/utility");
const mobx_1 = require("mobx");
class ErrorManager {
    editorEngine;
    projectsManager;
    webviewIdToError = {};
    terminalErrors = [];
    shouldShowErrors = false;
    constructor(editorEngine, projectsManager) {
        this.editorEngine = editorEngine;
        this.projectsManager = projectsManager;
        (0, mobx_1.makeAutoObservable)(this, {});
    }
    get errors() {
        return [...this.terminalErrors];
    }
    async sendFixError() {
        if (this.errors.length > 0) {
            const res = await this.editorEngine.chat.sendFixErrorToAi(this.errors);
            if (res) {
                this.removeErrorsFromMap(this.errors);
            }
        }
    }
    removeErrorsFromMap(errors) {
        for (const [webviewId, existingErrors] of Object.entries(this.webviewIdToError)) {
            this.webviewIdToError[webviewId] = existingErrors.filter((existing) => !errors.some((error) => (0, utility_1.compareErrors)(existing, error)));
        }
    }
    errorByWebviewId(webviewId) {
        return this.webviewIdToError[webviewId];
    }
    addError(webviewId, event) {
        if (event.sourceId?.includes('localhost')) {
            return;
        }
        const error = {
            sourceId: event.sourceId,
            type: 'webview',
            content: event.message,
        };
        const existingErrors = this.webviewIdToError[webviewId] || [];
        if (!existingErrors.some((e) => (0, utility_1.compareErrors)(e, error))) {
            this.webviewIdToError[webviewId] = [...existingErrors, error];
        }
    }
    addTerminalError(message) {
        const error = {
            sourceId: 'terminal',
            type: 'terminal',
            content: message,
        };
        const existingErrors = this.terminalErrors || [];
        if (!existingErrors.some((e) => (0, utility_1.compareErrors)(e, error))) {
            this.terminalErrors = [...existingErrors, error];
        }
        this.shouldShowErrors = true;
    }
    clear() {
        this.webviewIdToError = {};
        this.terminalErrors = [];
    }
}
exports.ErrorManager = ErrorManager;
//# sourceMappingURL=index.js.map