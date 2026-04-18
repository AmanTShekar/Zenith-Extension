"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frameRelations = exports.frameUpdateSchema = exports.frameInsertSchema = exports.frames = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const project_1 = require("../project");
const canvas_1 = require("./canvas");
exports.frames = (0, pg_core_1.pgTable)("frames", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    canvasId: (0, pg_core_1.uuid)("canvas_id")
        .notNull()
        .references(() => canvas_1.canvases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    branchId: (0, pg_core_1.uuid)("branch_id")
        // .notNull() // will need to be null before final migration
        .references(() => project_1.branches.id, { onDelete: "cascade", onUpdate: "cascade" }),
    url: (0, pg_core_1.varchar)("url").notNull(),
    // display data
    x: (0, pg_core_1.numeric)("x").notNull(),
    y: (0, pg_core_1.numeric)("y").notNull(),
    width: (0, pg_core_1.numeric)("width").notNull(),
    height: (0, pg_core_1.numeric)("height").notNull(),
    // deprecated
    type: (0, pg_core_1.text)("type"),
}).enableRLS();
exports.frameInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.frames);
exports.frameUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.frames, {
    id: zod_1.z.uuid(),
});
exports.frameRelations = (0, drizzle_orm_1.relations)(exports.frames, ({ one }) => ({
    canvas: one(canvas_1.canvases, {
        fields: [exports.frames.canvasId],
        references: [canvas_1.canvases.id],
    }),
    branch: one(project_1.branches, {
        fields: [exports.frames.branchId],
        references: [project_1.branches.id],
    }),
}));
//# sourceMappingURL=frame.js.map