"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const db_1 = require("./db");
// Load .env file
(0, dotenv_1.config)({ path: '../../.env' });
(async () => {
    try {
        if (!process.env.SUPABASE_DATABASE_URL || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const missingVars = [];
            if (!process.env.SUPABASE_DATABASE_URL)
                missingVars.push('SUPABASE_DATABASE_URL');
            if (!process.env.SUPABASE_URL)
                missingVars.push('SUPABASE_URL');
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
                missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
            throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
        }
        await (0, db_1.resetDb)();
        process.exit(0);
    }
    catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    }
})();
//# sourceMappingURL=reset.js.map