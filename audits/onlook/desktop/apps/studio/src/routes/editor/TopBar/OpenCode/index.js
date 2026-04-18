"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const ide_1 = require("@onlook/models/ide");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const ide_2 = require("/common/ide");
const OpenCode = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const userManager = (0, Context_1.useUserManager)();
    const [folderPath, setFolder] = (0, react_2.useState)(null);
    const [instance, setInstance] = (0, react_2.useState)(null);
    const [root, setRoot] = (0, react_2.useState)(null);
    const [ide, setIde] = (0, react_2.useState)(ide_2.IDE.fromType(userManager.settings.settings?.editor?.ideType || ide_1.DEFAULT_IDE));
    const [isDropdownOpen, setIsDropdownOpen] = (0, react_2.useState)(false);
    const [isFolderHovered, setIsFolderHovered] = (0, react_2.useState)(false);
    const [scopeDropdownIcon, animateDropdownIcon] = (0, react_1.useAnimate)();
    const [showTooltip, setShowTooltip] = (0, react_2.useState)(undefined);
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
    function viewSource(oid) {
        editorEngine.code.viewSource(oid);
    }
    function viewSourceFile(filePath) {
        editorEngine.code.viewSourceFile(filePath);
    }
    function updateIde(newIde) {
        userManager.settings.updateEditor({ ideType: newIde.type });
        setIde(newIde);
    }
    const ideCharacters = (0, react_2.useMemo)(() => {
        const prefixChars = 'Open in '.split('').map((ch, index) => ({
            id: `opencode_prefix_${index}`,
            label: ch === ' ' ? '\u00A0' : ch,
        }));
        const entities = `${ide}`.split('').map((ch) => ch);
        const characters = [];
        for (let index = 0; index < entities.length; index++) {
            const entity = entities[index];
            const count = entities.slice(0, index).filter((e) => e === entity).length;
            characters.push({
                id: `opencode_${entity}${count + 1}`,
                label: characters.length === 0 ? entity.toUpperCase() : entity,
            });
        }
        return [...prefixChars, ...characters];
    }, [`${ide}`]);
    const handleIDEDropdownOpenChange = (open) => {
        setIsDropdownOpen(open);
        if (open) {
            setShowTooltip(false);
        }
        animateDropdownIcon(scopeDropdownIcon.current, { rotate: open ? 30 : 0 }, { duration: 0.4 });
    };
    return (<div className="inline-flex items-center justify-center whitespace-nowrap overflow-hidden rounded-md transition-colors focus-visible:outline-none h-8 border border-input shadow-sm bg-background hover:bg-background-onlook hover:text-foreground-active/90 hover:border-foreground-active/30 text-xs space-x-0 p-0 mr-1">
            <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                    <div>
                        <dropdown_menu_1.DropdownMenu onOpenChange={(isOpen) => setIsDropdownOpen(isOpen)}>
                            <dropdown_menu_1.DropdownMenuTrigger className="flex flex-row items-center" asChild disabled={!instance && !root}>
                                <button className="flex items-center text-smallPlus justify-center disabled:text-foreground-onlook h-8 px-2.5 rounded-l-md hover:text-foreground-active/90 transition-all duration-300 ease-in-out" disabled={!folderPath && !instance && !root} onClick={() => {
            if (folderPath) {
                viewSourceFile(folderPath);
            }
            else {
                viewSource(instance || root || null);
            }
        }}>
                                    <react_1.AnimatePresence mode="wait">
                                        <react_1.motion.div key={ide.type} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} transition={{ duration: 0.2 }} className="relative">
                                            <IDEIcon className="text-default h-3 w-3 mr-2 ml-1 flex-shrink-0"/>
                                        </react_1.motion.div>
                                    </react_1.AnimatePresence>
                                    <span className="text-xs">
                                        <react_1.AnimatePresence mode="popLayout">
                                            {ideCharacters.map((character) => (<react_1.motion.span key={character.id} layoutId={character.id} layout="position" className="inline-block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{
                type: 'spring',
                bounce: 0.1,
                duration: 0.4,
            }}>
                                                    {character.label}
                                                </react_1.motion.span>))}
                                        </react_1.AnimatePresence>
                                    </span>
                                </button>
                            </dropdown_menu_1.DropdownMenuTrigger>
                            <dropdown_menu_1.DropdownMenuContent>
                                <dropdown_menu_1.DropdownMenuItem className="text-xs" onSelect={() => {
            viewSourceFile(folderPath);
        }} onMouseEnter={() => setIsFolderHovered(true)} onMouseLeave={() => setIsFolderHovered(false)}>
                                    {isFolderHovered ? (<icons_1.Icons.DirectoryOpen className="mr-2 w-3 h-3"/>) : (<icons_1.Icons.Directory className="mr-2 w-3 h-3"/>)}
                                    Folder
                                </dropdown_menu_1.DropdownMenuItem>
                                {instance && (<dropdown_menu_1.DropdownMenuItem className="text-xs" onSelect={() => {
                viewSource(instance);
            }}>
                                        <icons_1.Icons.ComponentInstance className="mr-2 w-3 h-3"/>
                                        Instance
                                    </dropdown_menu_1.DropdownMenuItem>)}
                                {root && (<dropdown_menu_1.DropdownMenuItem className="text-xs" onSelect={() => {
                viewSource(root);
            }}>
                                        <icons_1.Icons.Code className="mr-2 w-3 h-3"/>
                                        Element
                                    </dropdown_menu_1.DropdownMenuItem>)}
                            </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                    </div>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipContent side="bottom" className={(0, utils_1.cn)('mt-3', isDropdownOpen && 'invisible')}>
                    <p>Open {instance || root ? 'selected element' : 'folder'} in IDE</p>
                </tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>

            <tooltip_1.Tooltip open={isDropdownOpen ? false : showTooltip} onOpenChange={setShowTooltip}>
                <tooltip_1.TooltipTrigger asChild>
                    <div>
                        <dropdown_menu_1.DropdownMenu onOpenChange={handleIDEDropdownOpenChange}>
                            <dropdown_menu_1.DropdownMenuTrigger asChild>
                                <button className="text-foreground-active bg-transperant hover:text-foreground-active/90 w-8 h-8 flex items-center justify-center" onClick={() => viewSource(instance || root)}>
                                    <icons_1.Icons.Gear ref={scopeDropdownIcon}/>
                                </button>
                            </dropdown_menu_1.DropdownMenuTrigger>
                            <dropdown_menu_1.DropdownMenuContent>
                                {ide_2.IDE.getAll().map((item) => {
            const ItemIcon = icons_1.Icons[item.icon];
            return (<dropdown_menu_1.DropdownMenuItem key={item.displayName} className="text-xs" onSelect={() => {
                    updateIde(item);
                }}>
                                            <ItemIcon className="text-default h-3 w-3 mr-2"/>
                                            <span>{item.displayName}</span>
                                            {ide === item && (<icons_1.Icons.CheckCircled className="ml-auto"/>)}
                                        </dropdown_menu_1.DropdownMenuItem>);
        })}
                            </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                    </div>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipPortal>
                    <tooltip_1.TooltipContent side="bottom" className="mt-0">
                        <p>Change which IDE you use</p>
                    </tooltip_1.TooltipContent>
                </tooltip_1.TooltipPortal>
            </tooltip_1.Tooltip>
        </div>);
});
exports.default = OpenCode;
//# sourceMappingURL=index.js.map