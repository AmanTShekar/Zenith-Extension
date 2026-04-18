"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nextConfig = {
    reactStrictMode: true, output: "standalone", distDir: process.env.NODE_ENV === "production" ? ".next-prod" : ".next", typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true }
};
exports.default = nextConfig;
//# sourceMappingURL=expected.js.map