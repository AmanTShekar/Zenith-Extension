"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchRelations = exports.branchUpdateSchema = exports.branchInsertSchema = exports.branches = exports.PROJECT_BRANCH_RELATION_NAME = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const frame_1 = require("../canvas/frame");
const project_1 = require("./project");
exports.PROJECT_BRANCH_RELATION_NAME = 'project_branch';
exports.branches = (0, pg_core_1.pgTable)('branches', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)('project_id')
        .notNull()
        .references(() => project_1.projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    // branch metadata
    name: (0, pg_core_1.varchar)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
    isDefault: (0, pg_core_1.boolean)('is_default').default(false).notNull(),
    // git
    gitBranch: (0, pg_core_1.varchar)('git_branch'),
    gitCommitSha: (0, pg_core_1.varchar)('git_commit_sha'),
    gitRepoUrl: (0, pg_core_1.varchar)('git_repo_url'),
    // sandbox 
    sandboxId: (0, pg_core_1.varchar)('sandbox_id').notNull(),
}, (table) => [
    (0, pg_core_1.index)('branches_project_id_idx').on(table.projectId),
    (0, pg_core_1.uniqueIndex)('branches_name_per_project_ux').on(table.projectId, table.name),
    (0, pg_core_1.uniqueIndex)('branches_default_per_project_ux')
        .on(table.projectId)
        .where((0, drizzle_orm_1.sql) `${table.isDefault} = true`),
]).enableRLS();
exports.branchInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.branches);
exports.branchUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.branches, {
    id: zod_1.z.string().uuid(),
});
exports.branchRelations = (0, drizzle_orm_1.relations)(exports.branches, ({ one, many }) => ({
    project: one(project_1.projects, {
        fields: [exports.branches.projectId],
        references: [project_1.projects.id],
        relationName: exports.PROJECT_BRANCH_RELATION_NAME,
    }),
    frames: many(frame_1.frames),
}));
//# sourceMappingURL=branch.js.map