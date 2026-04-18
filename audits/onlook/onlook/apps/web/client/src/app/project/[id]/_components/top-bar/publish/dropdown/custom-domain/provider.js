"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCustomDomainContext = exports.CustomDomainProvider = void 0;
const editor_1 = require("@/components/store/editor");
const hosting_1 = require("@/components/store/hosting");
const state_1 = require("@/components/store/state");
const react_1 = require("@/trpc/react");
const models_1 = require("@onlook/models");
const stripe_1 = require("@onlook/stripe");
const react_2 = require("react");
const useCustomDomain = () => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const stateManager = (0, state_1.useStateManager)();
    const [isLoading, setIsLoading] = (0, react_2.useState)(false);
    const { data: subscription } = react_1.api.subscription.get.useQuery();
    const { data: customDomain } = react_1.api.domain.custom.get.useQuery({ projectId: editorEngine.projectId });
    const { deployment, publish: runPublish, isDeploying } = (0, hosting_1.useHostingType)(models_1.DeploymentType.CUSTOM);
    const product = subscription?.product;
    const isPro = product?.type === stripe_1.ProductType.PRO;
    const openCustomDomain = () => {
        editorEngine.state.publishOpen = false;
        stateManager.settingsTab = models_1.SettingsTabValue.DOMAIN;
        stateManager.isSettingsModalOpen = true;
    };
    const publish = async () => {
        if (!customDomain) {
            console.error(`No custom domain hosting manager found`);
            return;
        }
        setIsLoading(true);
        try {
            await runPublish({
                projectId: editorEngine.projectId,
                sandboxId: editorEngine.branches.activeBranch.sandbox.id
            });
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const retry = () => {
        if (!customDomain) {
            console.error(`No custom domain hosting manager found`);
            return;
        }
        publish();
    };
    return {
        customDomain,
        deployment,
        publish,
        retry,
        isDeploying,
        isPro,
        openCustomDomain,
        isLoading,
    };
};
const CustomDomainContext = (0, react_2.createContext)(null);
const CustomDomainProvider = ({ children }) => {
    const value = useCustomDomain();
    return <CustomDomainContext.Provider value={value}>
        {children}
    </CustomDomainContext.Provider>;
};
exports.CustomDomainProvider = CustomDomainProvider;
const useCustomDomainContext = () => {
    const context = (0, react_2.useContext)(CustomDomainContext);
    if (!context) {
        throw new Error('useCustomDomainContext must be used within a CustomDomainProvider');
    }
    return context;
};
exports.useCustomDomainContext = useCustomDomainContext;
//# sourceMappingURL=provider.js.map