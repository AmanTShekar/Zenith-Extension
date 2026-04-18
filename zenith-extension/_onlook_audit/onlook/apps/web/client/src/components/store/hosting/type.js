"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHostingType = useHostingType;
const provider_1 = require("./provider");
function useHostingType(type) {
    const context = (0, provider_1.useHostingContext)();
    const deployment = context.deployments[type];
    const isDeploying = context.isDeploying(type);
    const publish = async (params) => {
        return context.publish({ ...params, type });
    };
    const unpublish = async (projectId) => {
        return context.unpublish(projectId, type);
    };
    const refetch = () => {
        context.refetch(type);
    };
    const cancel = async () => {
        return context.cancel(type);
    };
    return {
        deployment,
        isDeploying,
        publish,
        unpublish,
        refetch,
        cancel,
    };
}
//# sourceMappingURL=type.js.map