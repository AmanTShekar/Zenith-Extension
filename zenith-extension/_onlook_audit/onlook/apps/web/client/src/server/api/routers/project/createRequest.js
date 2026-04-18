"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectCreateRequestRouter = void 0;
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.projectCreateRequestRouter = (0, trpc_1.createTRPCRouter)({
    getPendingRequest: trpc_1.protectedProcedure
        .input(zod_1.z.object({ projectId: zod_1.z.string() }))
        .query(async ({ ctx, input }) => {
        const request = await ctx.db.query.projectCreateRequests.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.projectCreateRequests.projectId, input.projectId), (0, drizzle_orm_1.eq)(db_1.projectCreateRequests.status, models_1.ProjectCreateRequestStatus.PENDING)),
        });
        return request ?? null;
    }),
    updateStatus: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string(),
        status: zod_1.z.nativeEnum(models_1.ProjectCreateRequestStatus),
    }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.update(db_1.projectCreateRequests).set({
            status: input.status,
        }).where((0, drizzle_orm_1.eq)(db_1.projectCreateRequests.projectId, input.projectId)).returning();
    }),
});
//# sourceMappingURL=createRequest.js.map