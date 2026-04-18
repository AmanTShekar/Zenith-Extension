"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
let supabase;
function getSupabaseClient() {
    if (supabase)
        return supabase;
    try {
        if (!import.meta.env.VITE_SUPABASE_API_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            throw new Error('Supabase environment variables not set, running in offline mode');
        }
        supabase = (0, supabase_js_1.createClient)(import.meta.env.VITE_SUPABASE_API_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
        return supabase;
    }
    catch (error) {
        console.error('Error initializing Supabase:', error);
        return undefined;
    }
}
exports.default = getSupabaseClient();
//# sourceMappingURL=index.js.map