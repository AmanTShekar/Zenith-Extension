"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const AdvancedTab = (0, mobx_react_lite_1.observer)(() => {
    const userManager = (0, Context_1.useUserManager)();
    const enableBunReplace = userManager.settings.settings?.editor?.enableBunReplace ??
        constants_1.DefaultSettings.EDITOR_SETTINGS.enableBunReplace;
    const newProjectPath = userManager.settings.settings?.editor?.newProjectPath ??
        userManager.settings.defaultProjectPath;
    const buildFlags = (0, utility_1.isNullOrUndefined)(userManager.settings.settings?.editor?.buildFlags)
        ? constants_1.DefaultSettings.EDITOR_SETTINGS.buildFlags
        : userManager.settings.settings?.editor?.buildFlags;
    function updateBunReplace(enabled) {
        userManager.settings.updateEditor({ enableBunReplace: enabled });
    }
    function updateNewProjectPath(path) {
        userManager.settings.updateEditor({ newProjectPath: path });
    }
    function updateBuildFlags(flags) {
        userManager.settings.updateEditor({ buildFlags: flags });
    }
    async function selectNewProjectPath() {
        const path = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.PICK_COMPONENTS_DIRECTORY);
        if (path) {
            updateNewProjectPath(path);
        }
    }
    return (<div className="flex flex-col gap-8 p-6">
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col gap-2">
                    <p className="text-largePlus">{'Default project path'}</p>
                    <p className="text-foreground-onlook text-small">
                        {'Where to install new projects'}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-96">
                    <input_1.Input readOnly={true} id="folderPath" value={newProjectPath ?? ''} onChange={(e) => updateNewProjectPath(e.target.value)}/>
                    <button_1.Button size={'icon'} variant={'outline'} onClick={selectNewProjectPath}>
                        <icons_1.Icons.Directory />
                    </button_1.Button>
                </div>
            </div>
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col gap-2">
                    <p className="text-largePlus">{'Build flags'}</p>
                    <p className="text-foreground-onlook text-small">
                        {'Additional flags to pass to the build command'}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-96">
                    <input_1.Input id="buildFlags" value={buildFlags} onChange={(e) => updateBuildFlags(e.target.value)}/>
                </div>
            </div>
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col gap-2">
                    <p className="text-largePlus">{'Replace npm with bun'}</p>
                    <p className="text-foreground-onlook text-small">
                        {'Automatically replace npm commands with built-in bun runtime'}
                    </p>
                </div>
                <dropdown_menu_1.DropdownMenu>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button variant="outline" className="text-smallPlus min-w-[150px]">
                            {enableBunReplace ? 'On' : 'Off'}
                            <icons_1.Icons.ChevronDown className="ml-auto"/>
                        </button_1.Button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent className="text-smallPlus min-w-[150px]">
                        <dropdown_menu_1.DropdownMenuItem onClick={() => updateBunReplace(true)}>
                            {'On'}{' '}
                            <icons_1.Icons.Check className={enableBunReplace ? 'ml-auto' : 'hidden'}/>
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem onClick={() => updateBunReplace(false)}>
                            {'Off'}{' '}
                            <icons_1.Icons.Check className={!enableBunReplace ? 'ml-auto' : 'hidden'}/>
                        </dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>
            </div>
        </div>);
});
exports.default = AdvancedTab;
//# sourceMappingURL=index.js.map