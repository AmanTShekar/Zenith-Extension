"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_DATA_ATTR_CHARS = void 0;
exports.getOrAssignDomId = getOrAssignDomId;
exports.getOid = getOid;
exports.getInstanceId = getInstanceId;
const constants_1 = require("@onlook/constants");
const non_secure_1 = require("nanoid/non-secure");
function getOrAssignDomId(node) {
    let domId = node.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID);
    if (!domId) {
        domId = `odid-${(0, non_secure_1.nanoid)()}`;
        node.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID, domId);
    }
    return domId;
}
exports.VALID_DATA_ATTR_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-._:';
function getOid(node) {
    return node.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_ID);
}
function getInstanceId(node) {
    return node.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_INSTANCE_ID);
}
//# sourceMappingURL=ids.js.map