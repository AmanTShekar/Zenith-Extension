"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewManager = exports.WebviewState = void 0;
const run_1 = require("@onlook/models/run");
const mobx_1 = require("mobx");
const helpers_1 = require("/common/helpers");
var WebviewState;
(function (WebviewState) {
    WebviewState[WebviewState["NOT_RUNNING"] = 0] = "NOT_RUNNING";
    WebviewState[WebviewState["RUNNING_NO_DOM"] = 1] = "RUNNING_NO_DOM";
    WebviewState[WebviewState["DOM_NO_ONLOOK"] = 2] = "DOM_NO_ONLOOK";
    WebviewState[WebviewState["DOM_ONLOOK_ENABLED"] = 3] = "DOM_ONLOOK_ENABLED";
})(WebviewState || (exports.WebviewState = WebviewState = {}));
const DEFAULT_DATA = {
    selected: false,
    state: WebviewState.NOT_RUNNING,
};
class WebviewManager {
    editorEngine;
    projectsManager;
    webviewIdToData = new Map();
    stateObservers = new Map();
    disposers = [];
    constructor(editorEngine, projectsManager) {
        this.editorEngine = editorEngine;
        this.projectsManager = projectsManager;
        (0, mobx_1.makeAutoObservable)(this, {});
    }
    get webviews() {
        return this.webviewIdToData;
    }
    get selected() {
        return Array.from(this.webviewIdToData.values())
            .filter((w) => w.selected)
            .map((w) => w.webview);
    }
    getAll() {
        return Array.from(this.webviewIdToData.values()).map((w) => w.webview);
    }
    getWebview(id) {
        return this.webviewIdToData.get(id)?.webview;
    }
    register(webview) {
        this.webviewIdToData.set(webview.id, { webview, ...DEFAULT_DATA });
    }
    deregister(webview) {
        this.disposeWebview(webview.id);
    }
    deregisterAll() {
        this.webviewIdToData.clear();
        this.editorEngine?.errors.clear();
    }
    isSelected(id) {
        return this.webviewIdToData.get(id)?.selected ?? false;
    }
    select(webview) {
        const data = this.webviewIdToData.get(webview.id);
        if (data) {
            data.selected = true;
            this.webviewIdToData.set(webview.id, data);
            this.editorEngine.pages.handleWebviewUrlChange(webview.id);
            this.notify();
        }
    }
    deselect(webview) {
        const data = this.webviewIdToData.get(webview.id);
        if (data) {
            data.selected = false;
            this.webviewIdToData.set(webview.id, data);
            this.notify();
        }
    }
    deselectAll() {
        for (const [id, data] of this.webviewIdToData) {
            this.webviewIdToData.set(id, { ...data, selected: false });
        }
        this.notify();
    }
    notify() {
        this.webviewIdToData = new Map(this.webviewIdToData);
    }
    getState(id) {
        return this.webviewIdToData.get(id)?.state ?? WebviewState.NOT_RUNNING;
    }
    setState(webview, state) {
        const data = this.webviewIdToData.get(webview.id);
        if (data) {
            data.state = state;
            this.webviewIdToData.set(webview.id, data);
            this.notifyStateObservers(webview.id);
        }
    }
    computeState(body) {
        const running = this.projectsManager.runner?.state === run_1.RunState.RUNNING || false;
        if (!running) {
            return WebviewState.NOT_RUNNING;
        }
        const doc = body.ownerDocument;
        const hasElements = body.children.length > 0;
        if (!hasElements) {
            this.editorEngine.errors.shouldShowErrors = true;
            return WebviewState.RUNNING_NO_DOM;
        }
        const hasOnlook = (0, helpers_1.isOnlookInDoc)(doc);
        if (hasOnlook) {
            this.editorEngine.errors.shouldShowErrors = false;
            return WebviewState.DOM_ONLOOK_ENABLED;
        }
        this.editorEngine.errors.shouldShowErrors = true;
        return WebviewState.DOM_NO_ONLOOK;
    }
    observeState(id, observer) {
        if (!this.stateObservers.has(id)) {
            this.stateObservers.set(id, new Set());
        }
        this.stateObservers.get(id).add(observer);
    }
    unobserveState(id, observer) {
        this.stateObservers.get(id)?.delete(observer);
        if (this.stateObservers.get(id)?.size === 0) {
            this.stateObservers.delete(id);
        }
    }
    notifyStateObservers(id) {
        const state = this.getState(id);
        if (!state) {
            return;
        }
        this.stateObservers.get(id)?.forEach((observer) => {
            observer(state);
        });
    }
    dispose() {
        // Clean up all webview data
        this.deregisterAll();
        // Clean up all state observers
        this.stateObservers.clear();
        // Run all disposers
        this.disposers.forEach((dispose) => dispose());
        this.disposers = [];
    }
    disposeWebview(id) {
        // Remove webview data
        this.webviewIdToData.delete(id);
        // Clean up observers for this webview
        this.stateObservers.delete(id);
        // Clean up AST mappings
        this.editorEngine?.ast?.mappings?.remove(id);
        this.editorEngine?.errors.clear();
    }
    reloadWebviews() {
        for (const webview of this.selected) {
            webview.reload();
        }
    }
}
exports.WebviewManager = WebviewManager;
//# sourceMappingURL=index.js.map