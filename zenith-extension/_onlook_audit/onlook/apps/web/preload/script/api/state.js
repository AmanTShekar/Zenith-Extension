"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFrameId = setFrameId;
exports.getFrameId = getFrameId;
exports.setBranchId = setBranchId;
exports.getBranchId = getBranchId;
const __1 = require("..");
function setFrameId(frameId) {
    window._onlookFrameId = frameId;
}
function getFrameId() {
    const frameId = window._onlookFrameId;
    if (!frameId) {
        console.warn('Frame id not found');
        __1.penpalParent?.getFrameId().then((id) => {
            setFrameId(id);
        });
        return '';
    }
    return frameId;
}
function setBranchId(branchId) {
    window._onlookBranchId = branchId;
}
function getBranchId() {
    const branchId = window._onlookBranchId;
    if (!branchId) {
        console.warn('Branch id not found');
        __1.penpalParent?.getBranchId().then((id) => {
            setBranchId(id);
        });
        return '';
    }
    return branchId;
}
//# sourceMappingURL=state.js.map