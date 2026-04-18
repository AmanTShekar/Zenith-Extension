"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectSettingsRelations = exports.projectSettingsUpdateSchema = exports.projectSettingsInsertSchema = exports.projectSettings = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const project_1 = require("./project");
exports.projectSettings = (0, pg_core_1.pgTable)('project_settings', {
    projectId: (0, pg_core_1.uuid)('project_id')
        .notNull()
        .references(() => project_1.projects.id, { onDelete: 'cascade', onUpdate: 'cascade' })
        .unique(),
    runCommand: (0, pg_core_1.text)('run_command').notNull().default(''),
    buildCommand: (0, pg_core_1.text)('build_command').notNull().default(''),
    installCommand: (0, pg_core_1.text)('install_command').notNull().default(''),
}).enableRLS();
exports.projectSettingsInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.projectSettings);
exports.projectSettingsUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.projectSettings);
exports.projectSettingsRelations = (0, drizzle_orm_1.relations)(exports.projectSettings, ({ one }) => ({
    project: one(project_1.projects, {
        fields: [exports.projectSettings.projectId],
        references: [project_1.projects.id],
    }),
}));
//# sourceMappingURL=settings.js.map