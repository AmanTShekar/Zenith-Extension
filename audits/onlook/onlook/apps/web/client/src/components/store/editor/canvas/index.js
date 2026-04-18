"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasManager = void 0;
const client_1 = require("@/trpc/client");
const constants_1 = require("@onlook/constants");
const db_1 = require("@onlook/db");
const lodash_1 = require("lodash");
const mobx_1 = require("mobx");
class CanvasManager {
    editorEngine;
    _id = '';
    _scale = constants_1.DefaultSettings.SCALE;
    _position = constants_1.DefaultSettings.PAN_POSITION;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        this._position = this.getDefaultPanPosition();
        (0, mobx_1.makeAutoObservable)(this);
    }
    applyCanvas(canvas) {
        this.id = canvas.id;
        this.scale = canvas.scale ?? constants_1.DefaultSettings.SCALE;
        this.position = canvas.position ?? this.getDefaultPanPosition();
    }
    getDefaultPanPosition() {
        let x = 200;
        let y = 100;
        const center = false;
        if (center) {
            x = window.innerWidth / 2 - (Number(db_1.DefaultDesktopFrame.width) * this._scale) / 2;
            y = window.innerHeight / 2 - (Number(db_1.DefaultDesktopFrame.height) * this._scale) / 2;
        }
        return { x, y };
    }
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }
    get scale() {
        return this._scale;
    }
    set scale(value) {
        this._scale = value;
        this.saveCanvas();
    }
    get position() {
        return this._position;
    }
    set position(value) {
        this._position = value;
        this.saveCanvas();
    }
    // 5 second debounce. Database is used to save working state per user, so we don't need to save too often.
    saveCanvas = (0, lodash_1.debounce)(this.undebouncedSaveCanvas, 5000);
    async undebouncedSaveCanvas() {
        const success = await client_1.api.userCanvas.update.mutate({
            projectId: this.editorEngine.projectId,
            canvasId: this.id,
            canvas: {
                scale: this.scale.toString(),
                x: this.position.x.toString(),
                y: this.position.y.toString(),
            },
        });
        if (!success) {
            console.error('Failed to update canvas');
        }
    }
    clear() {
        this._scale = constants_1.DefaultSettings.SCALE;
        this._position = constants_1.DefaultSettings.PAN_POSITION;
    }
}
exports.CanvasManager = CanvasManager;
//# sourceMappingURL=index.js.map