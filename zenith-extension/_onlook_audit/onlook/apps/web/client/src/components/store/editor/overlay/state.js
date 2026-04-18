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
    removeHoverRect = () => {
        this.hoverRect = null;
    };
    updateInsertRect = (rect) => {
        this.insertRect = rect;
    };
    addClickRect = (rect, styles, isComponent, domId) => {
        this.clickRects = [
            ...this.clickRects,
            {
                ...rect,
                styles,
                isComponent,
                id: domId ?? (0, non_secure_1.nanoid)(4),
            },
        ];
    };
    updateClickedRects = (newRect) => {
        this.clickRects = this.clickRects.map((rect) => ({
            ...rect,
            ...newRect,
        }));
    };
    updateClickRectStyles = (id, styles, rect) => {
        this.clickRects = this.clickRects.map((clickRect) => {
            if (clickRect.id === id) {
                return {
                    ...clickRect,
                    ...(rect ?? {}),
                    styles: {
                        defined: {
                            ...clickRect.styles?.defined,
                            ...styles?.defined,
                        },
                        computed: {
                            ...clickRect.styles?.computed,
                            ...styles?.computed,
                        },
                    },
                };
            }
            return clickRect;
        });
    };
    removeClickRects = () => {
        this.clickRects = [];
    };
    addTextEditor = (rect, content, styles, onChange, onStop, isComponent) => {
        this.textEditor = { rect, content, styles, onChange, onStop, isComponent };
    };
    updateTextEditor = (rect, { content, styles, }) => {
        if (!this.textEditor)
            return;
        const newContent = content ?? this.textEditor.content;
        const newStyles = styles ?? this.textEditor.styles;
        // Only update if something actually changed
        const rectChanged = rect.top !== this.textEditor.rect.top ||
            rect.left !== this.textEditor.rect.left ||
            rect.width !== this.textEditor.rect.width ||
            rect.height !== this.textEditor.rect.height;
        const contentChanged = newContent !== this.textEditor.content;
        const stylesChanged = JSON.stringify(newStyles) !== JSON.stringify(this.textEditor.styles);
        if (rectChanged || contentChanged || stylesChanged) {
            this.textEditor = {
                ...this.textEditor,
                rect,
                content: newContent,
                styles: newStyles
            };
        }
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