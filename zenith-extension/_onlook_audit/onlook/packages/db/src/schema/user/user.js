"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInsertSchema = exports.usersRelations = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const project_1 = require("../project");
const subscription_1 = require("../subscription");
const subscription_2 = require("../subscription/subscription");
const supabase_1 = require("../supabase");
const settings_1 = require("./settings");
const user_canvas_1 = require("./user-canvas");
const user_project_1 = require("./user-project");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id')
        .primaryKey()
        .references(() => supabase_1.authUsers.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    firstName: (0, pg_core_1.text)('first_name'),
    lastName: (0, pg_core_1.text)('last_name'),
    displayName: (0, pg_core_1.text)('display_name'),
    avatarUrl: (0, pg_core_1.text)('avatar_url'),
    email: (0, pg_core_1.text)('email'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
    stripeCustomerId: (0, pg_core_1.text)('stripe_customer_id'),
    githubInstallationId: (0, pg_core_1.text)('github_installation_id'),
}).enableRLS();
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many, one }) => ({
    userCanvases: many(user_canvas_1.userCanvases),
    userProjects: many(user_project_1.userProjects),
    userSettings: one(settings_1.userSettings),
    authUser: one(supabase_1.authUsers),
    subscriptions: many(subscription_2.subscriptions),
    usageRecords: many(subscription_1.usageRecords),
    projectInvitations: many(project_1.projectInvitations),
}));
exports.userInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
//# sourceMappingURL=user.js.map