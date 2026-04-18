"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstManager = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
const layers_1 = require("./layers");
class AstManager {
    editorEngine;
    layersManager;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        this.layersManager = new layers_1.LayersManager(editorEngine);
        (0, mobx_1.makeAutoObservable)(this);
    }
    get mappings() {
        return this.layersManager;
    }
    setMapRoot(webviewId, root, rootNode, layerMap) {
        this.mappings.setMetadata(webviewId, root.ownerDocument, rootNode, layerMap);
        this.processNode(webviewId, rootNode);
    }
    updateMap(webviewId, newMap, domId) {
        this.mappings.addNewMapping(webviewId, newMap);
        const node = domId ? this.mappings.getLayerNode(webviewId, domId) : null;
        if (!node) {
            console.warn('Failed to replaceElement: Node not found');
            return;
        }
        this.processNode(webviewId, node);
    }
    processNode(webviewId, node) {
        this.dfs(webviewId, node, (n) => {
            this.processNodeForMap(webviewId, n);
        });
    }
    dfs(webviewId, root, callback) {
        const stack = [root];
        while (stack.length > 0) {
            const node = stack.pop();
            if (!node) {
                continue;
            }
            callback(node);
            if (node.children) {
                for (let i = node.children.length - 1; i >= 0; i--) {
                    const childLayerNode = this.mappings.getLayerNode(webviewId, node.children[i]);
                    if (childLayerNode) {
                        stack.push(childLayerNode);
                    }
                }
            }
        }
    }
    async processNodeForMap(webviewId, node) {
        if (!node.oid) {
            console.warn('Failed to processNodeForMap: No oid found');
            return;
        }
        const templateNode = await this.getTemplateNodeById(node.oid);
        if (!templateNode) {
            console.warn('Failed to processNodeForMap: Template node not found');
            return;
        }
        // Check if node needs type assignment
        const hasSpecialType = templateNode.dynamicType || templateNode.coreElementType;
        if (!hasSpecialType) {
            this.findNodeInstance(webviewId, node, node, templateNode);
            return;
        }
        const webview = this.editorEngine.webviews.getWebview(webviewId);
        if (!webview) {
            console.warn('Failed: Webview not found');
            return;
        }
        if (templateNode.dynamicType) {
            node.dynamicType = templateNode.dynamicType;
        }
        if (templateNode.coreElementType) {
            node.coreElementType = templateNode.coreElementType;
        }
        webview.executeJavaScript(`window.api?.setElementType(
            '${node.domId}', 
            ${templateNode.dynamicType ? `'${templateNode.dynamicType}'` : 'undefined'}, 
            ${templateNode.coreElementType ? `'${templateNode.coreElementType}'` : 'undefined'}
        )`);
        this.findNodeInstance(webviewId, node, node, templateNode);
    }
    async findNodeInstance(webviewId, originalNode, node, templateNode) {
        if (node.tagName.toLocaleLowerCase() === 'body') {
            return;
        }
        if (!node.parent) {
            console.warn('Failed to findNodeInstance: Parent id not found');
            return;
        }
        const parent = this.mappings.getLayerNode(webviewId, node.parent);
        if (!parent) {
            console.warn('Failed to findNodeInstance: Parent not found in layer map');
            return;
        }
        if (!parent.oid) {
            console.warn('Failed to findNodeInstance: Parent has no oid');
            return;
        }
        const parentTemplateNode = await this.getTemplateNodeById(parent.oid);
        if (!parentTemplateNode) {
            console.warn('Failed to findNodeInstance: Parent template node not found');
            return;
        }
        if (parentTemplateNode.component !== templateNode.component) {
            const htmlParent = this.getElementFromDomId(parent.domId, webviewId);
            if (!htmlParent) {
                console.warn('Failed to findNodeInstance: Parent node not found');
                return;
            }
            const children = htmlParent.querySelectorAll(`[${constants_1.EditorAttributes.DATA_ONLOOK_ID}='${originalNode.oid}']`);
            const htmlOriginalNode = this.getElementFromDomId(originalNode.domId, webviewId);
            if (!htmlOriginalNode) {
                console.warn('Failed to findNodeInstance: Original node not found');
                return;
            }
            const index = Array.from(children).indexOf(htmlOriginalNode);
            const res = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_TEMPLATE_NODE_CHILD, {
                parent: parentTemplateNode,
                child: templateNode,
                index,
            });
            if (res) {
                originalNode.instanceId = res.instanceId;
                originalNode.component = res.component;
                this.updateElementInstance(webviewId, originalNode.domId, res.instanceId, res.component);
            }
            else {
                await this.findNodeInstance(webviewId, originalNode, parent, templateNode);
            }
        }
    }
    getElementFromDomId(domId, webviewId) {
        const doc = this.mappings.getMetadata(webviewId)?.document;
        if (!doc) {
            console.warn('Failed to getNodeFromDomId: Document not found');
            return null;
        }
        return doc.querySelector(`[${constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID}='${domId}']`) || null;
    }
    async getTemplateNodeById(oid) {
        if (!oid) {
            console.warn('Failed to getTemplateNodeById: No oid found');
            return null;
        }
        return (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_TEMPLATE_NODE, { id: oid });
    }
    updateElementInstance(webviewId, domId, instanceId, component) {
        const webview = this.editorEngine.webviews.getWebview(webviewId);
        if (!webview) {
            console.warn('Failed to updateElementInstanceId: Webview not found');
            return;
        }
        webview.executeJavaScript(`window.api?.updateElementInstance('${domId}', '${instanceId}', '${component}')`);
    }
    clear() {
        this.layersManager.clear();
    }
    async refreshAstDoc(webview) {
        const root = await this.getBodyFromWebview(webview);
        this.mappings.updateDocument(webview.id, root.ownerDocument);
    }
    async getBodyFromWebview(webview) {
        const htmlString = await webview.executeJavaScript('document.documentElement.outerHTML');
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        return doc.body;
    }
}
exports.AstManager = AstManager;
//# sourceMappingURL=index.js.map