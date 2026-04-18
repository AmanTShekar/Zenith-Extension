"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandPalletGroup = void 0;
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/utils");
const assets_1 = require("@onlook/models/assets");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const ColorPopover_1 = require("./ColorPopover");
const ColorNameInput_1 = require("./ColorNameInput");
const BrandPalletGroup = ({ title, colors, theme, onRename, onDelete, onColorChange, onColorChangeEnd, onDuplicate, isDefaultPalette = false, }) => {
    const [editingColorIndex, setEditingColorIndex] = (0, react_1.useState)(null);
    const [isAddingNewColor, setIsAddingNewColor] = (0, react_1.useState)(false);
    const [isRenaming, setIsRenaming] = (0, react_1.useState)(false);
    const editorEngine = (0, Context_1.useEditorEngine)();
    const themeManager = editorEngine.theme;
    const existedName = colors.map((color) => color.name);
    const handleColorChange = (index, newColor, newName, parentName) => {
        if (onColorChange) {
            onColorChange(title, index, newColor, newName, parentName);
        }
    };
    const handleColorChangeEnd = (index, newColor, newName, parentName) => {
        if (onColorChangeEnd) {
            onColorChangeEnd(title, index, newColor, newName, parentName);
        }
        setEditingColorIndex(null);
        setIsAddingNewColor(false);
    };
    const getColorValue = (color) => {
        return theme === 'dark' ? color.darkColor || color.lightColor : color.lightColor;
    };
    const handleRenameClick = () => {
        setIsRenaming(true);
    };
    const handleViewInCode = (color) => {
        if (!color.line?.config) {
            return;
        }
        const line = theme === assets_1.Theme.DARK ? color.line.css?.darkMode : color.line.css?.lightMode;
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.VIEW_SOURCE_FILE, {
            filePath: themeManager.tailwindConfigPath,
            line: color.line.config,
        });
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.VIEW_SOURCE_FILE, {
            filePath: themeManager.tailwindCssPath,
            line,
        });
    };
    const generateUniqueColorName = () => {
        return (0, utility_1.generateUniqueName)(title, existedName);
    };
    return (<div className="flex flex-col gap-1 group/palette">
            <div className="flex justify-between items-center">
                {!isDefaultPalette && isRenaming ? (<ColorNameInput_1.ColorNameInput initialName={title} onSubmit={(newName) => {
                onRename(title, newName);
                setIsRenaming(false);
            }} onCancel={() => setIsRenaming(false)} onBlur={(newName) => {
                onRename(title, newName);
                setIsRenaming(false);
            }}/>) : (<span className="text-small text-foreground-secondary font-normal">
                        {(0, utility_1.toNormalCase)(title)}
                    </span>)}
                {!isDefaultPalette && (<dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:bg-transparent opacity-0 group-hover/palette:opacity-100 [&[data-state=open]]:opacity-100 transition-opacity">
                                <icons_1.Icons.DotsHorizontal className="h-4 w-4 text-muted-foreground group-hover:text-foreground"/>
                            </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent className="rounded-md bg-background" align="start" side="bottom">
                            <dropdown_menu_1.DropdownMenuItem asChild>
                                <button_1.Button variant="ghost" className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group" onClick={handleRenameClick}>
                                    <span className="flex w-full text-smallPlus items-center">
                                        <icons_1.Icons.Pencil className="mr-2 h-4 w-4 text-foreground-secondary group-hover:text-foreground-active"/>
                                        <span>Rename</span>
                                    </span>
                                </button_1.Button>
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem asChild>
                                <button_1.Button variant="ghost" className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group" onClick={() => onDelete()}>
                                    <span className="flex w-full text-smallPlus items-center">
                                        <icons_1.Icons.Trash className="mr-2 h-4 w-4 text-foreground-secondary group-hover:text-foreground-active"/>
                                        <span>Delete</span>
                                    </span>
                                </button_1.Button>
                            </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>)}
            </div>
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-6 gap-1">
                    {colors ? (colors.map((color, index) => (<div key={`${title}-${index}`} className="relative group">
                                {editingColorIndex === index ? (<ColorPopover_1.ColorPopover color={utility_1.Color.from(getColorValue(color))} brandColor={color.name} onClose={() => setEditingColorIndex(null)} onColorChange={(newColor, newName) => handleColorChange(index, newColor, newName)} onColorChangeEnd={(newColor, newName) => handleColorChangeEnd(index, newColor, newName)} isDefaultPalette={isDefaultPalette} existedName={existedName}/>) : (<>
                                        <div className="w-full aspect-square rounded-lg cursor-pointer hover:ring-2 hover:ring-border-primary border border-primary/10" style={{ backgroundColor: getColorValue(color) }}/>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 [&[data-state=open]]:opacity-100">
                                            <dropdown_menu_1.DropdownMenu>
                                                <dropdown_menu_1.DropdownMenuTrigger asChild>
                                                    <button_1.Button variant="ghost" size="icon" className="h-[85%] w-[85%] p-0 bg-black hover:bg-black rounded-md flex items-center justify-center">
                                                        <tooltip_1.Tooltip>
                                                            <tooltip_1.TooltipTrigger asChild>
                                                                <icons_1.Icons.DotsHorizontal className="h-4 w-4 text-white"/>
                                                            </tooltip_1.TooltipTrigger>
                                                            <tooltip_1.TooltipPortal>
                                                                <tooltip_1.TooltipContent side="top">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm">
                                                                            {(0, utility_1.toNormalCase)(color.name)}
                                                                        </span>
                                                                        <span className="text-xs text-background-tertiary">
                                                                            {getColorValue(color)}
                                                                        </span>
                                                                    </div>
                                                                </tooltip_1.TooltipContent>
                                                            </tooltip_1.TooltipPortal>
                                                        </tooltip_1.Tooltip>
                                                    </button_1.Button>
                                                </dropdown_menu_1.DropdownMenuTrigger>
                                                <dropdown_menu_1.DropdownMenuContent className="rounded-md bg-background p-0 ml-1 mt-[-4px] min-w-[140px]" align="start" side="right">
                                                    <div className="flex items-start gap-2 px-2.5 py-2 border-b border-border mb-0.5">
                                                        <div className="w-4 h-4 rounded-sm mt-[2px] hidden" style={{
                    backgroundColor: getColorValue(color),
                }}/>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-foreground">
                                                                {(0, utility_1.toNormalCase)(color.name)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {getColorValue(color)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <dropdown_menu_1.DropdownMenuItem asChild>
                                                        <button_1.Button variant="ghost" className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group px-2 py-1" onClick={() => setEditingColorIndex(index)}>
                                                            <span className="flex w-full text-sm items-center">
                                                                <icons_1.Icons.Pencil className="mr-2 h-4 w-4"/>
                                                                <span>Edit color</span>
                                                            </span>
                                                        </button_1.Button>
                                                    </dropdown_menu_1.DropdownMenuItem>
                                                    <dropdown_menu_1.DropdownMenuItem asChild>
                                                        <button_1.Button variant="ghost" className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group px-2 py-1" onClick={() => onDuplicate?.(color.name)}>
                                                            <span className="flex w-full text-sm items-center">
                                                                <icons_1.Icons.Copy className="mr-2 h-4 w-4"/>
                                                                <span>Duplicate</span>
                                                            </span>
                                                        </button_1.Button>
                                                    </dropdown_menu_1.DropdownMenuItem>
                                                    <dropdown_menu_1.DropdownMenuItem asChild>
                                                        <button_1.Button variant="ghost" className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group px-2 py-1" onClick={() => handleViewInCode(color)}>
                                                            <span className="flex w-full text-sm items-center">
                                                                <icons_1.Icons.ExternalLink className="mr-2 h-4 w-4"/>
                                                                <span>View in code</span>
                                                            </span>
                                                        </button_1.Button>
                                                    </dropdown_menu_1.DropdownMenuItem>
                                                    {!isDefaultPalette ? (<dropdown_menu_1.DropdownMenuItem asChild>
                                                            <button_1.Button variant="ghost" className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group px-2 py-1" onClick={() => onDelete(color.name)}>
                                                                <span className="flex w-full text-sm items-center">
                                                                    <icons_1.Icons.Trash className="mr-2 h-4 w-4"/>
                                                                    <span>Delete</span>
                                                                </span>
                                                            </button_1.Button>
                                                        </dropdown_menu_1.DropdownMenuItem>) : (color.override && (<dropdown_menu_1.DropdownMenuItem asChild>
                                                                <button_1.Button variant="ghost" className="hover:bg-background-secondary focus:bg-background-secondary w-full rounded-sm group px-2 py-1" onClick={() => onDelete(color.name)}>
                                                                    <span className="flex w-full text-sm items-center">
                                                                        <icons_1.Icons.Reset className="mr-2 h-4 w-4"/>
                                                                        <span>Reset override</span>
                                                                    </span>
                                                                </button_1.Button>
                                                            </dropdown_menu_1.DropdownMenuItem>))}
                                                </dropdown_menu_1.DropdownMenuContent>
                                            </dropdown_menu_1.DropdownMenu>
                                        </div>
                                    </>)}
                            </div>))) : (<></>)}
                    {isAddingNewColor ? (<ColorPopover_1.ColorPopover color={utility_1.Color.from('#FFFFFF')} brandColor={generateUniqueColorName()} onClose={() => setIsAddingNewColor(false)} onColorChange={(newColor, newName) => handleColorChange(colors?.length || 0, newColor, newName, title)} onColorChangeEnd={(newColor, newName) => handleColorChangeEnd(colors?.length || 0, newColor, newName, title)} existedName={existedName}/>) : (<button_1.Button onClick={() => setIsAddingNewColor(true)} variant="outline" size="icon" className="w-full aspect-square rounded-lg border border-dashed flex items-center justify-center bg-transparent hover:bg-transparent">
                            <icons_1.Icons.Plus className="h-4 w-4"/>
                        </button_1.Button>)}
                </div>
            </div>
        </div>);
};
exports.BrandPalletGroup = BrandPalletGroup;
//# sourceMappingURL=ColorPalletGroup.js.map