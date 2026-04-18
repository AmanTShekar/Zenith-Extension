"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSettingsUpdateSchema = exports.userSettingsInsertSchema = exports.userSettingsRelations = exports.userSettings = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const user_1 = require("./user");
exports.userSettings = (0, pg_core_1.pgTable)("user_settings", {
    id: (0, pg_core_1.uuid)("id")
        .primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(() => user_1.users.id, { onDelete: "cascade", onUpdate: "cascade" })
        .unique(),
    autoApplyCode: (0, pg_core_1.boolean)("auto_apply_code").notNull().default(true),
    expandCodeBlocks: (0, pg_core_1.boolean)("expand_code_blocks").notNull().default(true),
    showSuggestions: (0, pg_core_1.boolean)("show_suggestions").notNull().default(true),
    showMiniChat: (0, pg_core_1.boolean)("show_mini_chat").notNull().default(false),
    shouldWarnDelete: (0, pg_core_1.boolean)("should_warn_delete").notNull().default(true),
}).enableRLS();
exports.userSettingsRelations = (0, drizzle_orm_1.relations)(exports.userSettings, ({ one }) => ({
    user: one(user_1.users, {
        fields: [exports.userSettings.userId],
        references: [user_1.users.id],
    }),
}));
exports.userSettingsInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userSettings);
exports.userSettingsUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.userSettings);
//# sourceMappingURL=settings.js.map