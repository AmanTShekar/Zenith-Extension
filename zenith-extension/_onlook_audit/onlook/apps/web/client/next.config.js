"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = __importDefault(require("next-intl/plugin"));
const node_path_1 = __importDefault(require("node:path"));
require("./src/env");
const nextConfig = {
    devIndicators: false,
    ...(process.env.STANDALONE_BUILD === 'true' && { output: 'standalone' }),
    eslint: {
        // Don't run ESLint during builds - handle it separately in CI
        ignoreDuringBuilds: true,
    },
};
if (process.env.NODE_ENV === 'development') {
    nextConfig.outputFileTracingRoot = node_path_1.default.join(__dirname, '../../..');
}
const withNextIntl = (0, plugin_1.default)({
    experimental: {
        createMessagesDeclaration: './messages/en.json'
    }
});
exports.default = withNextIntl(nextConfig);
//# sourceMappingURL=next.config.js.map