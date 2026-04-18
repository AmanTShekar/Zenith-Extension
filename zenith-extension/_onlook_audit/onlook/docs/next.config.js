"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
const next_1 = require("fumadocs-mdx/next");
const node_path_1 = __importDefault(require("node:path"));
const withMDX = (0, next_1.createMDX)();
const nextConfig = {
    reactStrictMode: true,
};
if (process.env.NODE_ENV === 'development') {
    nextConfig.outputFileTracingRoot = node_path_1.default.join(__dirname, '../../..');
}
exports.default = withMDX(nextConfig);
//# sourceMappingURL=next.config.js.map