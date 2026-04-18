"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DangerZone = void 0;
const Context_1 = require("@/components/Context");
const hosting_1 = require("@onlook/models/hosting");
const projects_1 = require("@onlook/models/projects");
const button_1 = require("@onlook/ui/button");
const use_toast_1 = require("@onlook/ui/use-toast");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.DangerZone = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const baseDomain = projectsManager.project?.domains?.base;
    const baseDomainManager = projectsManager.domains?.base;
    const isBaseDomainUnpublishing = baseDomainManager?.state.status === hosting_1.PublishStatus.LOADING;
    const customDomain = projectsManager.project?.domains?.custom;
    const customDomainManager = projectsManager.domains?.custom;
    const isCustomDomainUnpublishing = customDomainManager?.state.status === hosting_1.PublishStatus.LOADING;
    const unpublish = async (type) => {
        const manager = type === projects_1.DomainType.BASE ? baseDomainManager : customDomainManager;
        if (!manager) {
            console.error('No domain manager found');
            return;
        }
        const success = await manager.unpublish();
        if (!success) {
            (0, use_toast_1.toast)({
                title: 'Failed to unpublish project',
                description: 'Please try again.',
                variant: 'destructive',
            });
        }
        else {
            (0, use_toast_1.toast)({
                title: 'Project unpublished',
                description: 'Your project is no longer publicly accessible.',
            });
        }
    };
    return (<div className="flex flex-col gap-4">
            <h2 className="text-lg">Danger Zone</h2>
            <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-2 items-center">
                    <p className="text-sm text-muted-foreground">
                        {!baseDomain || !baseDomainManager
            ? 'Your domain is not published'
            : `Unpublish from ${baseDomain.url}`}
                    </p>
                    <button_1.Button onClick={() => unpublish(projects_1.DomainType.BASE)} className="ml-auto" size="sm" variant="destructive" disabled={!baseDomain || !baseDomainManager || isBaseDomainUnpublishing}>
                        {isBaseDomainUnpublishing ? 'Unpublishing...' : 'Unpublish'}
                    </button_1.Button>
                </div>
                {customDomain && customDomainManager && (<div className="flex flex-row gap-2 items-center">
                        <p className="text-sm text-muted-foreground">
                            Unpublish from {customDomain.url}
                        </p>
                        <button_1.Button onClick={() => unpublish(projects_1.DomainType.CUSTOM)} className="ml-auto" size="sm" variant="destructive" disabled={isCustomDomainUnpublishing || !customDomain || !customDomainManager}>
                            {isCustomDomainUnpublishing ? 'Unpublishing...' : 'Unpublish'}
                        </button_1.Button>
                    </div>)}
            </div>
        </div>);
});
//# sourceMappingURL=DangerZone.js.map