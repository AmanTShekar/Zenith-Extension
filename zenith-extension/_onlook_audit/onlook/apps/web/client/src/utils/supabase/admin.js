"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminClient = void 0;
const env_1 = require("@/env");
const supabase_js_1 = require("@supabase/supabase-js");
/**
 * Admin Supabase client with service role key
 * This client has full access to the database and can bypass RLS policies
 * Use with extreme caution and only in admin procedures
 */
const createAdminClient = () => {
    return (0, supabase_js_1.createClient)(env_1.env.NEXT_PUBLIC_SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};
exports.createAdminClient = createAdminClient;
//# sourceMappingURL=admin.js.map