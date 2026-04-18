"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.domainRouter = void 0;
const db_1 = require("@onlook/db");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
const custom_1 = require("./custom");
const preview_1 = require("./preview");
const verify_1 = require("./verify");
exports.domainRouter = (0, trpc_1.createTRPCRouter)({
    preview: preview_1.previewRouter,
    custom: custom_1.customRouter,
    verification: verify_1.verificationRouter,
    getAll: trpc_1.protectedProcedure.input(zod_1.z.object({
        projectId: zod_1.z.string(),
    })).query(async ({ ctx, input }) => {
        const preview = await ctx.db.query.previewDomains.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.previewDomains.projectId, input.projectId),
        });
        const published = await ctx.db.query.projectCustomDomains.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.projectCustomDomains.projectId, input.projectId),
        });
        return {
            preview: preview ? (0, db_1.toDomainInfoFromPreview)(preview) : null,
            published: published ? (0, db_1.toDomainInfoFromPublished)(published) : null,
        };
    }),
});
//# sourceMappingURL=index.js.map