"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrAssignDomId = getOrAssignDomId;
const constants_1 = require("@onlook/models/constants");
const bundles_1 = require("./bundles");
function getOrAssignDomId(node) {
    let domId = node.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID);
    if (!domId) {
        domId = `odid-${(0, bundles_1.uuid)()}`;
        node.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID, domId);
    }
    return domId;
}
//# sourceMappingURL=ids.js.map