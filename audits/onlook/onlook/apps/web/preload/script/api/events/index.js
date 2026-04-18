"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForDomChanges = listenForDomChanges;
const dom_1 = require("./dom");
function listenForDomChanges() {
    (0, dom_1.listenForDomMutation)();
    (0, dom_1.listenForResize)();
}
//# sourceMappingURL=index.js.map