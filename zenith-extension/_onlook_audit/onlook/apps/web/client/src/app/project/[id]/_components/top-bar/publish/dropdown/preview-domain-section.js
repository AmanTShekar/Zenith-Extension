"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewDomainSection = void 0;
const editor_1 = require("@/components/store/editor");
const hosting_1 = require("@/components/store/hosting");
const react_1 = require("@/trpc/react");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const sonner_1 = require("@onlook/ui/sonner");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_2 = require("react");
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const url_1 = require("./url");
exports.PreviewDomainSection = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [isLoading, setIsLoading] = (0, react_2.useState)(false);
    const { data: project } = react_1.api.project.get.useQuery({ projectId: editorEngine.projectId });
    const { data: previewDomain, refetch: refetchPreviewDomain } = react_1.api.domain.preview.get.useQuery({ projectId: editorEngine.projectId });
    const { mutateAsync: createPreviewDomain, isPending: isCreatingDomain } = react_1.api.domain.preview.create.useMutation();
    const { deployment, publish: runPublish, isDeploying } = (0, hosting_1.useHostingType)(models_1.DeploymentType.PREVIEW);
    const createBaseDomain = async () => {
        const previewDomain = await createPreviewDomain({ projectId: editorEngine.projectId });
        if (!previewDomain) {
            console.error('Failed to create preview domain');
            sonner_1.toast.error('Failed to create preview domain');
            return;
        }
        await refetchPreviewDomain();
        publish();
    };
    const publish = async () => {
        if (!project) {
            console.error('No project found');
            sonner_1.toast.error('No project found');
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
        if (!previewDomain?.url) {
            console.error(`No preview domain info found`);
            return;
        }
        publish();
    };
    const renderDomain = () => {
        if (!previewDomain) {
            return 'Something went wrong';
        }
        return (<>
                <div className="flex items-center w-full">
                    <h3 className="">
                        Base Domain
                    </h3>
                    {deployment && deployment?.status === models_1.DeploymentStatus.COMPLETED && (<div className="ml-auto flex items-center gap-2">
                            <p className="text-green-300">Live</p>
                            <p>•</p>
                            <p>Updated {(0, utility_1.timeAgo)(deployment.updatedAt)} ago</p>
                        </div>)}
                    {deployment?.status === models_1.DeploymentStatus.FAILED && (<div className="ml-auto flex items-center gap-2">
                            <p className="text-red-500">Error</p>
                        </div>)}
                    {deployment?.status === models_1.DeploymentStatus.CANCELLED && (<div className="ml-auto flex items-center gap-2">
                            <p className="text-foreground-secondary">Cancelled</p>
                        </div>)}
                    {isDeploying && (<div className="ml-auto flex items-center gap-2">
                            <p className="">Updating • In progress</p>
                        </div>)}
                </div>
                {renderActionSection()}
            </>);
    };
    const renderNoDomain = () => {
        return (<>
                <div className="flex items-center w-full">
                    <h3 className="">Publish</h3>
                </div>

                <button_1.Button disabled={isCreatingDomain} onClick={createBaseDomain} className="w-full rounded-md p-3">
                    {isCreatingDomain ? 'Creating domain...' : 'Publish my site'}
                </button_1.Button>
            </>);
    };
    const renderActionSection = () => {
        if (!previewDomain?.url) {
            return 'Something went wrong';
        }
        return (<div className="w-full flex flex-col gap-2">
                <url_1.UrlSection url={previewDomain.url} isCopyable={true}/>
                {deployment?.status === models_1.DeploymentStatus.FAILED || deployment?.status === models_1.DeploymentStatus.CANCELLED ? (<div className="w-full flex flex-col gap-2">
                        {deployment?.error && <p className="text-red-500 max-h-20 overflow-y-auto">{(0, strip_ansi_1.default)(deployment?.error)}</p>}
                        <button_1.Button variant="outline" className="w-full rounded-md p-3" onClick={retry}>
                            Try Updating Again
                        </button_1.Button>
                    </div>) : (<button_1.Button onClick={() => publish()} variant="outline" className="w-full rounded-md p-3" disabled={isDeploying || isLoading}>
                        {isLoading && <index_1.Icons.LoadingSpinner className="w-4 h-4 mr-2 animate-spin"/>}
                        Update
                    </button_1.Button>)}
            </div>);
    };
    return (<div className="p-4 flex flex-col items-center gap-2">
            {previewDomain?.url
            ? renderDomain()
            : renderNoDomain()}
        </div>);
});
//# sourceMappingURL=preview-domain-section.js.map