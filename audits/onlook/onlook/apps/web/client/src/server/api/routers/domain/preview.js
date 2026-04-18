"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewRouter = void 0;
const env_1 = require("@/env");
const db_1 = require("@onlook/db");
const utility_1 = require("@onlook/utility");
const server_1 = require("@trpc/server");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.previewRouter = (0, trpc_1.createTRPCRouter)({
    get: trpc_1.protectedProcedure.input(zod_1.z.object({
        projectId: zod_1.z.string(),
    })).query(async ({ ctx, input }) => {
        const preview = await ctx.db.query.previewDomains.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.previewDomains.projectId, input.projectId),
        });
        return preview ? (0, db_1.toDomainInfoFromPreview)(preview) : null;
    }),
    create: trpc_1.protectedProcedure.input(zod_1.z.object({
        projectId: zod_1.z.string(),
    })).mutation(async ({ ctx, input }) => {
        // Check if the domain is already taken by another project
        // This should never happen, but just in case
        const domain = `${(0, utility_1.getValidSubdomain)(input.projectId)}.${env_1.env.NEXT_PUBLIC_HOSTING_DOMAIN}`;
        const existing = await ctx.db.query.previewDomains.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.previewDomains.fullDomain, domain), (0, drizzle_orm_1.ne)(db_1.previewDomains.projectId, input.projectId)),
        });
        if (existing) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: `Domain ${domain} already taken`,
            });
        }
        const [preview] = await ctx.db.insert(db_1.previewDomains).values({
            fullDomain: domain,
            projectId: input.projectId,
        }).onConflictDoUpdate({
            target: [db_1.previewDomains.fullDomain],
            set: {
                projectId: input.projectId,
            },
        })
            .returning({
            fullDomain: db_1.previewDomains.fullDomain,
        });
        if (!preview) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'Failed to create preview domain, no preview domain returned',
            });
        }
        return {
            domain: preview.fullDomain,
        };
    }),
});
//# sourceMappingURL=preview.js.map