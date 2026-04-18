"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preloadMethods = void 0;
const dom_1 = require("./dom");
const elements_1 = require("./elements");
const group_1 = require("./elements/dom/group");
const helpers_1 = require("./elements/dom/helpers");
const image_1 = require("./elements/dom/image");
const insert_1 = require("./elements/dom/insert");
const remove_1 = require("./elements/dom/remove");
const move_1 = require("./elements/move");
const drag_1 = require("./elements/move/drag");
const style_1 = require("./elements/style");
const text_1 = require("./elements/text");
const ready_1 = require("./ready");
const screenshot_1 = require("./screenshot");
const state_1 = require("./state");
const style_2 = require("./style");
const theme_1 = require("./theme");
function withTryCatch(fn) {
    return ((...args) => {
        try {
            return fn(...args);
        }
        catch (error) {
            console.error(`Error in ${fn.name}:`, error);
            return null;
        }
    });
}
const rawMethods = {
    // Misc
    processDom: dom_1.processDom,
    setFrameId: state_1.setFrameId,
    setBranchId: state_1.setBranchId,
    getComputedStyleByDomId: style_1.getComputedStyleByDomId,
    updateElementInstance: elements_1.updateElementInstance,
    getFirstOnlookElement: helpers_1.getFirstOnlookElement,
    captureScreenshot: screenshot_1.captureScreenshot,
    buildLayerTree: dom_1.buildLayerTree,
    // Elements
    getElementAtLoc: elements_1.getElementAtLoc,
    getElementByDomId: elements_1.getElementByDomId,
    getElementIndex: move_1.getElementIndex,
    setElementType: helpers_1.setElementType,
    getElementType: helpers_1.getElementType,
    getParentElement: elements_1.getParentElement,
    getChildrenCount: elements_1.getChildrenCount,
    getOffsetParent: elements_1.getOffsetParent,
    // Actions
    getActionLocation: helpers_1.getActionLocation,
    getActionElement: helpers_1.getActionElement,
    getInsertLocation: insert_1.getInsertLocation,
    getRemoveAction: remove_1.getRemoveAction,
    // Theme
    getTheme: theme_1.getTheme,
    setTheme: theme_1.setTheme,
    // Drag
    startDrag: drag_1.startDrag,
    drag: drag_1.drag,
    dragAbsolute: drag_1.dragAbsolute,
    endDrag: drag_1.endDrag,
    endDragAbsolute: drag_1.endDragAbsolute,
    endAllDrag: drag_1.endAllDrag,
    // Edit text
    startEditingText: text_1.startEditingText,
    editText: text_1.editText,
    stopEditingText: text_1.stopEditingText,
    isChildTextEditable: text_1.isChildTextEditable,
    // Edit elements
    updateStyle: style_2.updateStyle,
    insertElement: insert_1.insertElement,
    removeElement: insert_1.removeElement,
    moveElement: move_1.moveElement,
    groupElements: group_1.groupElements,
    ungroupElements: group_1.ungroupElements,
    insertImage: image_1.insertImage,
    removeImage: image_1.removeImage,
    handleBodyReady: ready_1.handleBodyReady,
};
// Wrap all methods in a try/catch to prevent the preload script from crashing
exports.preloadMethods = Object.fromEntries(Object.entries(rawMethods).map(([key, fn]) => [key, withTryCatch(fn)]));
//# sourceMappingURL=index.js.map