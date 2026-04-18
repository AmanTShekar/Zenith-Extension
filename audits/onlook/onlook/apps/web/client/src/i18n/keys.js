"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transKeys = void 0;
const en_json_1 = __importDefault(require("../../messages/en.json"));
exports.transKeys = buildPaths(en_json_1.default);
function buildPaths(obj, prefix = '') {
    const result = {};
    for (const key of Object.keys(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        if (typeof value === 'object' && !Array.isArray(value)) {
            result[key] = buildPaths(value, path);
        }
        else {
            result[key] = path;
        }
    }
    return result;
}
//# sourceMappingURL=keys.js.map