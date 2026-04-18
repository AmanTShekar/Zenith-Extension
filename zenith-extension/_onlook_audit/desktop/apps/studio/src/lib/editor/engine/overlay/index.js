"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayManager = void 0;
const mobx_1 = require("mobx");
const state_1 = require("./state");
const utils_1 = require("./utils");
class OverlayManager {
    editorEngine;
    scrollPosition = { x: 0, y: 0 };
    state = new state_1.OverlayState();
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        this.listenToScaleChange();
    }
    listenToScaleChange() {
        (0, mobx_1.reaction)(() => ({
            position: this.editorEngine.canvas.position,
            scale: this.editorEngine.canvas.scale,
        }), () => {
            this.refreshOverlay();
        });
    }
    refreshOverlay = async () => {
        this.state.updateHoverRect(null);
        const newClickRects = [];
        for (const selectedElement of this.editorEngine.elements.selected) {
            const webview = this.editorEngine.webviews.getWebview(selectedElement.webviewId);
            if (!webview) {
                continue;
            }
            const el = await webview.executeJavaScript(`window.api?.getDomElementByDomId('${selectedElement.domId}', true)`);
            if (!el) {
                continue;
            }
            const adaptedRect = (0, utils_1.adaptRectToCanvas)(el.rect, webview);
            newClickRects.push({ rect: adaptedRect, styles: el.styles });
        }
        this.state.removeClickRects();
        for (const clickRect of newClickRects) {
            if (!this.editorEngine.text.isEditing) {
                this.state.addClickRect(clickRect.rect, clickRect.styles);
            }
            else {
                this.state.updateTextEditor(clickRect.rect);
            }
        }
    };
    updateMeasurement = (fromRect, toRect) => {
        this.state.updateMeasurement(fromRect, toRect);
    };
    removeMeasurement = () => {
        this.state.removeMeasurement();
    };
    clear = () => {
        this.removeMeasurement();
        this.state.clear();
    };
}
exports.OverlayManager = OverlayManager;
//# sourceMappingURL=index.js.map