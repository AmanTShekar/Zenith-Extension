"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoveActionFromDomId = getRemoveActionFromDomId;
const helpers_1 = require("../helpers");
const helpers_2 = require("./helpers");
const helpers_3 = require("/common/helpers");
function getRemoveActionFromDomId(domId, webviewId) {
    const el = (0, helpers_3.elementFromDomId)(domId);
    if (!el) {
        console.warn('Element not found for domId:', domId);
        return;
    }
    const location = (0, helpers_1.getElementLocation)(el);
    if (!location) {
        console.warn('Failed to get location for element:', el);
        return;
    }
    const actionEl = (0, helpers_2.getActionElement)(el);
    if (!actionEl) {
        console.warn('Failed to get action element for element:', el);
        return;
    }
    return {
        type: 'remove-element',
        targets: [
            {
                webviewId,
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