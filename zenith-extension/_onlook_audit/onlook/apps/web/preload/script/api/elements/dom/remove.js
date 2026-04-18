"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoveAction = getRemoveAction;
const helpers_1 = require("../../../helpers");
const helpers_2 = require("../helpers");
const helpers_3 = require("./helpers");
function getRemoveAction(domId, frameId) {
    const el = (0, helpers_1.getHtmlElement)(domId);
    if (!el) {
        console.warn('Element not found for domId:', domId);
        return null;
    }
    const location = (0, helpers_2.getElementLocation)(el);
    if (!location) {
        console.warn('Failed to get location for element:', el);
        return null;
    }
    const actionEl = (0, helpers_3.getActionElement)(domId);
    if (!actionEl) {
        console.warn('Failed to get action element for element:', el);
        return null;
    }
    return {
        type: 'remove-element',
        targets: [
            {
                frameId,
                branchId: actionEl.branchId,
                domId: actionEl.domId,
                oid: actionEl.oid,
            },
        ],
        location: location,
        element: actionEl,
        editText: false,
        pasteParams: null,
        codeBlock: null,
    };
}
//# sourceMappingURL=remove.js.map