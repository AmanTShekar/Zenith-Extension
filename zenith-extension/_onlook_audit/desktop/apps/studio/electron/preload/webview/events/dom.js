"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForDomMutation = listenForDomMutation;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
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
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.TEXT_NODE ||
                        shouldIgnoreMutatedNode(node)) {
                        continue;
                    }
                    const element = node;
                    dedupNewElement(element);
                    const layerMap = (0, dom_1.buildLayerTree)(parent);
                    if (layerMap) {
                        added = new Map([...added, ...layerMap]);
                    }
                }
                for (const node of mutation.removedNodes) {
                    if (node.nodeType === Node.TEXT_NODE ||
                        shouldIgnoreMutatedNode(node)) {
                        continue;
                    }
                    const layerMap = (0, dom_1.buildLayerTree)(parent);
                    if (layerMap) {
                        removed = new Map([...removed, ...layerMap]);
                    }
                }
            }
        }
        if (added.size > 0 || removed.size > 0) {
            electron_1.ipcRenderer.sendToHost(constants_1.WebviewChannels.WINDOW_MUTATED, {
                added: Object.fromEntries(added),
                removed: Object.fromEntries(removed),
            });
        }
    });
    observer.observe(targetNode, config);
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