"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackSubmitSchema = exports.feedbackInsertSchema = exports.feedbacksRelations = exports.feedbacks = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const user_1 = require("../user");
// deprecated
exports.feedbacks = (0, pg_core_1.pgTable)('feedbacks', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom().notNull(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => user_1.users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    email: (0, pg_core_1.text)('email'),
    message: (0, pg_core_1.text)('message').notNull(),
    pageUrl: (0, pg_core_1.text)('page_url'),
    userAgent: (0, pg_core_1.text)('user_agent'),
    attachments: (0, pg_core_1.jsonb)('attachments').$type().default([]).notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata').$type().default({}).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
}).enableRLS();
exports.feedbacksRelations = (0, drizzle_orm_1.relations)(exports.feedbacks, ({ one }) => ({
    user: one(user_1.users, {
        fields: [exports.feedbacks.userId],
        references: [user_1.users.id],
    }),
}));
const attachmentSchema = zod_1.z.object({
    name: zod_1.z.string(),
    size: zod_1.z.number().min(0),
    type: zod_1.z.string(),
    url: zod_1.z.string().url(),
    uploadedAt: zod_1.z.string(),
});
exports.feedbackInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.feedbacks, {
    message: zod_1.z.string().min(1, 'Message is required').max(5000, 'Message is too long'),
    email: zod_1.z.string().email('Invalid email format').optional(),
    pageUrl: zod_1.z.url('Invalid URL format').optional(),
    attachments: zod_1.z.array(attachmentSchema).default([]),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).default({}),
});
exports.feedbackSubmitSchema = exports.feedbackInsertSchema.pick({
    message: true,
    email: true,
    pageUrl: true,
    userAgent: true,
    attachments: true,
    metadata: true,
});
//# sourceMappingURL=index.js.map