"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncate = exports.platformSlash = void 0;
exports.getTruncatedFileName = getTruncatedFileName;
exports.platformSlash = '/';
const truncate = (str, length) => {
    if (!str || str.length <= length)
        return str ?? null;
    return `${str.slice(0, length - 3)}...`;
};
exports.truncate = truncate;
function getTruncatedFileName(fileName) {
    const parts = fileName.split(exports.platformSlash);
    return parts[parts.length - 1] ?? '';
}
//# sourceMappingURL=truncate.js.map