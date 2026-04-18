"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUsers = exports.authSchema = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.authSchema = (0, pg_core_1.pgSchema)('auth');
exports.authUsers = exports.authSchema.table('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    email: (0, pg_core_1.text)('email').notNull(),
    emailConfirmedAt: (0, pg_core_1.timestamp)('email_confirmed_at'),
    rawUserMetaData: (0, pg_core_1.jsonb)('raw_user_meta_data'),
});
//# sourceMappingURL=user.js.map