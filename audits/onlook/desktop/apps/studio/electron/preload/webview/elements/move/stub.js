"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStub = createStub;
exports.moveStub = moveStub;
exports.removeStub = removeStub;
exports.getCurrentStubIndex = getCurrentStubIndex;
const helpers_1 = require("./helpers");
const constants_1 = require("@onlook/models/constants");
function createStub(el) {
    const stub = document.createElement('div');
    const styles = window.getComputedStyle(el);
    stub.id = constants_1.EditorAttributes.ONLOOK_STUB_ID;
    stub.style.width = styles.width;
    stub.style.height = styles.height;
    stub.style.margin = styles.margin;
    stub.style.padding = styles.padding;
    stub.style.borderRadius = styles.borderRadius;
    stub.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    stub.style.display = 'none';
    document.body.appendChild(stub);
}
function moveStub(el, x, y) {
    const stub = document.getElementById(constants_1.EditorAttributes.ONLOOK_STUB_ID);
    if (!stub) {
        return;
    }
    const parent = el.parentElement;
    if (!parent) {
        return;
    }
    let displayDirection = el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_DIRECTION);
    if (!displayDirection) {
        displayDirection = (0, helpers_1.getDisplayDirection)(parent);
    }
    // Check if the parent is using grid layout
    const parentStyle = window.getComputedStyle(parent);
    const isGridLayout = parentStyle.display === 'grid';
    const siblings = Array.from(parent.children).filter((child) => child !== el && child !== stub);
    let insertionIndex;
    if (isGridLayout) {
        insertionIndex = (0, helpers_1.findGridInsertionIndex)(parent, siblings, x, y);
    }
    else {
        insertionIndex = (0, helpers_1.findInsertionIndex)(siblings, x, y, displayDirection);
    }
    stub.remove();
    // Append element at the insertion index
    if (insertionIndex >= siblings.length) {
        parent.appendChild(stub);
    }
    else {
        parent.insertBefore(stub, siblings[insertionIndex]);
    }
    stub.style.display = 'block';
}
function removeStub() {
    const stub = document.getElementById(constants_1.EditorAttributes.ONLOOK_STUB_ID);
    if (!stub) {
        return;
    }
    stub.remove();
}
function getCurrentStubIndex(parent, el) {
    const stub = document.getElementById(constants_1.EditorAttributes.ONLOOK_STUB_ID);
    if (!stub) {
        return -1;
    }
    const siblings = Array.from(parent.children).filter((child) => child !== el);
    return siblings.indexOf(stub);
}
//# sourceMappingURL=stub.js.map