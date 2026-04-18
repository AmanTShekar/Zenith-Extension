"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewDomainRelations = exports.previewDomains = exports.PREVIEW_DOMAIN_PROJECT_RELATION_NAME = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const project_1 = require("../project");
exports.PREVIEW_DOMAIN_PROJECT_RELATION_NAME = 'preview_domain_project';
exports.previewDomains = (0, pg_core_1.pgTable)('preview_domains', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    fullDomain: (0, pg_core_1.text)('full_domain').notNull().unique(),
    projectId: (0, pg_core_1.uuid)('project_id').references(() => project_1.projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
}).enableRLS();
exports.previewDomainRelations = (0, drizzle_orm_1.relations)(exports.previewDomains, ({ one }) => ({
    project: one(project_1.projects, {
        fields: [exports.previewDomains.projectId],
        references: [project_1.projects.id],
        relationName: exports.PREVIEW_DOMAIN_PROJECT_RELATION_NAME,
    }),
}));
//# sourceMappingURL=preview.js.map