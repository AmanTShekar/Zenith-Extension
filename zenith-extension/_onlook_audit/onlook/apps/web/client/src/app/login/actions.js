"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.devLogin = devLogin;
const env_1 = require("@/env");
const constants_1 = require("@/utils/constants");
const server_1 = require("@/utils/supabase/server");
const db_1 = require("@onlook/db");
const headers_1 = require("next/headers");
const navigation_1 = require("next/navigation");
async function login(provider) {
    const supabase = await (0, server_1.createClient)();
    const origin = (await (0, headers_1.headers)()).get('origin') ?? env_1.env.NEXT_PUBLIC_SITE_URL;
    const redirectTo = `${origin}${constants_1.Routes.AUTH_CALLBACK}`;
    // If already session, redirect
    const { data: { session }, } = await supabase.auth.getSession();
    if (session) {
        (0, navigation_1.redirect)(constants_1.Routes.AUTH_REDIRECT);
    }
    // Start OAuth flow
    // Note: User object will be created in the auth callback route if it doesn't exist
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo,
        },
    });
    if (error) {
        (0, navigation_1.redirect)('/error');
    }
    (0, navigation_1.redirect)(data.url);
}
async function devLogin() {
    if (env_1.env.NODE_ENV !== 'development') {
        throw new Error('Dev login is only available in development mode');
    }
    const supabase = await (0, server_1.createClient)();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        (0, navigation_1.redirect)(constants_1.Routes.AUTH_REDIRECT);
    }
    const { data, error } = await supabase.auth.signInWithPassword({
        email: db_1.SEED_USER.EMAIL,
        password: db_1.SEED_USER.PASSWORD,
    });
    if (error) {
        console.error('Error signing in with password:', error);
        throw new Error(error.message);
    }
    (0, navigation_1.redirect)(constants_1.Routes.AUTH_REDIRECT);
}
//# sourceMappingURL=actions.js.map