"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploymentRouter = void 0;
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const server_1 = require("@trpc/server");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
const helpers_1 = require("./helpers");
const index_ts_1 = require("./helpers/index.ts");
exports.deploymentRouter = (0, trpc_1.createTRPCRouter)({
    getByType: trpc_1.protectedProcedure.input(zod_1.z.object({
        projectId: zod_1.z.string(),
        type: zod_1.z.nativeEnum(models_1.DeploymentType),
    })).query(async ({ ctx, input }) => {
        const { projectId, type } = input;
        const deployment = await ctx.db.query.deployments.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.deployments.projectId, projectId), (0, drizzle_orm_1.eq)(db_1.deployments.type, type)),
            orderBy: (0, drizzle_orm_1.desc)(db_1.deployments.createdAt),
        });
        return deployment ?? null;
    }),
    update: trpc_1.protectedProcedure.input(db_1.deploymentUpdateSchema).mutation(async ({ ctx, input }) => {
        return await (0, helpers_1.updateDeployment)(ctx.db, input);
    }),
    create: trpc_1.protectedProcedure.input(zod_1.z.object({
        projectId: zod_1.z.string(),
        type: zod_1.z.enum(models_1.DeploymentType),
        sandboxId: zod_1.z.string(),
        buildScript: zod_1.z.string().optional(),
        buildFlags: zod_1.z.string().optional(),
        envVars: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
    })).mutation(async ({ ctx, input }) => {
        const { projectId, type, sandboxId, buildScript, buildFlags, envVars, } = input;
        const userId = ctx.user.id;
        const existingDeployment = await ctx.db.query.deployments.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.deployments.projectId, projectId), (0, drizzle_orm_1.eq)(db_1.deployments.type, type), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(db_1.deployments.status, models_1.DeploymentStatus.IN_PROGRESS), (0, drizzle_orm_1.eq)(db_1.deployments.status, models_1.DeploymentStatus.PENDING))),
        });
        if (existingDeployment) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: existingDeployment.status === models_1.DeploymentStatus.IN_PROGRESS ?
                    'Deployment in progress' :
                    'Deployment already exists',
            });
        }
        return await (0, index_ts_1.createDeployment)({
            db: ctx.db,
            projectId,
            type,
            userId,
            sandboxId,
            buildScript,
            buildFlags,
            envVars,
        });
    }),
    run: trpc_1.protectedProcedure.input(zod_1.z.object({
        deploymentId: zod_1.z.string(),
    })).mutation(async ({ ctx, input }) => {
        const { deploymentId } = input;
        const existingDeployment = await ctx.db.query.deployments.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.deployments.id, deploymentId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(db_1.deployments.status, models_1.DeploymentStatus.IN_PROGRESS), (0, drizzle_orm_1.eq)(db_1.deployments.status, models_1.DeploymentStatus.PENDING))),
        });
        if (!existingDeployment) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'Deployment not found',
            });
        }
        if (existingDeployment.status === models_1.DeploymentStatus.IN_PROGRESS) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'Deployment in progress',
            });
        }
        if (existingDeployment.status === models_1.DeploymentStatus.CANCELLED) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'Deployment cancelled',
            });
        }
        try {
            await (0, index_ts_1.publish)({
                db: ctx.db,
                deployment: existingDeployment,
                sandboxId: existingDeployment.sandboxId,
            });
            await (0, helpers_1.updateDeployment)(ctx.db, {
                id: deploymentId,
                status: models_1.DeploymentStatus.COMPLETED,
                message: 'Deployment Success!',
                envVars: existingDeployment.envVars ?? {},
            });
        }
        catch (error) {
            console.error(error);
            await (0, helpers_1.updateDeployment)(ctx.db, {
                id: deploymentId,
                status: models_1.DeploymentStatus.FAILED,
                message: 'Failed to publish deployment',
                envVars: existingDeployment.envVars ?? {},
            });
            throw error;
        }
    }),
    cancel: trpc_1.protectedProcedure.input(zod_1.z.object({
        deploymentId: zod_1.z.string(),
    })).mutation(async ({ ctx, input }) => {
        const { deploymentId } = input;
        const deployment = await ctx.db.query.deployments.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.deployments.id, deploymentId),
        });
        await (0, helpers_1.updateDeployment)(ctx.db, {
            id: deploymentId,
            status: models_1.DeploymentStatus.CANCELLED,
            message: 'Cancelled by user',
            envVars: deployment?.envVars ?? {},
        });
    }),
});
//# sourceMappingURL=deployment.js.map