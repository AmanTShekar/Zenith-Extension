"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDom = void 0;
exports.buildLayerTree = buildLayerTree;
const constants_1 = require("@onlook/constants");
const debounce_1 = __importDefault(require("lodash/debounce"));
const dom_1 = require("../helpers/dom");
const ids_1 = require("../helpers/ids");
const publish_1 = require("./events/publish");
const state_1 = require("./state");
function processDomDebounced(root = document.body) {
    const frameId = (0, state_1.getFrameId)();
    if (!frameId) {
        console.warn('frameView id not found, skipping dom processing');
        return null;
    }
    const layerMap = buildLayerTree(root);
    if (!layerMap) {
        console.warn('Error building layer tree, root element is null');
        return null;
    }
    const rootDomId = root.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID);
    if (!rootDomId) {
        console.warn('Root dom id not found');
        return null;
    }
    const rootNode = layerMap.get(rootDomId);
    if (!rootNode) {
        console.warn('Root node not found');
        return null;
    }
    (0, publish_1.publishDomProcessed)(layerMap, rootNode);
    return { rootDomId, layerMap: Array.from(layerMap.entries()) };
}
exports.processDom = (0, debounce_1.default)(processDomDebounced, 500);
// Filter conditions for nodes to reject in layer tree
const FILTER_CONDITIONS = [
    (element) => {
        const parent = element.parentElement;
        return parent && parent.tagName.toLowerCase() === 'svg';
    },
    (element) => {
        return element.tagName.toLowerCase() === 'next-route-announcer';
    },
    (element) => {
        return element.tagName.toLowerCase() === 'nextjs-portal';
    },
];
function buildLayerTree(root) {
    if (!(0, dom_1.isValidHtmlElement)(root)) {
        return null;
    }
    const layerMap = new Map();
    const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (node) => {
            const element = node;
            if (FILTER_CONDITIONS.some(condition => condition(element))) {
                return NodeFilter.FILTER_REJECT;
            }
            return (0, dom_1.isValidHtmlElement)(element)
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_SKIP;
        },
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
    const oid = (0, ids_1.getOid)(node);
    const instanceId = (0, ids_1.getInstanceId)(node);
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
        frameId: (0, state_1.getFrameId)(),
        children: null,
        parent: null,
        dynamicType: null,
        coreElementType: null,
    };
    return layerNode;
}
//# sourceMappingURL=dom.js.map