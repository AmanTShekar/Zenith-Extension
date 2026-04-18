"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
// Dynamic robots.txt using Next.js route handler
const server_1 = require("next/server");
function GET() {
    const body = `User-agent: *\nAllow: /\nSitemap: https://docs.onlook.dev/sitemap.xml`;
    return new server_1.NextResponse(body, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
//# sourceMappingURL=route.js.map