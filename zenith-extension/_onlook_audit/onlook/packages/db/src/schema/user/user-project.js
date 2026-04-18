"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userProjectInsertSchema = exports.userProjectsRelations = exports.userProjects = exports.projectRole = void 0;
const models_1 = require("@onlook/models");
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const project_1 = require("../project");
const user_1 = require("./user");
exports.projectRole = (0, pg_core_1.pgEnum)('project_role', models_1.ProjectRole);
exports.userProjects = (0, pg_core_1.pgTable)('user_projects', {
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => user_1.users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    projectId: (0, pg_core_1.uuid)('project_id')
        .notNull()
        .references(() => project_1.projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    role: (0, exports.projectRole)('role').notNull(),
}, (table) => [(0, pg_core_1.primaryKey)({ columns: [table.userId, table.projectId] })]).enableRLS();
exports.userProjectsRelations = (0, drizzle_orm_1.relations)(exports.userProjects, ({ one }) => ({
    user: one(user_1.users, {
        fields: [exports.userProjects.userId],
        references: [user_1.users.id],
    }),
    project: one(project_1.projects, {
        fields: [exports.userProjects.projectId],
        references: [project_1.projects.id],
    }),
}));
exports.userProjectInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userProjects);
//# sourceMappingURL=user-project.js.map