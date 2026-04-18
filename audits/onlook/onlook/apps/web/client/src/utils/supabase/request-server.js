"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
const env_1 = require("@/env");
const ssr_1 = require("@supabase/ssr");
async function createClient(request) {
    // Create a server's supabase client with newly configured cookie,
    // which could be used to maintain user's session
    return (0, ssr_1.createServerClient)(env_1.env.NEXT_PUBLIC_SUPABASE_URL, env_1.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
        },
    });
}
//# sourceMappingURL=request-server.js.map