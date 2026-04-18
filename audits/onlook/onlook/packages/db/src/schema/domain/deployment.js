"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploymentUpdateSchema = exports.deploymentInsertSchema = exports.deploymentRelations = exports.deployments = exports.deploymentType = exports.deploymentStatus = void 0;
const models_1 = require("@onlook/models");
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const project_1 = require("../project");
const user_1 = require("../user/user");
exports.deploymentStatus = (0, pg_core_1.pgEnum)('deployment_status', models_1.DeploymentStatus);
exports.deploymentType = (0, pg_core_1.pgEnum)('deployment_type', models_1.DeploymentType);
exports.deployments = (0, pg_core_1.pgTable)('deployments', {
    id: (0, pg_core_1.uuid)('id').primaryKey(),
    requestedBy: (0, pg_core_1.uuid)('requested_by').references(() => user_1.users.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
    projectId: (0, pg_core_1.uuid)('project_id').references(() => project_1.projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
    sandboxId: (0, pg_core_1.text)('sandbox_id'),
    urls: (0, pg_core_1.text)('urls').array(),
    type: (0, exports.deploymentType)('type').notNull(),
    status: (0, exports.deploymentStatus)('status').notNull(),
    // Deployment progress
    message: (0, pg_core_1.text)('message'),
    buildLog: (0, pg_core_1.text)('build_log'),
    error: (0, pg_core_1.text)('error'),
    progress: (0, pg_core_1.integer)('progress'),
    // Custom deployment settings
    buildScript: (0, pg_core_1.text)('build_script'),
    buildFlags: (0, pg_core_1.text)('build_flags'),
    envVars: (0, pg_core_1.jsonb)('env_vars').$type(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
}).enableRLS();
exports.deploymentRelations = (0, drizzle_orm_1.relations)(exports.deployments, ({ one }) => ({
    project: one(project_1.projects, {
        fields: [exports.deployments.projectId],
        references: [project_1.projects.id],
    }),
    requestedBy: one(user_1.users, {
        fields: [exports.deployments.requestedBy],
        references: [user_1.users.id],
    }),
}));
exports.deploymentInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.deployments);
exports.deploymentUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.deployments, {
    id: zod_1.z.string().uuid(),
});
//# sourceMappingURL=deployment.js.map