"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayState = void 0;
const mobx_1 = require("mobx");
const non_secure_1 = require("nanoid/non-secure");
class OverlayState {
    clickRects = [];
    insertRect = null;
    textEditor = null;
    hoverRect = null;
    measurement = null;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
    }
    updateHoverRect = (rect, isComponent) => {
        this.hoverRect = rect ? { rect, isComponent } : null;
    };
    updateInsertRect = (rect) => {
        this.insertRect = rect;
    };
    addClickRect = (rect, styles, isComponent) => {
        this.clickRects = [
            ...this.clickRects,
            {
                ...rect,
                styles,
                isComponent,
                id: (0, non_secure_1.nanoid)(4),
            },
        ];
    };
    updateClickedRects = (newRect) => {
        this.clickRects = this.clickRects.map((rect) => ({
            ...rect,
            ...newRect,
        }));
    };
    removeClickRects = () => {
        this.clickRects = [];
    };
    addTextEditor = (rect, content, styles, onChange, onStop, isComponent) => {
        this.textEditor = { rect, content, styles, onChange, onStop, isComponent };
    };
    updateTextEditor = (rect) => {
        this.textEditor = this.textEditor ? { ...this.textEditor, rect } : null;
    };
    removeTextEditor = () => {
        this.textEditor = null;
    };
    updateMeasurement = (fromRect, toRect) => {
        this.measurement = { fromRect, toRect };
    };
    removeMeasurement = () => {
        this.measurement = null;
    };
    clear = () => {
        this.hoverRect = null;
        this.insertRect = null;
        this.clickRects = [];
        this.textEditor = null;
        this.measurement = null;
    };
}
exports.OverlayState = OverlayState;
//# sourceMappingURL=state.js.map