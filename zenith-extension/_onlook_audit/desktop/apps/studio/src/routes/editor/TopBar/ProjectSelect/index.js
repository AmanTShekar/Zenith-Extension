"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const projects_1 = require("@/lib/projects");
const routes_1 = require("@/lib/routes");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utils_2 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const ProjectBreadcrumb = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const routeManager = (0, Context_1.useRouteManager)();
    const [isDropdownOpen, setIsDropdownOpen] = (0, react_1.useState)(false);
    const closeTimeoutRef = (0, react_1.useRef)();
    const { t } = (0, react_i18next_1.useTranslation)();
    const [isClosingProject, setIsClosingProject] = (0, react_1.useState)(false);
    async function handleNavigateToProjects(tab) {
        try {
            setIsClosingProject(true);
            await takeScreenshotWithTimeout();
            await projectsManager.runner?.stop();
        }
        catch (error) {
            console.error('Failed to take screenshot:', error);
        }
        setTimeout(() => {
            projectsManager.project = null;
            if (tab) {
                projectsManager.projectsTab = tab;
            }
            routeManager.route = routes_1.Route.PROJECTS;
            setIsClosingProject(false);
        }, 100);
    }
    const takeScreenshotWithTimeout = async () => {
        try {
            const screenshotPromise = saveScreenshot();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Screenshot timeout')), 5000);
            });
            await Promise.race([screenshotPromise, timeoutPromise]);
        }
        catch (error) {
            console.warn('Screenshot timed out or failed, continuing anyway');
        }
    };
    const handleOpenProjectFolder = () => {
        const project = projectsManager.project;
        if (project && project.folderPath) {
            (0, utils_1.invokeMainChannel)(constants_1.MainChannels.OPEN_IN_EXPLORER, project.folderPath);
        }
    };
    async function saveScreenshot() {
        const project = projectsManager.project;
        if (!project) {
            console.error('No project selected');
            return;
        }
        const projectId = project.id;
        const result = await editorEngine.takeActiveWebviewScreenshot(projectId, {
            save: true,
        });
        if (!result || !result.name) {
            console.error('Failed to take screenshot');
            return;
        }
        project.previewImg = result.name;
        project.updatedAt = new Date().toISOString();
        projectsManager.updateProject(project);
    }
    return (<div className="mx-2 flex flex-row items-center text-small gap-2">
            <dropdown_menu_1.DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <button_1.Button variant={'ghost'} className="mx-0 px-0 gap-2 text-foreground-onlook text-small hover:text-foreground-active hover:bg-transparent">
                        <icons_1.Icons.OnlookLogo className={(0, utils_2.cn)('w-6 h-6 hidden md:block', isClosingProject && 'animate-pulse')}/>
                        <span className="mx-0 max-w-[60px] md:max-w-[100px] lg:max-w-[200px] px-0 text-foreground-onlook text-small truncate cursor-pointer">
                            {isClosingProject
            ? 'Stopping project...'
            : projectsManager.project?.name}
                        </span>
                        <icons_1.Icons.ChevronDown className="transition-all rotate-0 group-data-[state=open]:-rotate-180 duration-200 ease-in-out text-foreground-onlook "/>
                    </button_1.Button>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent align="start" className="w-48" onMouseEnter={() => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        }} onMouseLeave={() => {
            closeTimeoutRef.current = setTimeout(() => {
                setIsDropdownOpen(false);
            }, 300);
        }}>
                    <dropdown_menu_1.DropdownMenuItem onClick={() => handleNavigateToProjects()}>
                        <div className="flex row center items-center group">
                            <icons_1.Icons.Tokens className="mr-2 group-hover:rotate-12 transition-transform"/>
                            {t('projects.actions.goToAllProjects')}
                        </div>
                    </dropdown_menu_1.DropdownMenuItem>
                    <dropdown_menu_1.DropdownMenuSeparator />
                    <dropdown_menu_1.DropdownMenuSub>
                        <dropdown_menu_1.DropdownMenuSubTrigger>
                            {t('projects.actions.newProject')}
                        </dropdown_menu_1.DropdownMenuSubTrigger>
                        <dropdown_menu_1.DropdownMenuSubContent>
                            <dropdown_menu_1.DropdownMenuItem onClick={() => handleNavigateToProjects(projects_1.ProjectTabs.PROMPT_CREATE)} className={(0, utils_2.cn)('focus:bg-blue-100 focus:text-blue-900', 'hover:bg-blue-100 hover:text-blue-900', 'dark:focus:bg-blue-900 dark:focus:text-blue-100', 'dark:hover:bg-blue-900 dark:hover:text-blue-100')}>
                                <icons_1.Icons.FilePlus className="mr-2 h-4 w-4"/>
                                {t('projects.actions.startFromScratch')}
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem onClick={() => handleNavigateToProjects(projects_1.ProjectTabs.IMPORT_PROJECT)} className={(0, utils_2.cn)('focus:bg-teal-100 focus:text-teal-900', 'hover:bg-teal-100 hover:text-teal-900', 'dark:focus:bg-teal-900 dark:focus:text-teal-100', 'dark:hover:bg-teal-900 dark:hover:text-teal-100')}>
                                <icons_1.Icons.Download className="mr-2 h-4 w-4"/>
                                {t('projects.actions.importProject')}
                            </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuSubContent>
                    </dropdown_menu_1.DropdownMenuSub>
                    <dropdown_menu_1.DropdownMenuSeparator />
                    <dropdown_menu_1.DropdownMenuItem onClick={handleOpenProjectFolder}>
                        {t('projects.actions.showInExplorer')}
                    </dropdown_menu_1.DropdownMenuItem>
                    <dropdown_menu_1.DropdownMenuItem onClick={() => {
            editorEngine.isPlansOpen = true;
        }}>
                        {t('projects.actions.subscriptions')}
                    </dropdown_menu_1.DropdownMenuItem>
                    <dropdown_menu_1.DropdownMenuItem onClick={() => {
            editorEngine.isSettingsOpen = true;
            editorEngine.settingsTab = models_1.SettingsTabValue.PROJECT;
        }}>
                        {t('projects.actions.settings')}
                    </dropdown_menu_1.DropdownMenuItem>
                </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
        </div>);
});
exports.default = ProjectBreadcrumb;
//# sourceMappingURL=index.js.map