"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayersManager = void 0;
const mobx_1 = require("mobx");
class LayersManager {
    editorEngine;
    frameIdToLayerMetadata = new Map();
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    get layers() {
        return Array.from(this.frameIdToLayerMetadata.values()).map((metadata) => metadata.rootNode);
    }
    get filteredLayers() {
        const selectedWebviews = this.editorEngine.frames.selected;
        if (selectedWebviews.length === 0) {
            return this.layers;
        }
        return this.layers.filter((layer) => selectedWebviews.some((frameView) => frameView.frame.id === layer.frameId));
    }
    getRootLayer(frameId) {
        return this.frameIdToLayerMetadata.get(frameId)?.rootNode;
    }
    getMetadata(frameId) {
        return this.frameIdToLayerMetadata.get(frameId);
    }
    setMetadata(frameId, rootNode, domIdToLayerNode) {
        this.frameIdToLayerMetadata.set(frameId, {
            rootNode: rootNode,
            domIdToLayerNode,
        });
    }
    addNewMapping(frameId, domIdToLayerNode) {
        const metadata = this.getMetadata(frameId);
        if (metadata) {
            metadata.domIdToLayerNode = new Map([
                ...metadata.domIdToLayerNode,
                ...domIdToLayerNode,
            ]);
        }
    }
    getMapping(frameId) {
        return this.getMetadata(frameId)?.domIdToLayerNode;
    }
    getLayerNode(frameId, domId) {
        return this.getMapping(frameId)?.get(domId);
    }
    remove(frameId) {
        this.frameIdToLayerMetadata.delete(frameId);
    }
    clear() {
        this.frameIdToLayerMetadata.clear();
    }
}
exports.LayersManager = LayersManager;
//# sourceMappingURL=layers.js.map