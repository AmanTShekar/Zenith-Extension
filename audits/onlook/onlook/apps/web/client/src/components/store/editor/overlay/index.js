"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayManager = void 0;
const lodash_1 = require("lodash");
const mobx_1 = require("mobx");
const state_1 = require("./state");
const utils_1 = require("./utils");
class OverlayManager {
    editorEngine;
    state = new state_1.OverlayState();
    canvasReactionDisposer;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    init() {
        this.canvasReactionDisposer = (0, mobx_1.reaction)(() => ({
            position: this.editorEngine.canvas?.position,
            scale: this.editorEngine.canvas?.scale,
            shouldHideOverlay: this.editorEngine.state?.shouldHideOverlay,
        }), () => {
            this.refresh();
        });
    }
    undebouncedRefresh = async () => {
        this.state.removeHoverRect();
        // Refresh click rects
        const newClickRects = [];
        for (const selectedElement of this.editorEngine.elements.selected) {
            const frameData = this.editorEngine.frames.get(selectedElement.frameId);
            if (!frameData) {
                console.error('Frame data not found');
                continue;
            }
            const { view } = frameData;
            if (!view) {
                console.error('No frame view found');
                continue;
            }
            const el = await view.getElementByDomId(selectedElement.domId, true);
            if (!el) {
                console.error('Element not found');
                continue;
            }
            const adaptedRect = (0, utils_1.adaptRectToCanvas)(el.rect, view);
            newClickRects.push({ rect: adaptedRect, styles: el.styles });
        }
        this.state.removeClickRects();
        for (const clickRect of newClickRects) {
            this.state.addClickRect(clickRect.rect, clickRect.styles);
        }
        // Refresh text editor position if it's active
        if (this.editorEngine.text.isEditing && this.editorEngine.text.targetElement) {
            const targetElement = this.editorEngine.text.targetElement;
            const frameData = this.editorEngine.frames.get(targetElement.frameId);
            if (frameData?.view) {
                try {
                    const el = await frameData.view.getElementByDomId(targetElement.domId, true);
                    if (el) {
                        const adaptedRect = (0, utils_1.adaptRectToCanvas)(el.rect, frameData.view);
                        this.state.updateTextEditor(adaptedRect, {
                            styles: el.styles?.computed
                        });
                    }
                }
                catch {
                    console.error('Error refreshing text editor position');
                }
            }
        }
    };
    refresh = (0, lodash_1.debounce)(this.undebouncedRefresh, 100, { leading: true });
    showMeasurement() {
        this.editorEngine.overlay.removeMeasurement();
        if (!this.editorEngine.elements.selected.length || !this.editorEngine.elements.hovered) {
            return;
        }
        const selectedEl = this.editorEngine.elements.selected[0];
        if (!selectedEl) {
            return;
        }
        const hoverEl = this.editorEngine.elements.hovered;
        const frameId = selectedEl.frameId;
        const frameData = this.editorEngine.frames.get(frameId);
        if (!frameData) {
            return;
        }
        const { view } = frameData;
        if (!view) {
            console.error('No frame view found');
            return;
        }
        const selectedRect = (0, utils_1.adaptRectToCanvas)(selectedEl.rect, view);
        const hoverRect = (0, utils_1.adaptRectToCanvas)(hoverEl.rect, view);
        this.editorEngine.overlay.updateMeasurement(selectedRect, hoverRect);
    }
    updateMeasurement = (fromRect, toRect) => {
        this.state.updateMeasurement(fromRect, toRect);
    };
    removeMeasurement = () => {
        this.state.removeMeasurement();
    };
    clearUI = () => {
        this.removeMeasurement();
        this.state.clear();
    };
    clear = () => {
        this.canvasReactionDisposer?.();
        this.canvasReactionDisposer = undefined;
    };
}
exports.OverlayManager = OverlayManager;
//# sourceMappingURL=index.js.map