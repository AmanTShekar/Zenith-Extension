"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canvasRelations = exports.canvasUpdateSchema = exports.canvases = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const project_1 = require("../project");
const user_1 = require("../user");
const frame_1 = require("./frame");
exports.canvases = (0, pg_core_1.pgTable)('canvas', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)('project_id')
        .notNull()
        .references(() => project_1.projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}).enableRLS();
exports.canvasUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.canvases);
exports.canvasRelations = (0, drizzle_orm_1.relations)(exports.canvases, ({ one, many }) => ({
    frames: many(frame_1.frames),
    userCanvases: many(user_1.userCanvases),
    project: one(project_1.projects, {
        fields: [exports.canvases.projectId],
        references: [project_1.projects.id],
    }),
}));
//# sourceMappingURL=canvas.js.map