"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectUrls = getProjectUrls;
exports.updateDeployment = updateDeployment;
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const utility_1 = require("@onlook/utility");
const server_1 = require("@trpc/server");
const drizzle_orm_1 = require("drizzle-orm");
async function getProjectUrls(db, projectId, type) {
    let urls = [];
    if (type === models_1.DeploymentType.PREVIEW || type === models_1.DeploymentType.UNPUBLISH_PREVIEW) {
        const foundPreviewDomains = await db.query.previewDomains.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.previewDomains.projectId, projectId),
        });
        if (!foundPreviewDomains || foundPreviewDomains.length === 0) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'No preview domain found',
            });
        }
        urls = foundPreviewDomains.map(domain => domain.fullDomain);
    }
    else if (type === models_1.DeploymentType.CUSTOM || type === models_1.DeploymentType.UNPUBLISH_CUSTOM) {
        const foundCustomDomains = await db.query.projectCustomDomains.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.projectCustomDomains.projectId, projectId),
        });
        if (!foundCustomDomains || foundCustomDomains.length === 0) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'No custom domain found',
            });
        }
        urls = foundCustomDomains.map(domain => domain.fullDomain);
    }
    else {
        (0, utility_1.assertNever)(type);
    }
    return urls;
}
async function updateDeployment(db, deployment) {
    try {
        const [result] = await db.update(db_1.deployments).set({
            ...deployment,
            type: deployment.type,
            status: deployment.status
        }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.deployments.id, deployment.id), (0, drizzle_orm_1.ne)(db_1.deployments.status, models_1.DeploymentStatus.CANCELLED))).returning();
        return result ?? null;
    }
    catch (error) {
        console.error(`Failed to update deployment ${deployment.id}:`, error);
        return null;
    }
}
//# sourceMappingURL=helpers.js.map