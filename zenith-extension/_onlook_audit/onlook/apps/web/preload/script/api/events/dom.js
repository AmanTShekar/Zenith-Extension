"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForDomMutation = listenForDomMutation;
exports.listenForResize = listenForResize;
const constants_1 = require("@onlook/constants");
const __1 = require("../..");
const dom_1 = require("../dom");
function listenForDomMutation() {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver((mutationsList) => {
        let added = new Map();
        let removed = new Map();
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const parent = mutation.target;
                // Handle added nodes
                mutation.addedNodes.forEach((node) => {
                    const el = node;
                    if (node.nodeType === Node.ELEMENT_NODE &&
                        el.hasAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID) &&
                        !shouldIgnoreMutatedNode(el)) {
                        dedupNewElement(el);
                        if (parent) {
                            const layerMap = (0, dom_1.buildLayerTree)(parent);
                            if (layerMap) {
                                added = new Map([...added, ...layerMap]);
                            }
                        }
                    }
                });
                // Handle removed nodes
                mutation.removedNodes.forEach((node) => {
                    const el = node;
                    if (node.nodeType === Node.ELEMENT_NODE &&
                        el.hasAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID) &&
                        !shouldIgnoreMutatedNode(el)) {
                        if (parent) {
                            const layerMap = (0, dom_1.buildLayerTree)(parent);
                            if (layerMap) {
                                removed = new Map([...removed, ...layerMap]);
                            }
                        }
                    }
                });
            }
        }
        if (added.size > 0 || removed.size > 0) {
            if (__1.penpalParent) {
                __1.penpalParent.onWindowMutated({
                    added: Object.fromEntries(added),
                    removed: Object.fromEntries(removed)
                }).catch((error) => {
                    console.error('Failed to send window mutation event:', error);
                });
            }
        }
    });
    observer.observe(targetNode, config);
}
function listenForResize() {
    function notifyResize() {
        if (__1.penpalParent) {
            __1.penpalParent.onWindowResized().catch((error) => {
                console.error('Failed to send window resize event:', error);
            });
        }
    }
    window.addEventListener('resize', notifyResize);
}
function shouldIgnoreMutatedNode(node) {
    if (node.id === constants_1.EditorAttributes.ONLOOK_STUB_ID) {
        return true;
    }
    if (node.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_INSERTED)) {
        return true;
    }
    return false;
}
function dedupNewElement(newEl) {
    // If the element has an oid and there's an inserted element with the same oid,
    // replace the existing element with the new one and restore the attributes
    const oid = newEl.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_ID);
    if (!oid) {
        return;
    }
    document
        .querySelectorAll(`[${constants_1.EditorAttributes.DATA_ONLOOK_ID}="${oid}"][${constants_1.EditorAttributes.DATA_ONLOOK_INSERTED}]`)
        .forEach((targetEl) => {
        const ATTRIBUTES_TO_REPLACE = [
            constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID,
            constants_1.EditorAttributes.DATA_ONLOOK_DRAG_SAVED_STYLE,
            constants_1.EditorAttributes.DATA_ONLOOK_EDITING_TEXT,
            constants_1.EditorAttributes.DATA_ONLOOK_INSTANCE_ID,
        ];
        ATTRIBUTES_TO_REPLACE.forEach((attr) => {
            const targetAttr = targetEl.getAttribute(attr);
            if (targetAttr) {
                newEl.setAttribute(attr, targetAttr);
            }
        });
        targetEl.remove();
    });
}
//# sourceMappingURL=dom.js.map