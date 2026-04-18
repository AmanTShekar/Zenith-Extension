"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpublish = void 0;
const models_1 = require("@onlook/models");
const server_1 = require("@trpc/server");
const deploy_1 = require("./deploy");
const helpers_1 = require("./helpers");
const unpublish = async (db, deployment, urls) => {
    if (!deployment) {
        throw new server_1.TRPCError({
            code: 'BAD_REQUEST',
            message: 'Deployment not found',
        });
    }
    (0, helpers_1.updateDeployment)(db, {
        id: deployment.id,
        status: models_1.DeploymentStatus.IN_PROGRESS,
        message: 'Unpublishing project...',
        progress: 20,
        envVars: deployment.envVars ?? {},
    });
    try {
        await (0, deploy_1.deployFreestyle)({
            files: {},
            urls,
            envVars: {},
        });
        (0, helpers_1.updateDeployment)(db, {
            id: deployment.id,
            status: models_1.DeploymentStatus.COMPLETED,
            message: 'Project unpublished!',
            progress: 100,
            envVars: deployment.envVars ?? {},
        });
    }
    catch (error) {
        (0, helpers_1.updateDeployment)(db, {
            id: deployment.id,
            status: models_1.DeploymentStatus.FAILED,
            error: error instanceof Error ? error.message : 'Unknown error',
            progress: 100,
            envVars: deployment.envVars ?? {},
        });
        throw error;
    }
};
exports.unpublish = unpublish;
//# sourceMappingURL=unpublish.js.map