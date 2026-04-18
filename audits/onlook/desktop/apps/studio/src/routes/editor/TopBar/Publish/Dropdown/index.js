"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishDropdown = void 0;
const Context_1 = require("@/components/Context");
const hosting_1 = require("@onlook/models/hosting");
const projects_1 = require("@onlook/models/projects");
const separator_1 = require("@onlook/ui/separator");
const mobx_react_lite_1 = require("mobx-react-lite");
const AdvancedSettings_1 = require("./AdvancedSettings");
const Domain_1 = require("./Domain");
exports.PublishDropdown = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    if (!projectsManager.project) {
        return null;
    }
    const baseDomain = projectsManager.project?.domains?.base || null;
    const customDomain = projectsManager.project?.domains?.custom || null;
    const baseDomainState = projectsManager.domains?.base?.state || {
        status: hosting_1.PublishStatus.UNPUBLISHED,
        message: null,
    };
    const customDomainState = projectsManager.domains?.custom?.state || {
        status: hosting_1.PublishStatus.UNPUBLISHED,
        message: null,
    };
    return (<div className="rounded-md flex flex-col text-foreground-secondary">
            <Domain_1.DomainSection domain={baseDomain} type={projects_1.DomainType.BASE} state={baseDomainState}/>
            <separator_1.Separator />
            <Domain_1.DomainSection domain={customDomain} type={projects_1.DomainType.CUSTOM} state={customDomainState}/>
            <separator_1.Separator />
            <AdvancedSettings_1.AdvancedSettingsSection />
        </div>);
});
//# sourceMappingURL=index.js.map