"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishRouter = void 0;
const models_1 = require("@onlook/models");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
const deployment_1 = require("./deployment");
const index_ts_1 = require("./helpers/index.ts");
exports.publishRouter = (0, trpc_1.createTRPCRouter)({
    deployment: deployment_1.deploymentRouter,
    unpublish: trpc_1.protectedProcedure.input(zod_1.z.object({
        type: zod_1.z.enum(models_1.DeploymentType),
        projectId: zod_1.z.string(),
    })).mutation(async ({ ctx, input }) => {
        const { projectId, type } = input;
        const userId = ctx.user.id;
        const deployment = await (0, index_ts_1.createDeployment)({
            db: ctx.db,
            projectId,
            type,
            userId,
            sandboxId: '', // not used for unpublish
        });
        const urls = await (0, index_ts_1.getProjectUrls)(ctx.db, projectId, type);
        await (0, index_ts_1.unpublish)(ctx.db, deployment, urls);
        return { deploymentId: deployment.id };
    }),
});
//# sourceMappingURL=index.js.map