"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectCreateRequestUpdateSchema = exports.projectCreateRequestInsertSchema = exports.projectCreateRequests = exports.projectCreateStatus = void 0;
const models_1 = require("@onlook/models");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const project_1 = require("./project");
exports.projectCreateStatus = (0, pg_core_1.pgEnum)('project_create_status', models_1.ProjectCreateRequestStatus);
exports.projectCreateRequests = (0, pg_core_1.pgTable)('project_create_requests', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)('project_id')
        .notNull()
        .unique()
        .references(() => project_1.projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    context: (0, pg_core_1.jsonb)("context").$type().notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
    status: (0, exports.projectCreateStatus)('status').notNull().default(models_1.ProjectCreateRequestStatus.PENDING),
}).enableRLS();
exports.projectCreateRequestInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.projectCreateRequests);
exports.projectCreateRequestUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.projectCreateRequests);
//# sourceMappingURL=create.js.map