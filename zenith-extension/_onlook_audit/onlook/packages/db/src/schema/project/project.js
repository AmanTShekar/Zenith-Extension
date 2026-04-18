"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRelations = exports.projectUpdateSchema = exports.projectInsertSchema = exports.projects = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const canvas_1 = require("../canvas");
const chat_1 = require("../chat");
const domain_1 = require("../domain");
const user_1 = require("../user");
const branch_1 = require("./branch");
const invitation_1 = require("./invitation");
const settings_1 = require("./settings");
exports.projects = (0, pg_core_1.pgTable)('projects', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    // metadata
    name: (0, pg_core_1.varchar)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    tags: (0, pg_core_1.varchar)('tags').array().default([]),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
    // preview image
    previewImgUrl: (0, pg_core_1.varchar)('preview_img_url'),
    previewImgPath: (0, pg_core_1.varchar)('preview_img_path'),
    previewImgBucket: (0, pg_core_1.varchar)('preview_img_bucket'),
    updatedPreviewImgAt: (0, pg_core_1.timestamp)('updated_preview_img_at', { withTimezone: true }),
    // deprecated
    sandboxId: (0, pg_core_1.varchar)('sandbox_id'),
    sandboxUrl: (0, pg_core_1.varchar)('sandbox_url'),
}).enableRLS();
exports.projectInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.projects);
exports.projectUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.projects, {
    id: zod_1.z.string().uuid(),
});
exports.projectRelations = (0, drizzle_orm_1.relations)(exports.projects, ({ one, many }) => ({
    canvas: one(canvas_1.canvases, {
        fields: [exports.projects.id],
        references: [canvas_1.canvases.projectId],
    }),
    userProjects: many(user_1.userProjects),
    conversations: many(chat_1.conversations, {
        relationName: chat_1.PROJECT_CONVERSATION_RELATION_NAME,
    }),
    projectInvitations: many(invitation_1.projectInvitations),
    projectCustomDomains: many(domain_1.projectCustomDomains, {
        relationName: domain_1.PROJECT_CUSTOM_DOMAIN_PROJECT_RELATION_NAME,
    }),
    previewDomains: many(domain_1.previewDomains, {
        relationName: domain_1.PREVIEW_DOMAIN_PROJECT_RELATION_NAME,
    }),
    settings: one(settings_1.projectSettings, {
        fields: [exports.projects.id],
        references: [settings_1.projectSettings.projectId],
    }),
    branches: many(branch_1.branches, {
        relationName: branch_1.PROJECT_BRANCH_RELATION_NAME,
    }),
}));
//# sourceMappingURL=project.js.map