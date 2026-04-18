"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStyle = updateStyle;
const elements_1 = require("../elements");
const css_manager_1 = require("./css-manager");
function updateStyle(domId, change) {
    css_manager_1.cssManager.updateStyle(domId, change.updated);
    return (0, elements_1.getElementByDomId)(domId, true);
}
//# sourceMappingURL=update.js.map