"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frameRouter = void 0;
const db_1 = require("@onlook/db");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.frameRouter = (0, trpc_1.createTRPCRouter)({
    get: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        frameId: zod_1.z.string(),
    }))
        .query(async ({ ctx, input }) => {
        const dbFrame = await ctx.db.query.frames.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.frames.id, input.frameId),
        });
        if (!dbFrame) {
            return null;
        }
        return (0, db_1.fromDbFrame)(dbFrame);
    }),
    getByCanvas: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        canvasId: zod_1.z.string(),
    }))
        .query(async ({ ctx, input }) => {
        const dbFrames = await ctx.db.query.frames.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.frames.canvasId, input.canvasId),
            orderBy: (frames, { asc }) => [asc(frames.x), asc(frames.y)],
        });
        return dbFrames.map((frame) => (0, db_1.fromDbFrame)(frame));
    }),
    create: trpc_1.protectedProcedure
        .input(db_1.frameInsertSchema)
        .mutation(async ({ ctx, input }) => {
        try {
            await ctx.db.insert(db_1.frames).values(input);
            return true;
        }
        catch (error) {
            console.error('Error creating frame', error);
            return false;
        }
    }),
    update: trpc_1.protectedProcedure
        .input(db_1.frameUpdateSchema)
        .mutation(async ({ ctx, input }) => {
        try {
            await ctx.db
                .update(db_1.frames)
                .set(input)
                .where((0, drizzle_orm_1.eq)(db_1.frames.id, input.id));
            return true;
        }
        catch (error) {
            console.error('Error updating frame', error);
            return false;
        }
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        frameId: zod_1.z.string(),
    }))
        .mutation(async ({ ctx, input }) => {
        try {
            await ctx.db.delete(db_1.frames).where((0, drizzle_orm_1.eq)(db_1.frames.id, input.frameId));
            return true;
        }
        catch (error) {
            console.error('Error deleting frame', error);
            return false;
        }
    }),
});
//# sourceMappingURL=frame.js.map