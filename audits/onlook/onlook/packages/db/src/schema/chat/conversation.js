"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRelations = exports.conversationUpdateSchema = exports.conversationInsertSchema = exports.conversations = exports.agentType = exports.PROJECT_CONVERSATION_RELATION_NAME = void 0;
const models_1 = require("@onlook/models");
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const project_1 = require("../project");
const message_1 = require("./message");
exports.PROJECT_CONVERSATION_RELATION_NAME = "project_conversations";
exports.agentType = (0, pg_core_1.pgEnum)("agent_type", models_1.AgentType);
exports.conversations = (0, pg_core_1.pgTable)("conversations", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    agentType: (0, exports.agentType)("agent_type").default(models_1.AgentType.ROOT),
    projectId: (0, pg_core_1.uuid)("project_id")
        .notNull()
        .references(() => project_1.projects.id, { onDelete: "cascade", onUpdate: "cascade" }),
    displayName: (0, pg_core_1.varchar)("display_name"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
    suggestions: (0, pg_core_1.jsonb)("suggestions").$type().default([]),
}).enableRLS();
exports.conversationInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.conversations, {
    agentType: zod_1.z.enum(models_1.AgentType).optional(),
});
exports.conversationUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.conversations, {
    id: zod_1.z.uuid(),
    agentType: zod_1.z.enum(models_1.AgentType).optional(),
});
exports.conversationRelations = (0, drizzle_orm_1.relations)(exports.conversations, ({ one, many }) => ({
    project: one(project_1.projects, {
        fields: [exports.conversations.projectId],
        references: [project_1.projects.id],
        relationName: exports.PROJECT_CONVERSATION_RELATION_NAME,
    }),
    messages: many(message_1.messages, {
        relationName: message_1.CONVERSATION_MESSAGe_RELATION_NAME,
    }),
}));
//# sourceMappingURL=conversation.js.map