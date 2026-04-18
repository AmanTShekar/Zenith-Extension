"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DangerZone = void 0;
const editor_1 = require("@/components/store/editor");
const hosting_1 = require("@/components/store/hosting");
const react_1 = require("@/trpc/react");
const hosting_2 = require("@onlook/models/hosting");
const button_1 = require("@onlook/ui/button");
const sonner_1 = require("@onlook/ui/sonner");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.DangerZone = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { data: domains } = react_1.api.domain.getAll.useQuery({ projectId: editorEngine.projectId });
    const { deployment: unpublishPreviewDeployment, unpublish: runUnpublishPreview } = (0, hosting_1.useHostingType)(hosting_2.DeploymentType.UNPUBLISH_PREVIEW);
    const { deployment: unpublishCustomDeployment, unpublish: runUnpublishCustom } = (0, hosting_1.useHostingType)(hosting_2.DeploymentType.UNPUBLISH_CUSTOM);
    const previewDomain = domains?.preview;
    const customDomain = domains?.published;
    const unpublish = async (type) => {
        let unpublishResponse = null;
        if (type === hosting_2.DeploymentType.UNPUBLISH_PREVIEW) {
            unpublishResponse = await runUnpublishPreview(editorEngine.projectId);
        }
        else {
            unpublishResponse = await runUnpublishCustom(editorEngine.projectId);
        }
        if (unpublishResponse) {
            sonner_1.toast.success('Project is being unpublished', {
                description: 'Deployment ID: ' + unpublishResponse.deploymentId,
            });
        }
        else {
            sonner_1.toast.error('Failed to unpublish project', {
                description: 'Please try again.',
            });
        }
    };
    return (<div className="flex flex-col gap-4">
            <h2 className="text-lg">Danger Zone</h2>
            <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-2 items-center">
                    <p className="text-sm text-muted-foreground">
                        {!previewDomain
            ? 'Your domain is not published'
            : `Unpublish from ${previewDomain.url}`}
                    </p>
                    <button_1.Button onClick={() => {
            if (previewDomain) {
                unpublish(hosting_2.DeploymentType.UNPUBLISH_PREVIEW);
            }
        }} className="ml-auto" size="sm" variant="destructive" disabled={!previewDomain || unpublishPreviewDeployment?.status === hosting_2.DeploymentStatus.IN_PROGRESS}>
                        {unpublishPreviewDeployment?.status === hosting_2.DeploymentStatus.IN_PROGRESS ? 'Unpublishing...' : 'Unpublish'}
                    </button_1.Button>
                </div>
                {customDomain && (<div className="flex flex-row gap-2 items-center">
                        <p className="text-sm text-muted-foreground">
                            Unpublish from {customDomain.url}
                        </p>
                        <button_1.Button onClick={() => unpublish(hosting_2.DeploymentType.UNPUBLISH_CUSTOM)} className="ml-auto" size="sm" variant="destructive" disabled={!customDomain || unpublishCustomDeployment?.status === hosting_2.DeploymentStatus.IN_PROGRESS}>
                            {unpublishCustomDeployment?.status === hosting_2.DeploymentStatus.IN_PROGRESS ? 'Unpublishing...' : 'Unpublish'}
                        </button_1.Button>
                    </div>)}
            </div>
        </div>);
});
//# sourceMappingURL=danger-zone.js.map