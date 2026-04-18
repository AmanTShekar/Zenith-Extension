"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncate = void 0;
const truncate = (str, length) => {
    if (!str || str.length <= length)
        return str ?? null;
    return `${str.slice(0, length - 3)}...`;
};
exports.truncate = truncate;
//# sourceMappingURL=truncate.js.map