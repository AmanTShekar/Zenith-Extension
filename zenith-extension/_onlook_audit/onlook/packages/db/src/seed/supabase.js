"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSupabaseUser = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const constants_1 = require("./constants");
const seedSupabaseUser = async () => {
    console.log('Seeding Supabase user...');
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }
    const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user: existingUser } } = await supabase.auth.admin.getUserById(constants_1.SEED_USER.ID);
    if (existingUser) {
        console.log('User already exists, skipping user creation');
        return;
    }
    try {
        const { data, error } = await supabase.auth.admin.createUser({
            id: constants_1.SEED_USER.ID,
            email: constants_1.SEED_USER.EMAIL,
            password: constants_1.SEED_USER.PASSWORD,
            email_confirm: true,
            user_metadata: {
                first_name: constants_1.SEED_USER.FIRST_NAME,
                last_name: constants_1.SEED_USER.LAST_NAME,
                display_name: constants_1.SEED_USER.DISPLAY_NAME,
                avatar_url: constants_1.SEED_USER.AVATAR_URL,
            },
        });
        if (error) {
            console.error('Error seeding Supabase user:', error);
            throw error;
        }
        console.log('User seeded!');
    }
    catch (error) {
        // Handle specific errors
        if (error.message?.includes('duplicate key value')) {
            console.log('User already exists with this email, skipping user creation');
            return;
        }
        console.error('Error seeding Supabase user:', error);
        throw error;
    }
};
exports.seedSupabaseUser = seedSupabaseUser;
//# sourceMappingURL=supabase.js.map