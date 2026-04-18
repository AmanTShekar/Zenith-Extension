"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopBar = void 0;
const Context_1 = require("@/components/Context");
const UserProfileDropdown_1 = __importDefault(require("@/components/ui/UserProfileDropdown"));
const models_1 = require("@/lib/models");
const projects_1 = require("@/lib/projects");
const usage_1 = require("@onlook/models/usage");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.TopBar = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const authManager = (0, Context_1.useAuthManager)();
    const userManager = (0, Context_1.useUserManager)();
    const plan = userManager.subscription?.plan;
    function signOut() {
        authManager.signOut();
    }
    function openPromptCreation() {
        projectsManager.projectsTab = projects_1.ProjectTabs.PROMPT_CREATE;
    }
    function openImportProject() {
        projectsManager.projectsTab = projects_1.ProjectTabs.IMPORT_PROJECT;
    }
    return (<div className="flex flex-row h-12 px-12 items-center">
            <div className="flex-1 flex items-center justify-start mt-3">
                <icons_1.Icons.OnlookTextLogo className="w-24" viewBox="0 0 139 17"/>
            </div>
            <div className="flex-1 flex justify-end space-x-2 mt-4 items-center">
                <dropdown_menu_1.DropdownMenu>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button className="text-sm text-foreground-onlook focus:outline-none" variant="ghost">
                            <icons_1.Icons.Plus className="w-5 h-5 mr-2"/>
                            New Project
                        </button_1.Button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent>
                        <dropdown_menu_1.DropdownMenuItem className={(0, utils_1.cn)('focus:bg-blue-100 focus:text-blue-900', 'hover:bg-blue-100 hover:text-blue-900', 'dark:focus:bg-blue-900 dark:focus:text-blue-100', 'dark:hover:bg-blue-900 dark:hover:text-blue-100')} onSelect={openPromptCreation}>
                            <icons_1.Icons.FilePlus className="w-4 h-4 mr-2"/>
                            Start from scratch
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem className={(0, utils_1.cn)('focus:bg-teal-100 focus:text-teal-900', 'hover:bg-teal-100 hover:text-teal-900', 'dark:focus:bg-teal-900 dark:focus:text-teal-100', 'dark:hover:bg-teal-900 dark:hover:text-teal-100')} onSelect={openImportProject}>
                            <icons_1.Icons.Download className="w-4 h-4 mr-2"/>
                            Import existing project
                        </dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>
                <UserProfileDropdown_1.default>
                    {plan === usage_1.UsagePlanType.PRO && (<dropdown_menu_1.DropdownMenuItem onSelect={() => {
                editorEngine.isPlansOpen = true;
            }}>
                            <icons_1.Icons.Person className="w-4 h-4 mr-2"/>
                            Subscription
                        </dropdown_menu_1.DropdownMenuItem>)}
                    <dropdown_menu_1.DropdownMenuItem onSelect={() => {
            editorEngine.isSettingsOpen = true;
            editorEngine.settingsTab = models_1.SettingsTabValue.PREFERENCES;
        }}>
                        <icons_1.Icons.Gear className="w-4 h-4 mr-2"/>
                        Settings
                    </dropdown_menu_1.DropdownMenuItem>
                    <dropdown_menu_1.DropdownMenuItem disabled={!authManager.isAuthEnabled} onSelect={signOut}>
                        <icons_1.Icons.Exit className="w-4 h-4 mr-2"/>
                        Sign out
                    </dropdown_menu_1.DropdownMenuItem>
                </UserProfileDropdown_1.default>
            </div>
        </div>);
});
//# sourceMappingURL=index.js.map