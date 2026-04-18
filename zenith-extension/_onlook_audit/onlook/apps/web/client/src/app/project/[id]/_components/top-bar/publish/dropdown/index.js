"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishDropdown = void 0;
const hosting_1 = require("@/components/store/hosting");
const models_1 = require("@onlook/models");
const separator_1 = require("@onlook/ui/separator");
const mobx_react_lite_1 = require("mobx-react-lite");
const advanced_settings_1 = require("./advanced-settings");
const custom_domain_1 = require("./custom-domain");
const loading_1 = require("./loading");
const preview_domain_section_1 = require("./preview-domain-section");
exports.PublishDropdown = (0, mobx_react_lite_1.observer)(() => {
    const { isDeploying: isPreviewDeploying } = (0, hosting_1.useHostingType)(models_1.DeploymentType.PREVIEW);
    const { isDeploying: isCustomDeploying } = (0, hosting_1.useHostingType)(models_1.DeploymentType.CUSTOM);
    return (<div className="rounded-md flex flex-col text-foreground-secondary">
            {isPreviewDeploying ?
            <loading_1.LoadingState type={models_1.DeploymentType.PREVIEW}/> :
            <preview_domain_section_1.PreviewDomainSection />}
            <separator_1.Separator />
            {isCustomDeploying ?
            <loading_1.LoadingState type={models_1.DeploymentType.CUSTOM}/> :
            <custom_domain_1.CustomDomainSection />}
            <separator_1.Separator />
            <advanced_settings_1.AdvancedSettingsSection />
        </div>);
});
//# sourceMappingURL=index.js.map