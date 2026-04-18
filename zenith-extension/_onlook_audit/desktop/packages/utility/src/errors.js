"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareErrors = compareErrors;
function compareErrors(a, b) {
    if (a.sourceId === b.sourceId && a.content === b.content) {
        return true;
    }
    return false;
}
//# sourceMappingURL=errors.js.map