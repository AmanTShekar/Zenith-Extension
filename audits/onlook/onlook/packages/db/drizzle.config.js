"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
exports.default = (0, drizzle_kit_1.defineConfig)({
    schema: './src/schema',
    out: '../../apps/backend/supabase/migrations',
    dialect: "postgresql",
    schemaFilter: ["public"],
    verbose: true,
    dbCredentials: {
        url: process.env.SUPABASE_DATABASE_URL ?? DEFAULT_DATABASE_URL,
    },
    entities: {
        roles: {
            provider: 'supabase'
        }
    }
});
//# sourceMappingURL=drizzle.config.js.map