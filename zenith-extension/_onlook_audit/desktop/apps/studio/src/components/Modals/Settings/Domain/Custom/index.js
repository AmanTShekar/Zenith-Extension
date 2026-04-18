"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomDomain = void 0;
const Context_1 = require("@/components/Context");
const usage_1 = require("@onlook/models/usage");
const index_1 = require("@onlook/ui/icons/index");
const mobx_react_lite_1 = require("mobx-react-lite");
const UpgradePrompt_1 = require("../UpgradePrompt");
const Verification_1 = require("./Verification");
const Verified_1 = require("./Verified");
exports.CustomDomain = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const userManager = (0, Context_1.useUserManager)();
    const plan = userManager.subscription.plan;
    const renderContent = () => {
        if (plan !== usage_1.UsagePlanType.PRO) {
            return (<UpgradePrompt_1.UpgradePrompt onClick={() => {
                    editorEngine.isSettingsOpen = false;
                    editorEngine.isPlansOpen = true;
                }}/>);
        }
        const customDomain = projectsManager.project?.domains?.custom;
        if (customDomain) {
            return <Verified_1.Verified />;
        }
        return <Verification_1.Verification />;
    };
    return (<div className="space-y-4">
            <div className="flex items-center justify-start gap-3">
                <h2 className="text-lg">Custom Domain</h2>
                {plan === usage_1.UsagePlanType.PRO && (<div className="flex h-5 items-center space-x-1 bg-blue-500/20 dark:bg-blue-500 px-2 rounded-full">
                        <index_1.Icons.Sparkles className="h-4 w-4"/>
                        <span className="text-xs">Pro</span>
                    </div>)}
            </div>
            {renderContent()}
        </div>);
});
//# sourceMappingURL=index.js.map