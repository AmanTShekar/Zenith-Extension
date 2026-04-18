"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
const env_1 = require("@/env");
const ssr_1 = require("@supabase/ssr");
const headers_1 = require("next/headers");
async function createClient() {
    const cookieStore = await (0, headers_1.cookies)();
    // Create a server's supabase client with newly configured cookie,
    // which could be used to maintain user's session
    return (0, ssr_1.createServerClient)(env_1.env.NEXT_PUBLIC_SUPABASE_URL, env_1.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                }
                catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
            },
        },
    });
}
//# sourceMappingURL=server.js.map