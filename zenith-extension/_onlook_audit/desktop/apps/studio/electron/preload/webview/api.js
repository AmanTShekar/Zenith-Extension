"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setApi = setApi;
const electron_1 = require("electron");
const dom_1 = require("./dom");
const elements_1 = require("./elements");
const helpers_1 = require("./elements/dom/helpers");
const insert_1 = require("./elements/dom/insert");
const remove_1 = require("./elements/dom/remove");
const move_1 = require("./elements/move");
const drag_1 = require("./elements/move/drag");
const style_1 = require("./elements/style");
const text_1 = require("./elements/text");
const code_1 = require("./events/code");
const state_1 = require("./state");
const theme_1 = require("./theme");
function setApi() {
    electron_1.contextBridge.exposeInMainWorld('api', {
        // Misc
        processDom: dom_1.processDom,
        getComputedStyleByDomId: style_1.getComputedStyleByDomId,
        updateElementInstance: elements_1.updateElementInstance,
        setWebviewId: state_1.setWebviewId,
        getFirstOnlookElement: helpers_1.getFirstOnlookElement,
        // Elements
        getElementAtLoc: elements_1.getElementAtLoc,
        getDomElementByDomId: elements_1.getDomElementByDomId,
        setElementType: helpers_1.setElementType,
        getElementType: helpers_1.getElementType,
        getParentElement: elements_1.getParentElement,
        getChildrenCount: elements_1.getChildrenCount,
        getOffsetParent: elements_1.getOffsetParent,
        // Actions
        getActionLocation: helpers_1.getActionLocation,
        getActionElementByDomId: helpers_1.getActionElementByDomId,
        getInsertLocation: insert_1.getInsertLocation,
        getRemoveActionFromDomId: remove_1.getRemoveActionFromDomId,
        // Theme
        getTheme: theme_1.getTheme,
        setTheme: theme_1.setTheme,
        // Drag
        startDrag: drag_1.startDrag,
        drag: drag_1.drag,
        endDrag: drag_1.endDrag,
        getElementIndex: move_1.getElementIndex,
        endAllDrag: drag_1.endAllDrag,
        // Edit text
        startEditingText: text_1.startEditingText,
        editText: text_1.editText,
        stopEditingText: text_1.stopEditingText,
        // Onlook IDE
        onOnlookViewCode: code_1.onOnlookViewCode,
        removeOnlookViewCode: code_1.removeOnlookViewCode,
        viewCodeInOnlook: code_1.viewCodeInOnlook,
    });
}
//# sourceMappingURL=api.js.map