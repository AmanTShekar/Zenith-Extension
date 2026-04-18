"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usageRelations = exports.usageRecords = exports.usageTypes = void 0;
const models_1 = require("@onlook/models");
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = require("../user");
exports.usageTypes = (0, pg_core_1.pgEnum)('usage_types', models_1.UsageType);
exports.usageRecords = (0, pg_core_1.pgTable)('usage_records', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    // Relationships
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => user_1.users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    // Metadata
    type: (0, exports.usageTypes)('type').default(models_1.UsageType.MESSAGE).notNull(),
    timestamp: (0, pg_core_1.timestamp)('timestamp', { withTimezone: true }).notNull(),
    traceId: (0, pg_core_1.varchar)('trace_id', { length: 255 }),
}, (table) => [
    (0, pg_core_1.index)('usage_records_user_time_idx').on(table.userId, table.timestamp),
    (0, pg_core_1.unique)('usage_records_user_trace_idx').on(table.userId, table.traceId)
]).enableRLS();
exports.usageRelations = (0, drizzle_orm_1.relations)(exports.usageRecords, ({ one }) => ({
    user: one(user_1.users, {
        fields: [exports.usageRecords.userId],
        references: [user_1.users.id],
    })
}));
//# sourceMappingURL=usage.js.map