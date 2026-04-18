"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRouter = void 0;
const db_1 = require("@onlook/db");
const server_1 = require("@trpc/server");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.settingsRouter = (0, trpc_1.createTRPCRouter)({
    get: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string(),
    }))
        .query(async ({ ctx, input }) => {
        const setting = await ctx.db.query.projectSettings.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.projectSettings.projectId, input.projectId),
        });
        if (!setting) {
            return null;
        }
        return (0, db_1.fromDbProjectSettings)(setting);
    }),
    upsert: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string(),
        settings: db_1.projectSettingsInsertSchema,
    }))
        .mutation(async ({ ctx, input }) => {
        const [updatedSettings] = await ctx.db
            .insert(db_1.projectSettings)
            .values(input)
            .onConflictDoUpdate({
            target: [db_1.projectSettings.projectId],
            set: input.settings,
        })
            .returning();
        if (!updatedSettings) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update project settings',
            });
        }
        return (0, db_1.fromDbProjectSettings)(updatedSettings);
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string(),
    }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db
            .delete(db_1.projectSettings)
            .where((0, drizzle_orm_1.eq)(db_1.projectSettings.projectId, input.projectId));
        return true;
    }),
});
//# sourceMappingURL=settings.js.map