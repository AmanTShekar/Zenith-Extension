"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainTab = void 0;
const Context_1 = require("@/components/Context");
const separator_1 = require("@onlook/ui/separator");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const Base_1 = require("./Base");
const Custom_1 = require("./Custom");
const DangerZone_1 = require("./DangerZone");
const EnvVars_1 = require("./EnvVars");
exports.DomainTab = (0, mobx_react_lite_1.observer)(() => {
    const userManager = (0, Context_1.useUserManager)();
    const editorEngine = (0, Context_1.useEditorEngine)();
    (0, react_1.useEffect)(() => {
        userManager.subscription.getPlanFromServer();
    }, [editorEngine.isSettingsOpen]);
    return (<div className="flex flex-col gap-2">
            <div className="p-6">
                <Base_1.BaseDomain />
            </div>
            <separator_1.Separator />
            <div className="p-6">
                <Custom_1.CustomDomain />
            </div>
            <separator_1.Separator />
            <div className="flex flex-col gap-4 p-6">
                <EnvVars_1.EnvVars />
            </div>
            <separator_1.Separator />
            <div className="p-6">
                <DangerZone_1.DangerZone />
            </div>
        </div>);
});
exports.default = exports.DomainTab;
//# sourceMappingURL=index.js.map