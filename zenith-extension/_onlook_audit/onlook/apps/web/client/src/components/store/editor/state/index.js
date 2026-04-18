"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = void 0;
const models_1 = require("@onlook/models");
const lodash_1 = require("lodash");
const mobx_1 = require("mobx");
class StateManager {
    _canvasScrolling = false;
    hotkeysOpen = false;
    publishOpen = false;
    leftPanelLocked = false;
    canvasPanning = false;
    isDragSelecting = false;
    editorMode = models_1.EditorMode.DESIGN;
    insertMode = null;
    leftPanelTab = null;
    brandTab = null;
    branchTab = null;
    manageBranchId = null;
    chatMode = models_1.ChatType.EDIT;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
    }
    set canvasScrolling(value) {
        this._canvasScrolling = value;
        this.resetCanvasScrolling();
    }
    get shouldHideOverlay() {
        return this._canvasScrolling || this.canvasPanning;
    }
    resetCanvasScrolling() {
        this.resetCanvasScrollingDebounced();
    }
    resetCanvasScrollingDebounced = (0, lodash_1.debounce)(() => {
        this.canvasScrolling = false;
    }, 150);
    clear() {
        this.hotkeysOpen = false;
        this.publishOpen = false;
        this.branchTab = null;
        this.manageBranchId = null;
        this.resetCanvasScrollingDebounced.cancel();
    }
}
exports.StateManager = StateManager;
//# sourceMappingURL=index.js.map