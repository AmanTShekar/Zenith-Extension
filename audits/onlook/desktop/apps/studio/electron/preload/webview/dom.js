"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDom = processDom;
exports.buildLayerTree = buildLayerTree;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const helpers_1 = require("./bundles/helpers");
const ids_1 = require("./ids");
const state_1 = require("./state");
const helpers_2 = require("/common/helpers");
const ids_2 = require("/common/helpers/ids");
const processDebounced = (0, helpers_1.debounce)((root) => {
    const webviewId = (0, state_1.getWebviewId)();
    if (!webviewId) {
        console.warn('Webview id not found, skipping dom processing');
        return false;
    }
    const layerMap = buildLayerTree(root);
    if (!layerMap) {
        console.warn('Error building layer tree, root element is null');
        return false;
    }
    const rootDomId = root.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID);
    if (!rootDomId) {
        console.warn('Root dom id not found');
        return false;
    }
    const rootNode = layerMap.get(rootDomId);
    if (!rootNode) {
        console.warn('Root node not found');
        return false;
    }
    electron_1.ipcRenderer.sendToHost(constants_1.WebviewChannels.DOM_PROCESSED, {
        layerMap: Object.fromEntries(layerMap),
        rootNode,
    });
    return true;
}, 500);
function processDom(root = document.body) {
    if (!(0, state_1.getWebviewId)()) {
        console.warn('Webview id not found, skipping dom processing');
        return false;
    }
    processDebounced(root);
    return true;
}
function buildLayerTree(root) {
    if (!(0, helpers_2.isValidHtmlElement)(root)) {
        return null;
    }
    const layerMap = new Map();
    const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (node) => (0, helpers_2.isValidHtmlElement)(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP,
    });
    // Process root node
    const rootLayerNode = processNode(root);
    rootLayerNode.children = [];
    layerMap.set(rootLayerNode.domId, rootLayerNode);
    let currentNode = treeWalker.nextNode();
    while (currentNode) {
        const layerNode = processNode(currentNode);
        layerNode.children = [];
        // Get parent's domId
        const parentElement = currentNode.parentElement;
        if (parentElement) {
            const parentDomId = parentElement.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID);
            if (parentDomId) {
                layerNode.parent = parentDomId;
                // Add this node's domId to parent's children array
                const parentNode = layerMap.get(parentDomId);
                if (parentNode && parentNode.children) {
                    parentNode.children.push(layerNode.domId);
                }
            }
        }
        layerMap.set(layerNode.domId, layerNode);
        currentNode = treeWalker.nextNode();
    }
    return layerMap;
}
function processNode(node) {
    const domId = (0, ids_1.getOrAssignDomId)(node);
    const oid = (0, ids_2.getOid)(node);
    const instanceId = (0, ids_2.getInstanceId)(node);
    const textContent = Array.from(node.childNodes)
        .map((node) => (node.nodeType === Node.TEXT_NODE ? node.textContent : ''))
        .join(' ')
        .trim()
        .slice(0, 500);
    const style = window.getComputedStyle(node);
    const component = node.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_COMPONENT_NAME);
    const layerNode = {
        domId,
        oid: oid || null,
        instanceId: instanceId || null,
        textContent: textContent || '',
        tagName: node.tagName.toLowerCase(),
        isVisible: style.visibility !== 'hidden',
        component: component || null,
        webviewId: (0, state_1.getWebviewId)(),
        children: null,
        parent: null,
    };
    return layerNode;
}
//# sourceMappingURL=dom.js.map