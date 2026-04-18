"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainSection = void 0;
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const hosting_1 = require("@onlook/models/hosting");
const projects_1 = require("@onlook/models/projects");
const usage_1 = require("@onlook/models/usage");
const button_1 = require("@onlook/ui/button");
const progress_1 = require("@onlook/ui/progress");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const Url_1 = require("./Url");
exports.DomainSection = (0, mobx_react_lite_1.observer)(({ domain, type, state, }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const userManager = (0, Context_1.useUserManager)();
    const [progress, setProgress] = (0, react_1.useState)(0);
    const plan = userManager.subscription.plan;
    const isAnyDomainLoading = projectsManager.domains?.base?.state.status === hosting_1.PublishStatus.LOADING ||
        projectsManager.domains?.custom?.state.status === hosting_1.PublishStatus.LOADING;
    (0, react_1.useEffect)(() => {
        let progressInterval = null;
        if (state.status === hosting_1.PublishStatus.LOADING) {
            setProgress(0);
            progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 0.167, 100));
            }, 100);
        }
        else {
            setProgress(0);
            if (progressInterval) {
                clearInterval(progressInterval);
            }
        }
        return () => {
            if (progressInterval) {
                clearInterval(progressInterval);
            }
        };
    }, [state.status]);
    const openCustomDomain = () => {
        editorEngine.isPublishOpen = false;
        editorEngine.settingsTab = models_1.SettingsTabValue.DOMAIN;
        editorEngine.isSettingsOpen = true;
    };
    const createBaseDomain = () => {
        if (!projectsManager.domains) {
            console.error('No domains manager found');
            return;
        }
        projectsManager.domains.addBaseDomainToProject(userManager.settings.settings?.editor?.buildFlags);
    };
    const publish = () => {
        const domainManager = type === projects_1.DomainType.BASE
            ? projectsManager.domains?.base
            : projectsManager.domains?.custom;
        if (!domainManager) {
            console.error(`No ${type} domain hosting manager found`);
            return;
        }
        domainManager.publish({
            skipBadge: type === projects_1.DomainType.CUSTOM,
            buildFlags: userManager.settings.settings?.editor?.buildFlags,
            envVars: projectsManager.project?.env,
        });
    };
    const retry = () => {
        const domainManager = type === projects_1.DomainType.BASE
            ? projectsManager.domains?.base
            : projectsManager.domains?.custom;
        if (!domainManager) {
            console.error(`No ${type} domain hosting manager found`);
            return;
        }
        domainManager.refresh();
    };
    const renderNoDomainBase = () => {
        return (<>
                    <div className="flex items-center w-full">
                        <h3 className="">Base Domain</h3>
                    </div>

                    <button_1.Button onClick={createBaseDomain} className="w-full rounded-md p-3">
                        Publish preview site
                    </button_1.Button>
                </>);
    };
    const renderNoDomainCustom = () => {
        return (<>
                    <div className="flex items-center w-full">
                        <h3 className="">Custom Domain</h3>
                        <span className="ml-auto rounded-full bg-blue-400 text-white px-1.5 py-0.5 text-xs">
                            PRO
                        </span>
                    </div>

                    <button_1.Button onClick={openCustomDomain} className="w-full rounded-md p-3 bg-blue-400 hover:bg-blue-500 text-white">
                        Link a Custom Domain
                    </button_1.Button>
                </>);
    };
    const renderDomain = () => {
        if (!domain) {
            return 'Something went wrong';
        }
        // If the domain is custom, check if the user has a PRO plan
        if (type === projects_1.DomainType.CUSTOM) {
            if (plan !== usage_1.UsagePlanType.PRO) {
                return renderNoDomainCustom();
            }
        }
        return (<>
                    <div className="flex items-center w-full">
                        <h3 className="">
                            {type === projects_1.DomainType.BASE ? 'Base Domain' : 'Custom Domain'}
                        </h3>
                        {state.status === hosting_1.PublishStatus.PUBLISHED && domain.publishedAt && (<div className="ml-auto flex items-center gap-2">
                                <p className="text-green-300">Live</p>
                                <p>•</p>
                                <p>Updated {(0, utility_1.timeAgo)(domain.publishedAt)} ago</p>
                            </div>)}
                        {state.status === hosting_1.PublishStatus.ERROR && (<div className="ml-auto flex items-center gap-2">
                                <p className="text-red-500">Error</p>
                            </div>)}
                        {state.status === hosting_1.PublishStatus.LOADING && (<div className="ml-auto flex items-center gap-2">
                                <p className="">Updating • In progress</p>
                            </div>)}
                    </div>
                    {renderActionSection()}
                </>);
    };
    const renderActionSection = () => {
        if (!domain) {
            return 'Something went wrong';
        }
        return (<div className="w-full flex flex-col gap-2">
                    <Url_1.UrlSection url={domain.url}/>
                    {(state.status === hosting_1.PublishStatus.PUBLISHED ||
                state.status === hosting_1.PublishStatus.UNPUBLISHED) && (<button_1.Button onClick={publish} variant="outline" className={(0, utils_1.cn)('w-full rounded-md p-3', domain.type === projects_1.DomainType.CUSTOM &&
                    !domain.publishedAt &&
                    'bg-blue-400 hover:bg-blue-500 text-white')} disabled={isAnyDomainLoading}>
                            {domain.type === projects_1.DomainType.BASE && 'Update'}
                            {domain.type === projects_1.DomainType.CUSTOM &&
                    (domain.publishedAt ? 'Update' : `Publish to ${domain.url}`)}
                        </button_1.Button>)}
                    {state.status === hosting_1.PublishStatus.ERROR && (<div className="w-full flex flex-col gap-2">
                            <p className="text-red-500 max-h-20 overflow-y-auto">{state.message}</p>
                            <button_1.Button variant="outline" className="w-full rounded-md p-3" onClick={retry}>
                                Try Updating Again
                            </button_1.Button>
                        </div>)}
                    {state.status === hosting_1.PublishStatus.LOADING && (<div className="w-full flex flex-col gap-2 py-1">
                            <p>{state.message}</p>
                            <progress_1.Progress value={progress} className="w-full"/>
                        </div>)}
                </div>);
    };
    return (<div className="p-4 flex flex-col items-center gap-2">
                {domain
            ? renderDomain()
            : type === projects_1.DomainType.BASE
                ? renderNoDomainBase()
                : renderNoDomainCustom()}
            </div>);
});
//# sourceMappingURL=Domain.js.map