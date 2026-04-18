"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = normalizePath;
const path_1 = __importDefault(require("path"));
const SANDBOX_ROOT = '/project/sandbox';
function normalizePath(p) {
    let abs = path_1.default.isAbsolute(p) ? p : path_1.default.join(SANDBOX_ROOT, p);
    let relative = path_1.default.relative(SANDBOX_ROOT, abs);
    return relative.replace(/\\/g, '/'); // Always POSIX style
}
//# sourceMappingURL=helpers.js.map