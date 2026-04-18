"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployFreestyle = void 0;
exports.createDeployment = createDeployment;
const server_ts_1 = require("@/utils/analytics/server.ts");
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const server_1 = require("@trpc/server");
const crypto_1 = require("crypto");
const hosting_factory_ts_1 = require("../../domain/hosting-factory.ts");
const deployFreestyle = async ({ files, urls, envVars, }) => {
    const entrypoint = 'server.js';
    const adapter = hosting_factory_ts_1.HostingProviderFactory.create(models_1.HostingProvider.FREESTYLE);
    const deploymentFiles = {};
    for (const [path, file] of Object.entries(files)) {
        deploymentFiles[path] = {
            content: file.content,
            encoding: (file.encoding === 'base64' ? 'base64' : 'utf-8')
        };
    }
    const result = await adapter.deploy({
        files: deploymentFiles,
        config: {
            domains: urls,
            entrypoint,
            envVars,
        },
    });
    if (!result.success) {
        throw new Error(result.message ?? 'Failed to deploy project');
    }
    return result;
};
exports.deployFreestyle = deployFreestyle;
async function createDeployment({ db, projectId, type, userId, sandboxId, buildScript, buildFlags, envVars, }) {
    const [deployment] = await db.insert(db_1.deployments).values({
        id: (0, crypto_1.randomUUID)(),
        projectId,
        sandboxId,
        type,
        buildScript,
        buildFlags,
        envVars,
        status: models_1.DeploymentStatus.PENDING,
        requestedBy: userId,
        message: 'Creating deployment...',
        progress: 0,
    }).returning();
    if (!deployment) {
        throw new server_1.TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create deployment',
        });
    }
    (0, server_ts_1.trackEvent)({
        distinctId: userId,
        event: 'user_deployed_project',
        properties: {
            type,
            projectId,
            deploymentId: deployment.id,
        },
    });
    return deployment;
}
//# sourceMappingURL=deploy.js.map