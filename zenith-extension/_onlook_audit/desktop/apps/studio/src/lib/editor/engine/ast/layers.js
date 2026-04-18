"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayersManager = void 0;
const mobx_1 = require("mobx");
class LayersManager {
    editorEngine;
    webviewIdToLayerMetadata = new Map();
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    get layers() {
        return Array.from(this.webviewIdToLayerMetadata.values()).map((metadata) => metadata.rootNode);
    }
    get filteredLayers() {
        const selectedWebviews = this.editorEngine.webviews.selected;
        if (selectedWebviews.length === 0) {
            return this.layers;
        }
        return this.layers.filter((layer) => selectedWebviews.some((webview) => webview.id === layer.webviewId));
    }
    getRootLayer(webviewId) {
        return this.webviewIdToLayerMetadata.get(webviewId)?.rootNode;
    }
    getMetadata(webviewId) {
        return this.webviewIdToLayerMetadata.get(webviewId);
    }
    setMetadata(webviewId, doc, rootNode, domIdToLayerNode) {
        this.webviewIdToLayerMetadata.set(webviewId, {
            document: doc,
            rootNode: rootNode,
            domIdToLayerNode,
        });
    }
    addNewMapping(webviewId, domIdToLayerNode) {
        const metadata = this.getMetadata(webviewId);
        if (metadata) {
            metadata.domIdToLayerNode = new Map([
                ...metadata.domIdToLayerNode,
                ...domIdToLayerNode,
            ]);
        }
    }
    getMapping(webviewId) {
        return this.getMetadata(webviewId)?.domIdToLayerNode;
    }
    getLayerNode(webviewId, domId) {
        return this.getMapping(webviewId)?.get(domId);
    }
    updateDocument(webviewId, doc) {
        const metadata = this.getMetadata(webviewId);
        if (metadata) {
            metadata.document = doc;
        }
    }
    remove(webviewId) {
        this.webviewIdToLayerMetadata.delete(webviewId);
    }
    clear() {
        this.webviewIdToLayerMetadata.clear();
    }
}
exports.LayersManager = LayersManager;
//# sourceMappingURL=layers.js.map