"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSession = updateSession;
const env_1 = require("@/env");
const ssr_1 = require("@supabase/ssr");
const server_1 = require("next/server");
async function updateSession(request) {
    let supabaseResponse = server_1.NextResponse.next({
        request,
    });
    const supabase = (0, ssr_1.createServerClient)(env_1.env.NEXT_PUBLIC_SUPABASE_URL, env_1.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                supabaseResponse = server_1.NextResponse.next({
                    request,
                });
                cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
            },
        },
    });
    // refreshing the auth token
    await supabase.auth.getUser();
    return supabaseResponse;
}
//# sourceMappingURL=middleware.js.map