"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("@/utils/analytics/server");
const constants_1 = require("@/utils/constants");
const server_2 = require("@/utils/supabase/server");
const server_3 = require("next/server");
const server_4 = require("~/trpc/server");
async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    if (code) {
        const supabase = await (0, server_2.createClient)();
        const { error, data } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const user = await server_4.api.user.upsert({
                id: data.user.id,
            });
            if (!user) {
                console.error(`Failed to create user for id: ${data.user.id}`, { user });
                return server_3.NextResponse.redirect(`${origin}/auth/auth-code-error`);
            }
            (0, server_1.trackEvent)({
                distinctId: data.user.id,
                event: 'user_signed_in',
                properties: {
                    name: data.user.user_metadata.name,
                    email: data.user.email,
                    avatar_url: data.user.user_metadata.avatar_url,
                    $set_once: {
                        signup_date: new Date().toISOString(),
                    }
                }
            });
            // Always use the request origin to prevent open redirect via X-Forwarded-Host header manipulation
            return server_3.NextResponse.redirect(`${origin}${constants_1.Routes.AUTH_REDIRECT}`);
        }
        console.error(`Error exchanging code for session: ${error}`);
    }
    // return the user to an error page with instructions
    return server_3.NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
//# sourceMappingURL=route.js.map