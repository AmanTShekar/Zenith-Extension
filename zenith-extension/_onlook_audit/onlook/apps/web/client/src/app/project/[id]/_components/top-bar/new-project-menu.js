"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewProjectMenu = void 0;
const editor_1 = require("@/components/store/editor");
const use_create_blank_project_1 = require("@/hooks/use-create-blank-project");
const keys_1 = require("@/i18n/keys");
const constants_1 = require("@/utils/constants");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const next_intl_1 = require("next-intl");
const navigation_1 = require("next/navigation");
exports.NewProjectMenu = (0, mobx_react_lite_1.observer)(({ onShowCloneDialog }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { handleStartBlankProject, isCreatingProject } = (0, use_create_blank_project_1.useCreateBlankProject)();
    const t = (0, next_intl_1.useTranslations)();
    const router = (0, navigation_1.useRouter)();
    const handleStartBlankWithScreenshot = async () => {
        // Capture screenshot of current project before cleanup
        try {
            editorEngine.screenshot.captureScreenshot();
        }
        catch (error) {
            console.error('Failed to capture screenshot:', error);
        }
        await handleStartBlankProject();
    };
    return (<dropdown_menu_1.DropdownMenuSub>
            <dropdown_menu_1.DropdownMenuSubTrigger className="cursor-pointer">
                <div className="flex flex-row center items-center">
                    <icons_1.Icons.Plus className="mr-2"/>
                    {t(keys_1.transKeys.projects.actions.newProject)}
                </div>
            </dropdown_menu_1.DropdownMenuSubTrigger>
            <dropdown_menu_1.DropdownMenuSubContent className="w-48 ml-2">
                <dropdown_menu_1.DropdownMenuItem onClick={handleStartBlankWithScreenshot} disabled={isCreatingProject} className="cursor-pointer">
                    <div className="flex flex-row center items-center group">
                        {isCreatingProject ? (<icons_1.Icons.LoadingSpinner className="mr-2 animate-spin"/>) : (<icons_1.Icons.FilePlus className="mr-2"/>)}
                        {t(keys_1.transKeys.projects.actions.blankProject)}
                    </div>
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem onClick={() => router.push(constants_1.Routes.IMPORT_PROJECT)}>
                    <div className="flex flex-row center items-center group">
                        <icons_1.Icons.Upload className="mr-2"/>
                        {t(keys_1.transKeys.projects.actions.import)}
                    </div>
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem onClick={() => onShowCloneDialog(true)} className="cursor-pointer">
                    <div className="flex flex-row center items-center group">
                        <icons_1.Icons.Copy className="mr-2"/>
                        Clone this project
                    </div>
                </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuSubContent>
        </dropdown_menu_1.DropdownMenuSub>);
});
//# sourceMappingURL=new-project-menu.js.map