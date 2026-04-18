"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationRouter = void 0;
const server_1 = require("@/utils/analytics/server");
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const server_2 = require("@trpc/server");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../../trpc");
const helpers_1 = require("./helpers");
exports.verificationRouter = (0, trpc_1.createTRPCRouter)({
    getActive: trpc_1.protectedProcedure.input(zod_1.z.object({
        projectId: zod_1.z.string(),
    })).query(async ({ ctx, input }) => {
        const verification = await ctx.db.query.customDomainVerification.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.customDomainVerification.projectId, input.projectId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(db_1.customDomainVerification.status, models_1.VerificationRequestStatus.PENDING), (0, drizzle_orm_1.eq)(db_1.customDomainVerification.status, models_1.VerificationRequestStatus.VERIFIED))),
            with: {
                customDomain: true,
            },
        });
        return verification ?? null;
    }),
    create: trpc_1.protectedProcedure.input(zod_1.z.object({
        domain: zod_1.z.string(),
        projectId: zod_1.z.string(),
    })).mutation(async ({ ctx, input }) => {
        const { customDomain, subdomain } = await (0, helpers_1.getCustomDomain)(ctx.db, input.domain);
        const existingVerification = await (0, helpers_1.getVerification)(ctx.db, input.projectId, customDomain.id);
        if (existingVerification) {
            return existingVerification;
        }
        const verification = await (0, helpers_1.createDomainVerification)(ctx.db, input.domain, input.projectId, customDomain.id, subdomain);
        return verification;
    }),
    remove: trpc_1.protectedProcedure.input(zod_1.z.object({
        verificationId: zod_1.z.string(),
    })).mutation(async ({ ctx, input }) => {
        await ctx.db.update(db_1.customDomainVerification).set({
            status: models_1.VerificationRequestStatus.CANCELLED,
            updatedAt: new Date(),
        }).where((0, drizzle_orm_1.eq)(db_1.customDomainVerification.id, input.verificationId));
    }),
    verify: trpc_1.protectedProcedure.input(zod_1.z.object({
        verificationId: zod_1.z.string(),
    })).mutation(async ({ ctx, input }) => {
        const verification = await ctx.db.query.customDomainVerification.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.customDomainVerification.id, input.verificationId), (0, drizzle_orm_1.eq)(db_1.customDomainVerification.status, models_1.VerificationRequestStatus.PENDING)),
        });
        if (!verification) {
            throw new server_2.TRPCError({
                code: 'NOT_FOUND',
                message: 'Verification request not found',
            });
        }
        const domain = await (0, helpers_1.verifyFreestyleDomain)(verification.freestyleVerificationId);
        if (!domain) {
            const failureReason = await (0, helpers_1.getFailureReason)(verification);
            return {
                success: false,
                failureReason,
            };
        }
        await ctx.db
            .transaction(async (tx) => {
            await tx.update(db_1.customDomains).set({
                verified: true,
            }).where((0, drizzle_orm_1.eq)(db_1.customDomains.id, verification.customDomainId));
            await tx.insert(db_1.projectCustomDomains).values({
                projectId: verification.projectId,
                fullDomain: domain,
                customDomainId: verification.customDomainId,
            });
            await tx.update(db_1.customDomainVerification).set({
                status: models_1.VerificationRequestStatus.VERIFIED,
            }).where((0, drizzle_orm_1.eq)(db_1.customDomainVerification.id, verification.id));
        });
        (0, server_1.trackEvent)({
            distinctId: ctx.user.id,
            event: 'user_verified_domain',
            properties: {
                domain: verification.fullDomain,
            }
        });
        return {
            success: true,
            failureReason: null,
        };
    }),
    verifyOwnedDomain: trpc_1.protectedProcedure.input(zod_1.z.object({
        fullDomain: zod_1.z.string(),
        projectId: zod_1.z.string(),
    })).mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user) {
            throw new server_2.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            });
        }
        const ownsDomain = await (0, helpers_1.ensureUserOwnsDomain)(ctx.db, user.id, input.fullDomain);
        if (!ownsDomain) {
            return {
                success: false,
                failureReason: 'User does not own domain',
            };
        }
        const { customDomain, subdomain } = await (0, helpers_1.getCustomDomain)(ctx.db, input.fullDomain);
        // TODO: There is a known issue with Freestyle where the domain verification can fail if another verification request was made for the same domain.
        const verifiedDomain = await (0, helpers_1.verifyFreestyleDomainWithCustomDomain)(customDomain.apexDomain);
        if (!verifiedDomain) {
            return {
                success: false,
                failureReason: 'Failed to verify domain with Freestyle hosting provider. Please contact support as this is likely an issue with Freestyle.',
            };
        }
        const [projectCustomDomain] = await ctx.db.insert(db_1.projectCustomDomains).values({
            projectId: input.projectId,
            fullDomain: input.fullDomain,
            customDomainId: customDomain.id,
        }).returning();
        if (!projectCustomDomain) {
            throw new server_2.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create project custom domain',
            });
        }
        return {
            success: true,
            failureReason: null,
        };
    }),
});
//# sourceMappingURL=index.js.map