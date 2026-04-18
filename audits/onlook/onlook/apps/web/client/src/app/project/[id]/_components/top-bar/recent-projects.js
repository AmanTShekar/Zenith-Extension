"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecentProjectsMenu = void 0;
const editor_1 = require("@/components/store/editor");
const keys_1 = require("@/i18n/keys");
const react_1 = require("@/trpc/react");
const constants_1 = require("@/utils/constants");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const next_intl_1 = require("next-intl");
const navigation_1 = require("next/navigation");
const react_2 = require("react");
exports.RecentProjectsMenu = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const currentProjectId = editorEngine.projectId;
    const router = (0, navigation_1.useRouter)();
    const t = (0, next_intl_1.useTranslations)();
    const [loadingProjectId, setLoadingProjectId] = (0, react_2.useState)(null);
    const { data: projects, isLoading: isLoadingProjects } = react_1.api.project.list.useQuery({
        limit: 5,
        excludeProjectId: currentProjectId,
    });
    const recentProjects = projects
        ?.filter(project => project.id !== currentProjectId)
        || [];
    const handleProjectClick = async (projectId) => {
        setLoadingProjectId(projectId);
        router.push(`${constants_1.Routes.PROJECT}/${projectId}`);
    };
    if (isLoadingProjects) {
        return (<dropdown_menu_1.DropdownMenuSub>
                <dropdown_menu_1.DropdownMenuSubTrigger className="cursor-pointer">
                    <div className="flex flex-row center items-center">
                        <icons_1.Icons.Cube className="mr-2"/>
                        {t(keys_1.transKeys.projects.actions.recentProjects)}
                    </div>
                </dropdown_menu_1.DropdownMenuSubTrigger>
                <dropdown_menu_1.DropdownMenuSubContent className='ml-2'>
                    <dropdown_menu_1.DropdownMenuItem disabled>
                        <div className="flex flex-row center items-center">
                            <icons_1.Icons.LoadingSpinner className="mr-2 w-4 h-4 animate-spin"/>
                            Loading...
                        </div>
                    </dropdown_menu_1.DropdownMenuItem>
                </dropdown_menu_1.DropdownMenuSubContent>
            </dropdown_menu_1.DropdownMenuSub>);
    }
    if (!recentProjects.length) {
        return (<dropdown_menu_1.DropdownMenuSub>
                <dropdown_menu_1.DropdownMenuSubTrigger className="cursor-pointer">
                    <div className="flex flex-row center items-center">
                        <icons_1.Icons.Cube className="mr-2"/>
                        {t(keys_1.transKeys.projects.actions.recentProjects)}
                    </div>
                </dropdown_menu_1.DropdownMenuSubTrigger>
                <dropdown_menu_1.DropdownMenuSubContent className='ml-2'>
                    <dropdown_menu_1.DropdownMenuItem disabled>
                        <div className="flex flex-row center items-center text-muted-foreground">
                            <icons_1.Icons.Cube className="mr-2"/>
                            {t(keys_1.transKeys.projects.select.empty)}
                        </div>
                    </dropdown_menu_1.DropdownMenuItem>
                    <dropdown_menu_1.DropdownMenuSeparator />
                    <dropdown_menu_1.DropdownMenuItem onClick={() => router.push(constants_1.Routes.PROJECTS)} className="cursor-pointer">
                        <div className="flex flex-row center items-center">
                            <icons_1.Icons.Tokens className="mr-2"/>
                            {t(keys_1.transKeys.projects.actions.goToAllProjects)}
                        </div>
                    </dropdown_menu_1.DropdownMenuItem>
                </dropdown_menu_1.DropdownMenuSubContent>
            </dropdown_menu_1.DropdownMenuSub>);
    }
    return (<dropdown_menu_1.DropdownMenuSub>
            <dropdown_menu_1.DropdownMenuSubTrigger className="cursor-pointer">
                <div className="flex flex-row center items-center">
                    <icons_1.Icons.Cube className="mr-2"/>
                    {t(keys_1.transKeys.projects.actions.recentProjects)}
                </div>
            </dropdown_menu_1.DropdownMenuSubTrigger>
            <dropdown_menu_1.DropdownMenuSubContent className="w-48 ml-2">
                {recentProjects.map((project) => (<dropdown_menu_1.DropdownMenuItem key={project.id} onClick={() => handleProjectClick(project.id)} disabled={loadingProjectId === project.id} className="cursor-pointer">
                        <div className="flex flex-row center items-center group">
                            {loadingProjectId === project.id ? (<icons_1.Icons.LoadingSpinner className="mr-2 w-4 h-4 animate-spin"/>) : (<icons_1.Icons.Cube className="mr-2"/>)}
                            <span className="truncate max-w-[120px]">
                                {project.name}
                            </span>
                        </div>
                    </dropdown_menu_1.DropdownMenuItem>))}
            </dropdown_menu_1.DropdownMenuSubContent>
        </dropdown_menu_1.DropdownMenuSub>);
});
//# sourceMappingURL=recent-projects.js.map