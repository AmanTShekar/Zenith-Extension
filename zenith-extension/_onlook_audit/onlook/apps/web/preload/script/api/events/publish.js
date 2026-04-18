"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishDomProcessed = publishDomProcessed;
const __1 = require("../..");
function publishDomProcessed(layerMap, rootNode) {
    if (!__1.penpalParent)
        return;
    __1.penpalParent.onDomProcessed({
        layerMap: Object.fromEntries(layerMap),
        rootNode
    }).catch((error) => {
        console.error('Failed to send DOM processed event:', error);
    });
}
//# sourceMappingURL=publish.js.map