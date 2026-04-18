"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCanvasesRelations = exports.userCanvasUpdateSchema = exports.userCanvasInsertSchema = exports.userCanvases = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const schema_1 = require("../../schema");
const user_1 = require("./user");
exports.userCanvases = (0, pg_core_1.pgTable)('user_canvases', {
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => user_1.users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    canvasId: (0, pg_core_1.uuid)('canvas_id')
        .notNull()
        .references(() => schema_1.canvases.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    scale: (0, pg_core_1.numeric)('scale').notNull(),
    x: (0, pg_core_1.numeric)('x').notNull(),
    y: (0, pg_core_1.numeric)('y').notNull(),
}, (table) => [(0, pg_core_1.primaryKey)({ columns: [table.userId, table.canvasId] })]).enableRLS();
exports.userCanvasInsertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userCanvases);
exports.userCanvasUpdateSchema = (0, drizzle_zod_1.createUpdateSchema)(exports.userCanvases);
exports.userCanvasesRelations = (0, drizzle_orm_1.relations)(exports.userCanvases, ({ one }) => ({
    user: one(user_1.users, {
        fields: [exports.userCanvases.userId],
        references: [user_1.users.id],
    }),
    canvas: one(schema_1.canvases, {
        fields: [exports.userCanvases.canvasId],
        references: [schema_1.canvases.id],
    }),
}));
//# sourceMappingURL=user-canvas.js.map