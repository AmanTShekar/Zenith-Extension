"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCanvasRouter = void 0;
const db_1 = require("@onlook/db");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.userCanvasRouter = (0, trpc_1.createTRPCRouter)({
    get: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string(),
    }))
        .query(async ({ ctx, input }) => {
        const userCanvas = await ctx.db.query.userCanvases.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.canvases.projectId, input.projectId), (0, drizzle_orm_1.eq)(db_1.userCanvases.userId, ctx.user.id)),
            with: {
                canvas: true,
            },
        });
        if (!userCanvas) {
            throw new Error('User canvas not found');
        }
        return (0, db_1.fromDbCanvas)(userCanvas);
    }),
    getWithFrames: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string(),
    }))
        .query(async ({ ctx, input }) => {
        const dbCanvas = await ctx.db.query.canvases.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.canvases.projectId, input.projectId),
            with: {
                frames: true,
                userCanvases: {
                    where: (0, drizzle_orm_1.eq)(db_1.userCanvases.userId, ctx.user.id),
                },
            },
        });
        if (!dbCanvas) {
            return null;
        }
        const userCanvas = dbCanvas.userCanvases[0] ?? (0, db_1.createDefaultUserCanvas)(ctx.user.id, dbCanvas.id);
        return {
            userCanvas: (0, db_1.fromDbCanvas)(userCanvas),
            frames: dbCanvas.frames.map(db_1.fromDbFrame),
        };
    }),
    update: trpc_1.protectedProcedure.input(zod_1.z.object({
        projectId: zod_1.z.string(),
        canvasId: zod_1.z.string(),
        canvas: db_1.userCanvasUpdateSchema,
    })).mutation(async ({ ctx, input }) => {
        try {
            await ctx.db
                .update(db_1.userCanvases)
                .set(input.canvas)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.userCanvases.canvasId, input.canvasId), (0, drizzle_orm_1.eq)(db_1.userCanvases.userId, ctx.user.id)));
            await ctx.db.update(db_1.projects).set({
                updatedAt: new Date(),
            }).where((0, drizzle_orm_1.eq)(db_1.projects.id, input.projectId));
            return true;
        }
        catch (error) {
            console.error('Error updating user canvas', error);
            return false;
        }
    }),
});
//# sourceMappingURL=user-canvas.js.map