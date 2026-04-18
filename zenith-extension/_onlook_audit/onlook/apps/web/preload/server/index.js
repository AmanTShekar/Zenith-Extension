"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_1 = require("bun");
const path_1 = __importDefault(require("path"));
const server = (0, bun_1.serve)({
    port: 8083,
    async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/") {
            try {
                const resolvedPath = path_1.default.resolve(import.meta.dir + "/../../client/public/onlook-preload-script.js");
                const file = Bun.file(resolvedPath);
                return new Response(file, {
                    headers: {
                        "Content-Type": "application/javascript",
                        "Cache-Control": "public, max-age=31536000",
                        "Access-Control-Allow-Origin": "*",
                    },
                });
            }
            catch (error) {
                return new Response("Script not found", { status: 404 });
            }
        }
        return new Response("Not found", { status: 404 });
    },
});
console.log(`CDN server listening on http://localhost:${server.port}`);
//# sourceMappingURL=index.js.map