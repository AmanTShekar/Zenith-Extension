"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHostingContext = exports.HostingProvider = void 0;
const editor_1 = require("@/components/store/editor");
const react_1 = require("@/trpc/react");
const models_1 = require("@onlook/models");
const sonner_1 = require("@onlook/ui/sonner");
const react_2 = require("react");
const HostingContext = (0, react_2.createContext)(null);
const HostingProvider = ({ children }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [subscriptionStates, setSubscriptionStates] = (0, react_2.useState)({
        [models_1.DeploymentType.PREVIEW]: false,
        [models_1.DeploymentType.CUSTOM]: false,
        [models_1.DeploymentType.UNPUBLISH_PREVIEW]: false,
        [models_1.DeploymentType.UNPUBLISH_CUSTOM]: false,
    });
    // API hooks for all deployment types
    const previewQuery = react_1.api.publish.deployment.getByType.useQuery({
        projectId: editorEngine.projectId,
        type: models_1.DeploymentType.PREVIEW,
    }, {
        refetchInterval: subscriptionStates[models_1.DeploymentType.PREVIEW] ? 1000 : false,
    });
    const customQuery = react_1.api.publish.deployment.getByType.useQuery({
        projectId: editorEngine.projectId,
        type: models_1.DeploymentType.CUSTOM,
    }, {
        refetchInterval: subscriptionStates[models_1.DeploymentType.CUSTOM] ? 1000 : false,
    });
    const unpublishPreviewQuery = react_1.api.publish.deployment.getByType.useQuery({
        projectId: editorEngine.projectId,
        type: models_1.DeploymentType.UNPUBLISH_PREVIEW,
    }, {
        refetchInterval: subscriptionStates[models_1.DeploymentType.UNPUBLISH_PREVIEW] ? 1000 : false,
    });
    const unpublishCustomQuery = react_1.api.publish.deployment.getByType.useQuery({
        projectId: editorEngine.projectId,
        type: models_1.DeploymentType.UNPUBLISH_CUSTOM,
    }, {
        refetchInterval: subscriptionStates[models_1.DeploymentType.UNPUBLISH_CUSTOM] ? 1000 : false,
    });
    // Mutations
    const { mutateAsync: runCreateDeployment } = react_1.api.publish.deployment.create.useMutation();
    const { mutateAsync: runUpdateDeployment } = react_1.api.publish.deployment.update.useMutation();
    const { mutateAsync: runDeployment } = react_1.api.publish.deployment.run.useMutation();
    const { mutateAsync: runUnpublish } = react_1.api.publish.unpublish.useMutation();
    const { mutateAsync: runCancel } = react_1.api.publish.deployment.cancel.useMutation();
    // Organize deployments by type
    const deployments = (0, react_2.useMemo)(() => ({
        [models_1.DeploymentType.PREVIEW]: previewQuery.data,
        [models_1.DeploymentType.CUSTOM]: customQuery.data,
        [models_1.DeploymentType.UNPUBLISH_PREVIEW]: unpublishPreviewQuery.data,
        [models_1.DeploymentType.UNPUBLISH_CUSTOM]: unpublishCustomQuery.data,
    }), [previewQuery.data, customQuery.data, unpublishPreviewQuery.data, unpublishCustomQuery.data]);
    // Check if any deployment is in progress
    const isDeploying = (type) => {
        return deployments[type]?.status === models_1.DeploymentStatus.IN_PROGRESS ||
            deployments[type]?.status === models_1.DeploymentStatus.PENDING;
    };
    // Stop polling when deployments complete, start polling when in progress
    (0, react_2.useEffect)(() => {
        Object.entries(deployments).forEach(([type, deployment]) => {
            if (deployment?.status === models_1.DeploymentStatus.IN_PROGRESS ||
                deployment?.status === models_1.DeploymentStatus.PENDING) {
                setSubscriptionStates(prev => ({
                    ...prev,
                    [type]: true,
                }));
            }
            else {
                setSubscriptionStates(prev => ({
                    ...prev,
                    [type]: false,
                }));
            }
        });
    }, [deployments]);
    // Publish function
    const publish = async (params) => {
        let deployment = null;
        try {
            setSubscriptionStates(prev => ({
                ...prev,
                [params.type]: true,
            }));
            deployment = await runCreateDeployment(params);
            if (!deployment) {
                throw new Error('Failed to create deployment');
            }
            sonner_1.toast.success('Deployment created', {
                description: `Deployment ID: ${deployment.id}`,
            });
            // Refetch the specific deployment
            await refetch(params.type);
            await runDeployment({
                deploymentId: deployment.id,
            });
            refetch(params.type);
            sonner_1.toast.success('Deployment success!');
            return {
                success: true,
            };
        }
        catch (error) {
            sonner_1.toast.error('Failed to publish deployment');
            if (deployment) {
                await runUpdateDeployment({
                    id: deployment.id,
                    status: models_1.DeploymentStatus.FAILED,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
            return {
                success: false,
            };
        }
    };
    // Unpublish function
    const unpublish = async (projectId, type) => {
        try {
            setSubscriptionStates(prev => ({
                ...prev,
                [type]: true,
            }));
            const response = await runUnpublish({
                projectId,
                type,
            });
            // Refetch the specific deployment
            await refetch(type);
            return response;
        }
        catch (error) {
            sonner_1.toast.error('Failed to unpublish deployment');
            return null;
        }
    };
    // Refetch functions
    const refetch = (type) => {
        switch (type) {
            case models_1.DeploymentType.PREVIEW:
                previewQuery.refetch();
                break;
            case models_1.DeploymentType.CUSTOM:
                customQuery.refetch();
                break;
            case models_1.DeploymentType.UNPUBLISH_PREVIEW:
                unpublishPreviewQuery.refetch();
                break;
            case models_1.DeploymentType.UNPUBLISH_CUSTOM:
                unpublishCustomQuery.refetch();
                break;
        }
    };
    const cancel = async (type) => {
        if (!deployments[type]) {
            sonner_1.toast.error('No deployment found');
            return;
        }
        try {
            await runCancel({
                deploymentId: deployments[type].id,
            });
            sonner_1.toast.success('Deployment cancelled');
            refetch(type);
        }
        catch (error) {
            sonner_1.toast.error('Failed to cancel deployment');
            console.error(error);
        }
    };
    const refetchAll = () => {
        previewQuery.refetch();
        customQuery.refetch();
        unpublishPreviewQuery.refetch();
        unpublishCustomQuery.refetch();
    };
    const value = {
        deployments: {
            preview: deployments.preview ?? null,
            custom: deployments.custom ?? null,
            unpublish_preview: deployments.unpublish_preview ?? null,
            unpublish_custom: deployments.unpublish_custom ?? null
        },
        isDeploying,
        publish,
        unpublish,
        refetch,
        refetchAll,
        cancel,
    };
    return (<HostingContext.Provider value={value}>
            {children}
        </HostingContext.Provider>);
};
exports.HostingProvider = HostingProvider;
const useHostingContext = () => {
    const context = (0, react_2.useContext)(HostingContext);
    if (!context) {
        throw new Error('useHostingContext must be used within HostingProvider');
    }
    return context;
};
exports.useHostingContext = useHostingContext;
//# sourceMappingURL=provider.js.map