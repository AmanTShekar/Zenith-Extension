"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = publish;
const constants_1 = require("@onlook/constants");
const models_1 = require("@onlook/models");
const server_1 = require("@trpc/server");
const manager_1 = require("../manager");
const deploy_1 = require("./deploy");
const env_1 = require("./env");
const fork_1 = require("./fork");
const helpers_1 = require("./helpers");
async function publish({ db, deployment, sandboxId }) {
    const { id: deploymentId, projectId, type, buildScript, buildFlags, envVars, requestedBy: userId, } = deployment;
    try {
        const deploymentUrls = await (0, helpers_1.getProjectUrls)(db, projectId, type);
        const updateDeploymentResult1 = await (0, helpers_1.updateDeployment)(db, {
            id: deploymentId,
            status: models_1.DeploymentStatus.IN_PROGRESS,
            message: 'Creating build environment...',
            progress: 10,
            envVars: deployment.envVars ?? {},
        });
        if (!updateDeploymentResult1) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'Update deployment failed',
            });
        }
        const { provider, sandboxId: forkedSandboxId } = await (0, fork_1.forkBuildSandbox)(sandboxId, userId, deploymentId);
        try {
            const updateDeploymentResult2 = await (0, helpers_1.updateDeployment)(db, {
                id: deploymentId,
                status: models_1.DeploymentStatus.IN_PROGRESS,
                message: 'Creating optimized build...',
                progress: 20,
                sandboxId: forkedSandboxId,
                envVars: deployment.envVars ?? {},
            });
            if (!updateDeploymentResult2) {
                throw new server_1.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Update deployment failed',
                });
            }
            const publishManager = new manager_1.PublishManager(provider);
            const files = await publishManager.publish({
                deploymentId,
                skipBadge: type === models_1.DeploymentType.CUSTOM,
                buildScript: buildScript ?? constants_1.DefaultSettings.COMMANDS.build,
                buildFlags: buildFlags ?? constants_1.DefaultSettings.EDITOR_SETTINGS.buildFlags,
                envVars: deployment.envVars ?? {},
                updateDeployment: (deploymentUpdate) => (0, helpers_1.updateDeployment)(db, deploymentUpdate),
            });
            const updateDeploymentResult3 = await (0, helpers_1.updateDeployment)(db, {
                id: deploymentId,
                status: models_1.DeploymentStatus.IN_PROGRESS,
                message: 'Deploying build...',
                progress: 80,
                envVars: deployment.envVars ?? {},
            });
            if (!updateDeploymentResult3) {
                throw new server_1.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Update deployment failed',
                });
            }
            // Note: Prefer user provided env vars over sandbox env vars
            const sandboxEnvVars = await (0, env_1.extractEnvVarsFromSandbox)(provider);
            const mergedEnvVars = { ...sandboxEnvVars, ...(envVars ?? {}) };
            await (0, deploy_1.deployFreestyle)({
                files,
                urls: deploymentUrls,
                envVars: mergedEnvVars,
            });
        }
        finally {
            await provider.destroy();
        }
    }
    catch (error) {
        console.error(error);
        await (0, helpers_1.updateDeployment)(db, {
            id: deploymentId,
            status: models_1.DeploymentStatus.FAILED,
            error: error instanceof Error ? error.message : 'Unknown error',
            progress: 100,
            envVars: deployment.envVars ?? {},
        });
        throw error;
    }
}
//# sourceMappingURL=publish.js.map