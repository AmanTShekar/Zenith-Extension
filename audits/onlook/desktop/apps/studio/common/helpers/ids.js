"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_DATA_ATTR_CHARS = void 0;
exports.getOid = getOid;
exports.getInstanceId = getInstanceId;
const constants_1 = require("@onlook/models/constants");
exports.VALID_DATA_ATTR_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-._:';
function getOid(node) {
    return node.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_ID);
}
function getInstanceId(node) {
    return node.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_INSTANCE_ID);
}
//# sourceMappingURL=ids.js.map