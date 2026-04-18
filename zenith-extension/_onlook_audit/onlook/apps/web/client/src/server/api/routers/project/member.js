"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberRouter = void 0;
const db_1 = require("@onlook/db");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.memberRouter = (0, trpc_1.createTRPCRouter)({
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string(),
    }))
        .query(async ({ ctx, input }) => {
        const members = await ctx.db.query.userProjects.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.userProjects.projectId, input.projectId),
            with: {
                user: true,
            },
        });
        // TODO: Fix this later
        return members.map((member) => ({
            role: member.role,
            user: (0, db_1.fromDbUser)({
                id: member.user.id,
                email: member.user.email,
                createdAt: new Date(),
                updatedAt: new Date(),
                // @ts-expect-error - TODO: Fix this later
                firstName: member.user.firstName ?? '',
                // @ts-expect-error - TODO: Fix this later
                lastName: member.user.lastName ?? '',
                // @ts-expect-error - TODO: Fix this later
                displayName: member.user.displayName ?? '',
                // @ts-expect-error - TODO: Fix this later
                avatarUrl: member.user.avatarUrl ?? '',
                // @ts-expect-error - TODO: Fix this later
                stripeCustomerId: member.user.stripeCustomerId ?? null,
                // @ts-expect-error - TODO: Fix this later
                githubInstallationId: member.user.githubInstallationId ?? null,
            }),
        }));
    }),
    remove: trpc_1.protectedProcedure
        .input(zod_1.z.object({ userId: zod_1.z.string(), projectId: zod_1.z.string() }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db
            .delete(db_1.userProjects)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.userProjects.userId, input.userId), (0, drizzle_orm_1.eq)(db_1.userProjects.projectId, input.projectId)));
        return true;
    }),
});
//# sourceMappingURL=member.js.map