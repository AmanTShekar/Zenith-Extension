"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNearEqual = isNearEqual;
exports.mod = mod;
function isNearEqual(x, y, delta) {
    return Math.abs(x - y) <= delta;
}
function mod(x, y) {
    return x - y * Math.floor(x / y);
}
//# sourceMappingURL=math.js.map