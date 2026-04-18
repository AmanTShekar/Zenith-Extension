"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishStyleUpdate = publishStyleUpdate;
exports.publishInsertElement = publishInsertElement;
exports.publishRemoveElement = publishRemoveElement;
exports.publishMoveElement = publishMoveElement;
exports.publishGroupElement = publishGroupElement;
exports.publishUngroupElement = publishUngroupElement;
exports.publishEditText = publishEditText;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const dom_1 = require("../dom");
const elements_1 = require("../elements");
const helpers_1 = require("../elements/helpers");
const helpers_2 = require("/common/helpers");
function publishStyleUpdate(domId) {
    const domEl = (0, elements_1.getDomElementByDomId)(domId, true);
    if (!domEl) {
        console.warn('No domEl found for style update event');
        return;
    }
    electron_1.ipcRenderer.sendToHost(constants_1.WebviewChannels.STYLE_UPDATED, { domEl });
}
function publishInsertElement(location, domEl, editText) {
    const parent = (0, helpers_2.elementFromDomId)(location.targetDomId);
    const layerMap = parent ? (0, dom_1.buildLayerTree)(parent) : null;
    if (!domEl || !layerMap) {
        console.warn('No domEl or layerMap found for insert element event');
        return;
    }
    electron_1.ipcRenderer.sendToHost(constants_1.WebviewChannels.ELEMENT_INSERTED, { domEl, layerMap, editText });
}
function publishRemoveElement(location) {
    const parent = (0, helpers_2.elementFromDomId)(location.targetDomId);
    const layerMap = parent ? (0, dom_1.buildLayerTree)(parent) : null;
    const parentDomEl = parent ? (0, helpers_1.getDomElement)(parent, true) : null;
    if (!parentDomEl || !layerMap) {
        console.warn('No parentDomEl or layerMap found for remove element event');
        return;
    }
    electron_1.ipcRenderer.sendToHost(constants_1.WebviewChannels.ELEMENT_REMOVED, { parentDomEl, layerMap });
}
function publishMoveElement(domEl) {
    const parent = (0, helpers_2.elementFromDomId)(domEl.domId)?.parentElement;
    const layerMap = parent ? (0, dom_1.buildLayerTree)(parent) : null;
    if (!domEl || !layerMap) {
        console.warn('No domEl or layerMap found for move element event');
        return;
    }
    electron_1.ipcRenderer.sendToHost(constants_1.WebviewChannels.ELEMENT_MOVED, { domEl, layerMap });
}
function publishGroupElement(domEl) {
    const parent = (0, helpers_2.elementFromDomId)(domEl.domId)?.parentElement;
    const layerMap = parent ? (0, dom_1.buildLayerTree)(parent) : null;
    if (!domEl || !layerMap) {
        console.warn('No domEl or layerMap found for group element event');
        return;
    }
    electron_1.ipcRenderer.sendToHost(constants_1.WebviewChannels.ELEMENT_GROUPED, { domEl, layerMap });
}
function publishUngroupElement(parentEl) {
    const parent = (0, helpers_2.elementFromDomId)(parentEl.domId)?.parentElement;
    const layerMap = parent ? (0, dom_1.buildLayerTree)(parent) : null;
    if (!parentEl || !layerMap) {
        console.warn('No parentEl or layerMap found for ungroup element event');
        return;
    }
    electron_1.ipcRenderer.sendToHost(constants_1.WebviewChannels.ELEMENT_UNGROUPED, { parentEl, layerMap });
}
function publishEditText(domEl) {
    const parent = (0, helpers_2.elementFromDomId)(domEl.domId)?.parentElement;
    const layerMap = parent ? (0, dom_1.buildLayerTree)(parent) : null;
    if (!domEl || !layerMap) {
        console.warn('No domEl or layerMap found for edit text event');
        return;
    }
    electron_1.ipcRenderer.sendToHost(constants_1.WebviewChannels.ELEMENT_TEXT_EDITED, { domEl, layerMap });
}
//# sourceMappingURL=publish.js.map