"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customRouter = void 0;
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const server_1 = require("@trpc/server");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.customRouter = (0, trpc_1.createTRPCRouter)({
    get: trpc_1.protectedProcedure.input(zod_1.z.object({
        projectId: zod_1.z.string(),
    })).query(async ({ ctx, input }) => {
        const customDomain = await ctx.db.query.projectCustomDomains.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.projectCustomDomains.projectId, input.projectId),
        });
        return customDomain ? (0, db_1.toDomainInfoFromPublished)(customDomain) : null;
    }),
    remove: trpc_1.protectedProcedure.input(zod_1.z.object({
        domain: zod_1.z.string(),
        projectId: zod_1.z.string(),
    })).mutation(async ({ ctx, input }) => {
        try {
            await ctx.db.transaction(async (tx) => {
                await tx.update(db_1.customDomainVerification).set({
                    status: models_1.VerificationRequestStatus.CANCELLED,
                }).where((0, drizzle_orm_1.eq)(db_1.customDomainVerification.fullDomain, input.domain));
                await tx.update(db_1.projectCustomDomains).set({
                    status: db_1.ProjectCustomDomainStatus.CANCELLED,
                }).where((0, drizzle_orm_1.eq)(db_1.projectCustomDomains.fullDomain, input.domain));
            });
            return true;
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: `Failed to remove domain: ${error}`,
            });
        }
    }),
    getOwnedDomains: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.user;
        if (!user) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            });
        }
        const foundUserProjects = await ctx.db.query.userProjects.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.userProjects.userId, user.id),
            with: {
                project: {
                    with: {
                        projectCustomDomains: true,
                    },
                }
            },
        });
        const ownedDomains = foundUserProjects.flatMap(userProject => userProject.project.projectCustomDomains.map(domain => domain.fullDomain));
        return ownedDomains;
    }),
});
//# sourceMappingURL=custom.js.map