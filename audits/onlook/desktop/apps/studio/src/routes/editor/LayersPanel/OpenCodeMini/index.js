"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const ide_1 = require("@onlook/models/ide");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const ide_2 = require("/common/ide");
const OpenCodeMini = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const userManager = (0, Context_1.useUserManager)();
    const [folderPath, setFolder] = (0, react_2.useState)(null);
    const [instance, setInstance] = (0, react_2.useState)(null);
    const [root, setRoot] = (0, react_2.useState)(null);
    const ide = ide_2.IDE.fromType(userManager.settings.settings?.editor?.ideType || ide_1.DEFAULT_IDE);
    const [isDropdownOpen, setIsDropdownOpen] = (0, react_2.useState)(false);
    const [isFolderHovered, setIsFolderHovered] = (0, react_2.useState)(false);
    const IDEIcon = icons_1.Icons[ide.icon];
    (0, react_2.useEffect)(() => {
        if (projectsManager.project) {
            const folder = projectsManager.project.folderPath;
            setFolder(folder);
        }
    }, []);
    (0, react_2.useEffect)(() => {
        updateInstanceAndRoot();
    }, [editorEngine.elements.selected]);
    async function updateInstanceAndRoot() {
        if (editorEngine.elements.selected.length > 0) {
            const element = editorEngine.elements.selected[0];
            setInstance(element.instanceId);
            setRoot(element.oid);
        }
        else {
            setInstance(null);
            setRoot(null);
        }
    }
    return (<dropdown_menu_1.DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button className="w-16 h-14 rounded-xl text-small flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground" disabled={!instance && !root && !folderPath}>
                            <react_1.AnimatePresence mode="wait">
                                <react_1.motion.div key={ide.type} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} transition={{ duration: 0.2 }}>
                                    <IDEIcon className="w-4 h-4 overflow-visible"/>
                                </react_1.motion.div>
                            </react_1.AnimatePresence>
                        </button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipPortal>
                    <tooltip_1.TooltipContent side="left" sideOffset={5} className={(0, utils_1.cn)(isDropdownOpen && 'invisible')}>
                        <p>
                            Open {instance || root ? 'selected element' : 'folder'} in{' '}
                            {ide.displayName}
                        </p>
                    </tooltip_1.TooltipContent>
                </tooltip_1.TooltipPortal>
            </tooltip_1.Tooltip>
            <dropdown_menu_1.DropdownMenuContent align="end" side="left" alignOffset={55} sideOffset={-55} className="w-64">
                <dropdown_menu_1.DropdownMenuItem className="text-sm" onClick={() => {
            editorEngine.settingsTab = models_1.SettingsTabValue.PREFERENCES;
            editorEngine.isSettingsOpen = true;
        }}>
                    <icons_1.Icons.Gear className="mr-2 w-4 h-4"/>
                    Change IDE
                </dropdown_menu_1.DropdownMenuItem>

                <dropdown_menu_1.DropdownMenuSeparator />

                <dropdown_menu_1.DropdownMenuItem className="text-sm" onClick={() => {
            editorEngine.code.viewSourceFile(folderPath);
        }} onMouseEnter={() => setIsFolderHovered(true)} onMouseLeave={() => setIsFolderHovered(false)}>
                    {isFolderHovered ? (<icons_1.Icons.DirectoryOpen className="mr-2 w-4 h-4"/>) : (<icons_1.Icons.Directory className="mr-2 w-4 h-4"/>)}
                    Open Project Folder in {ide.displayName}
                </dropdown_menu_1.DropdownMenuItem>
                {instance && (<dropdown_menu_1.DropdownMenuItem className="text-sm" onClick={() => {
                editorEngine.code.viewSource(instance);
            }}>
                        <icons_1.Icons.ComponentInstance className="mr-2 w-4 h-4"/>
                        Locate Instance Code
                    </dropdown_menu_1.DropdownMenuItem>)}
                {root && (<dropdown_menu_1.DropdownMenuItem className="text-sm" onClick={() => {
                editorEngine.code.viewSource(root);
            }}>
                        {instance ? (<icons_1.Icons.Component className="mr-2 w-4 h-4"/>) : (<icons_1.Icons.Code className="mr-2 w-4 h-4"/>)}
                        Locate {instance ? 'Component' : 'Element'} Code
                    </dropdown_menu_1.DropdownMenuItem>)}
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
exports.default = OpenCodeMini;
//# sourceMappingURL=index.js.map