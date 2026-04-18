"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomDomain = void 0;
const editor_1 = require("@/components/store/editor");
const state_1 = require("@/components/store/state");
const react_1 = require("@/trpc/react");
const stripe_1 = require("@onlook/stripe");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const upgrade_prompt_1 = require("../upgrade-prompt");
const use_domain_verification_1 = require("./use-domain-verification");
const verification_1 = require("./verification");
const verified_1 = require("./verified");
exports.CustomDomain = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const stateManager = (0, state_1.useStateManager)();
    const { data: subscription } = react_1.api.subscription.get.useQuery();
    const product = subscription?.product;
    const { data: customDomain } = react_1.api.domain.custom.get.useQuery({ projectId: editorEngine.projectId });
    const renderContent = () => {
        if (product?.type !== stripe_1.ProductType.PRO) {
            return (<upgrade_prompt_1.UpgradePrompt onClick={() => {
                    stateManager.isSettingsModalOpen = false;
                    stateManager.isSubscriptionModalOpen = true;
                }}/>);
        }
        if (customDomain) {
            return <verified_1.Verified />;
        }
        return <verification_1.Verification />;
    };
    return (<use_domain_verification_1.DomainVerificationProvider>
            <div className="space-y-4">
                <div className="flex items-center justify-start gap-3">
                    <h2 className="text-lg">Custom Domain</h2>
                    {product?.type === stripe_1.ProductType.PRO && (<div className="flex h-5 items-center space-x-1 bg-blue-500/20 dark:bg-blue-500 px-2 rounded-full">
                            <icons_1.Icons.Sparkles className="h-4 w-4"/>
                            <span className="text-xs">Pro</span>
                        </div>)}
                </div>
                {renderContent()}
            </div>
        </use_domain_verification_1.DomainVerificationProvider>);
});
//# sourceMappingURL=index.js.map