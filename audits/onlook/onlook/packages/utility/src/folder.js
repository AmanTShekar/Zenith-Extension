"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = void 0;
/**
 * Normalizes a path by removing empty segments and double slashes
 */
const normalizePath = (path) => {
    return path.split('/').filter(Boolean).join('/');
};
exports.normalizePath = normalizePath;
//# sourceMappingURL=folder.js.map