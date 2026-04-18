"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRelations = exports.messageUpdateSchema = exports.messageInsertSchema = exports.messages = exports.messageRole = exports.CONVERSATION_MESSAGe_RELATION_NAME = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const conversation_1 = require("./conversation");
exports.CONVERSATION_MESSAGe_RELATION_NAME = 'conversation_messages';
exports.messageRole = (0, pg_core_1.pgEnum)("message_role", ['user', 'assistant', 'system']);
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    conversationId: (0, pg_core_1.uuid)("conversation_id")
        .notNull()
        .references(() => conversation_1.conversations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    content: (0, pg_core_1.text)("content").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    role: (0, exports.messageRole)("role").notNull(),
    context: (0, pg_core_1.jsonb)("context").$type().default([]).notNull(),
    parts: (0, pg_core_1.jsonb)("parts").$type().default([]).notNull(),
    checkpoints: (0, pg_core_1.jsonb)("checkpoints").$type().default([]).notNull(),
    usage: (0, pg_core_1.jsonb)("usage").$type(),
    // deprecated
    applied: (0, pg_core_1.boolean)("applied"),
    commitOid: (0, pg_core_1.text)("commit_oid"),
    snapshots: (0, pg_core_1.jsonb)("snapshots").$type(),
}).enableRLS();
exports.messageInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.messages);
exports.messageUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.messages);
exports.messageRelations = (0, drizzle_orm_1.relations)(exports.messages, ({ one }) => ({
    conversation: one(conversation_1.conversations, {
        fields: [exports.messages.conversationId],
        references: [conversation_1.conversations.id],
        relationName: exports.CONVERSATION_MESSAGe_RELATION_NAME,
    }),
}));
//# sourceMappingURL=message.js.map