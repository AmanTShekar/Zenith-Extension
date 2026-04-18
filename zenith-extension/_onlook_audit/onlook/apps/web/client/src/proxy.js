"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.proxy = proxy;
const middleware_1 = require("@/utils/supabase/middleware");
async function proxy(request) {
    // update user's auth session
    return await (0, middleware_1.updateSession)(request);
}
exports.config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
//# sourceMappingURL=proxy.js.map