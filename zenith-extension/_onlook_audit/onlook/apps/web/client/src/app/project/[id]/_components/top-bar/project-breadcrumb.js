"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectBreadcrumb = void 0;
const editor_1 = require("@/components/store/editor");
const state_1 = require("@/components/store/state");
const keys_1 = require("@/i18n/keys");
const react_1 = require("@/trpc/react");
const stripe_1 = require("@onlook/stripe");
const badge_1 = require("@onlook/ui/badge");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const next_intl_1 = require("next-intl");
const navigation_1 = require("next/navigation");
const react_2 = require("posthog-js/react");
const react_3 = require("react");
const clone_project_dialog_1 = require("../clone-project-dialog");
const new_project_menu_1 = require("./new-project-menu");
const recent_projects_1 = require("./recent-projects");
exports.ProjectBreadcrumb = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const stateManager = (0, state_1.useStateManager)();
    const posthog = (0, react_2.usePostHog)();
    const { data: project } = react_1.api.project.get.useQuery({ projectId: editorEngine.projectId });
    const { data: subscription } = react_1.api.subscription.get.useQuery();
    const isPro = subscription?.product.type === stripe_1.ProductType.PRO;
    const t = (0, next_intl_1.useTranslations)();
    const closeTimeoutRef = (0, react_3.useRef)(null);
    const [isDropdownOpen, setIsDropdownOpen] = (0, react_3.useState)(false);
    const [isClosingProject, setIsClosingProject] = (0, react_3.useState)(false);
    const [isDownloading, setIsDownloading] = (0, react_3.useState)(false);
    const [showCloneDialog, setShowCloneDialog] = (0, react_3.useState)(false);
    async function handleNavigateToProjects(_route) {
        try {
            setIsClosingProject(true);
            editorEngine.screenshot.captureScreenshot();
        }
        catch (error) {
            console.error('Failed to take screenshots:', error);
        }
        finally {
            setTimeout(() => {
                setIsClosingProject(false);
                (0, navigation_1.redirect)('/projects');
            }, 100);
        }
    }
    async function handleDownloadCode() {
        if (!project) {
            console.error('No project found');
            return;
        }
        const sandboxId = editorEngine.branches.activeBranch.sandbox.id;
        if (!sandboxId) {
            console.error('No sandbox ID found');
            return;
        }
        try {
            setIsDownloading(true);
            const result = await editorEngine.activeSandbox.downloadFiles(project.name);
            if (result) {
                window.open(result.downloadUrl, '_blank');
                posthog.capture('download_project_code', {
                    projectId: project.id,
                    projectName: project.name,
                });
                sonner_1.toast.success(t(keys_1.transKeys.projects.actions.downloadSuccess));
            }
            else {
                throw new Error('Failed to generate download URL');
            }
        }
        catch (error) {
            console.error('Download failed:', error);
            sonner_1.toast.error(t(keys_1.transKeys.projects.actions.downloadError), {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
            posthog.capture('download_project_code_failed', {
                projectId: project.id,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
        finally {
            setIsDownloading(false);
        }
    }
    return (<div className="mr-0 flex flex-row items-center text-small gap-2">
            <dropdown_menu_1.DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <button_1.Button variant='ghost' className="ml-1 px-0 gap-2 text-foreground-onlook text-small hover:text-foreground-active hover:!bg-transparent cursor-pointer group">
                        <icons_1.Icons.OnlookLogo className={(0, utils_1.cn)('w-9 h-9 hidden md:block', isClosingProject && 'animate-pulse')}/>
                        <span className="mx-0 max-w-[60px] md:max-w-[100px] lg:max-w-[200px] px-0 text-foreground-onlook text-small truncate cursor-pointer group-hover:text-foreground-active">
                            {isClosingProject ? 'Stopping project...' : project?.name}
                        </span>
                    </button_1.Button>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent align="start" className="w-56" onMouseEnter={() => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        }} onMouseLeave={() => {
            closeTimeoutRef.current = setTimeout(() => {
                setIsDropdownOpen(false);
            }, 300);
        }}>
                    <dropdown_menu_1.DropdownMenuItem onClick={() => handleNavigateToProjects()} className="cursor-pointer">
                        <div className="flex flex-row center items-center group">
                            <icons_1.Icons.Tokens className="mr-2"/>
                            {t(keys_1.transKeys.projects.actions.goToAllProjects)}
                        </div>
                    </dropdown_menu_1.DropdownMenuItem>
                    <dropdown_menu_1.DropdownMenuSeparator />
                    <recent_projects_1.RecentProjectsMenu />
                    <dropdown_menu_1.DropdownMenuSeparator />
                    <new_project_menu_1.NewProjectMenu onShowCloneDialog={setShowCloneDialog}/>
                    <dropdown_menu_1.DropdownMenuItem onClick={handleDownloadCode} disabled={isDownloading || !isPro} className="cursor-pointer">
                        <div className="flex flex-row center items-center justify-between group w-full">
                            <div className="flex flex-row center items-center">
                                <icons_1.Icons.Download className="mr-2"/>
                                {isDownloading
            ? t(keys_1.transKeys.projects.actions.downloadingCode)
            : t(keys_1.transKeys.projects.actions.downloadCode)}
                            </div>
                            <badge_1.Badge variant="secondary" className="ml-2 text-xs bg-blue-400 text-white rounded-full p-0.5 px-1.5">PRO</badge_1.Badge>
                        </div>
                    </dropdown_menu_1.DropdownMenuItem>
                    <dropdown_menu_1.DropdownMenuSeparator />
                    <dropdown_menu_1.DropdownMenuItem className="cursor-pointer" onClick={() => (stateManager.isSettingsModalOpen = true)}>
                        <div className="flex flex-row center items-center group">
                            <icons_1.Icons.Gear className="mr-2 group-hover:rotate-12 transition-transform"/>
                            {t(keys_1.transKeys.help.menu.openSettings)}
                        </div>
                    </dropdown_menu_1.DropdownMenuItem>
                </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>

            <clone_project_dialog_1.CloneProjectDialog isOpen={showCloneDialog} onClose={() => setShowCloneDialog(false)} projectName={project?.name}/>
        </div>);
});
//# sourceMappingURL=project-breadcrumb.js.map