"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameEventManager = void 0;
const lodash_1 = require("lodash");
const mobx_1 = require("mobx");
class FrameEventManager {
    editorEngine;
    isCanvasOutOfView = false;
    viewportReactionDisposer;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    init() {
        this.viewportReactionDisposer = (0, mobx_1.reaction)(() => ({
            position: this.editorEngine.canvas.position,
            scale: this.editorEngine.canvas.scale,
            frames: this.editorEngine.frames.getAll(),
        }), () => this.handleViewportCheck(), {
            fireImmediately: true,
        });
    }
    async undebouncedHandleWindowMutated() {
        try {
            await this.editorEngine.refreshLayers();
            await this.editorEngine.overlay.refresh();
            await this.validateAndCleanSelections();
        }
        catch (error) {
            console.error('Error handling window mutation:', error);
        }
    }
    handleWindowMutated = (0, lodash_1.debounce)(this.undebouncedHandleWindowMutated, 1000, {
        leading: true,
        trailing: true,
    });
    isFrameInViewport(frame) {
        const canvasPos = this.editorEngine.canvas.position;
        const canvasScale = this.editorEngine.canvas.scale;
        const screenX = canvasPos.x + frame.position.x * canvasScale;
        const screenY = canvasPos.y + frame.position.y * canvasScale;
        const screenWidth = frame.dimension.width * canvasScale;
        const screenHeight = frame.dimension.height * canvasScale;
        return !(screenX + screenWidth < 0 ||
            screenX > window.innerWidth ||
            screenY + screenHeight < 0 ||
            screenY > window.innerHeight);
    }
    undebouncedViewportCheck = () => {
        if (typeof window === 'undefined') {
            this.isCanvasOutOfView = false;
            return;
        }
        const frames = this.editorEngine.frames.getAll();
        if (frames.length === 0) {
            this.isCanvasOutOfView = false;
            return;
        }
        const isAnyFrameInView = frames.some((frame) => this.isFrameInViewport(frame.frame));
        this.isCanvasOutOfView = !isAnyFrameInView;
    };
    handleViewportCheck = (0, lodash_1.debounce)(this.undebouncedViewportCheck, 500, {
        leading: true,
        trailing: true,
    });
    recenterCanvas = () => {
        const frames = this.editorEngine.frames.getAll();
        const firstFrame = frames[0]?.frame;
        if (firstFrame) {
            const canvasScale = this.editorEngine.canvas.scale;
            const frameCenterX = firstFrame.position.x + firstFrame.dimension.width / 2;
            const frameCenterY = firstFrame.position.y + firstFrame.dimension.height / 2;
            const defaultPosition = this.editorEngine.canvas.getDefaultPanPosition();
            const viewportCenterX = window.innerWidth / 2 - defaultPosition.x;
            const viewportCenterY = window.innerHeight / 2 - defaultPosition.y;
            this.editorEngine.canvas.position = {
                x: viewportCenterX - frameCenterX * canvasScale,
                y: viewportCenterY - frameCenterY * canvasScale,
            };
        }
        else {
            this.editorEngine.canvas.position = this.editorEngine.canvas.getDefaultPanPosition();
        }
    };
    async handleWindowResized() {
        try {
            await this.editorEngine.overlay.refresh();
        }
        catch (error) {
            console.error('Error handling window resize:', error);
        }
    }
    async handleDomProcessed(frameId, data) {
        try {
            const layerMapConverted = new Map(Object.entries(data.layerMap));
            const frameData = this.editorEngine.frames.get(frameId);
            if (!frameData) {
                console.warn('Frame not found for DOM processing');
                return;
            }
            this.editorEngine.ast.setMapRoot(frameId, data.rootNode, layerMapConverted);
            await this.editorEngine.overlay.refresh();
        }
        catch (error) {
            console.error('Error handling DOM processed:', error);
        }
    }
    async validateAndCleanSelections() {
        const selectedElements = this.editorEngine.elements.selected;
        const stillValidElements = await Promise.all(selectedElements.map(async (el) => {
            const frameData = this.editorEngine.frames.get(el.frameId);
            if (!frameData?.view) {
                console.error('No frame view found');
                return null;
            }
            try {
                const domEl = await frameData.view.getElementByDomId(el.domId, false);
                return domEl ? el : null;
            }
            catch {
                return null;
            }
        }));
        const validElements = stillValidElements.filter((el) => el !== null);
        if (validElements.length !== selectedElements.length) {
            this.editorEngine.elements.click(validElements);
        }
    }
    clear() {
        this.viewportReactionDisposer?.();
        this.viewportReactionDisposer = undefined;
    }
}
exports.FrameEventManager = FrameEventManager;
//# sourceMappingURL=index.js.map