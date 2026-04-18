"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectCustomDomainRelation = exports.projectCustomDomains = exports.projectCustomDomainStatusEnum = exports.ProjectCustomDomainStatus = exports.PROJECT_CUSTOM_DOMAIN_PROJECT_RELATION_NAME = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const project_1 = require("../../project");
const domain_1 = require("./domain");
exports.PROJECT_CUSTOM_DOMAIN_PROJECT_RELATION_NAME = 'project_custom_domain_project';
var ProjectCustomDomainStatus;
(function (ProjectCustomDomainStatus) {
    ProjectCustomDomainStatus["ACTIVE"] = "active";
    ProjectCustomDomainStatus["CANCELLED"] = "cancelled";
})(ProjectCustomDomainStatus || (exports.ProjectCustomDomainStatus = ProjectCustomDomainStatus = {}));
exports.projectCustomDomainStatusEnum = (0, pg_core_1.pgEnum)('project_custom_domain_status', ProjectCustomDomainStatus);
exports.projectCustomDomains = (0, pg_core_1.pgTable)('project_custom_domains', {
    fullDomain: (0, pg_core_1.text)('full_domain').notNull(),
    customDomainId: (0, pg_core_1.uuid)('custom_domain_id').notNull().references(() => domain_1.customDomains.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    projectId: (0, pg_core_1.uuid)('project_id').notNull().references(() => project_1.projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
    status: (0, exports.projectCustomDomainStatusEnum)('status').notNull().default(ProjectCustomDomainStatus.ACTIVE),
}, (table) => [(0, pg_core_1.primaryKey)({ columns: [table.customDomainId, table.projectId] })]).enableRLS();
exports.projectCustomDomainRelation = (0, drizzle_orm_1.relations)(exports.projectCustomDomains, ({ one }) => ({
    customDomain: one(domain_1.customDomains, {
        fields: [exports.projectCustomDomains.customDomainId],
        references: [domain_1.customDomains.id],
    }),
    project: one(project_1.projects, {
        fields: [exports.projectCustomDomains.projectId],
        references: [project_1.projects.id],
        relationName: exports.PROJECT_CUSTOM_DOMAIN_PROJECT_RELATION_NAME,
    }),
}));
//# sourceMappingURL=project-custom-domain.js.map