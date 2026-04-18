"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const editor_1 = require("@/components/store/editor");
const assets_1 = require("@onlook/models/assets");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const color_name_input_1 = require("./color-name-input");
const color_pallet_group_1 = require("./color-pallet-group");
const ColorPanel = (0, mobx_react_lite_1.observer)(() => {
    const [theme, setTheme] = (0, react_1.useState)(assets_1.SystemTheme.LIGHT);
    const [isAddingNewGroup, setIsAddingNewGroup] = (0, react_1.useState)(false);
    const editorEngine = (0, editor_1.useEditorEngine)();
    const themeManager = editorEngine.theme;
    const { colorGroups, colorDefaults } = themeManager;
    (0, react_1.useEffect)(() => {
        themeManager.scanConfig();
    }, []);
    const handleRename = async (groupName, newName) => {
        await themeManager.rename(groupName, newName);
    };
    const handleDelete = async (groupName, colorName) => {
        await themeManager.delete(groupName, colorName);
    };
    const handleColorChange = async (groupName, index, newColor, newName, parentName) => {
        await themeManager.update(groupName, index, newColor, newName, parentName, theme, false);
    };
    const handleColorChangeEnd = async (groupName, index, newColor, newName, parentName) => {
        await themeManager.update(groupName, index, newColor, newName, parentName, theme, true);
    };
    const handleDuplicate = async (groupName, colorName, isDefaultPalette) => {
        await themeManager.duplicate(groupName, colorName, isDefaultPalette, theme);
    };
    const handleAddNewGroup = async (newName) => {
        await themeManager.add(newName);
        setIsAddingNewGroup(false);
    };
    const handleDefaultColorChange = async (groupName, colorIndex, newColor) => {
        await themeManager.handleDefaultColorChange(groupName, colorIndex, newColor, theme);
    };
    const handleClose = () => {
        editorEngine.state.brandTab = null;
    };
    return (<div className="text-active flex h-full w-full flex-grow flex-col overflow-y-auto p-0 text-xs">
            <div className="border-border bg-background fixed top-0 right-0 left-0 z-10 flex items-center justify-start border-b py-1.5 pr-2.5 pl-3 gap-2">
                <button_1.Button variant="ghost" size="icon" className="hover:bg-background-secondary h-7 w-7 rounded-md" onClick={handleClose}>
                    <icons_1.Icons.ArrowLeft className="h-4 w-4"/>
                </button_1.Button>
                <h2 className="text-foreground text-sm font-normal">Brand Colors</h2>
            </div>
            {/* Theme Toggle */}
            <div className="border-border mt-[2.5rem] flex gap-2 border-b px-4 py-3">
                <button_1.Button variant={theme === assets_1.SystemTheme.LIGHT ? 'default' : 'outline'} className={(0, utils_1.cn)('hover:bg-background-secondary w-full flex-1 gap-2 border-none bg-transparent px-0 text-gray-200 shadow-none', theme === assets_1.SystemTheme.LIGHT && 'bg-gray-900 text-white')} onClick={() => setTheme(assets_1.SystemTheme.LIGHT)}>
                    <icons_1.Icons.Sun className="h-4 w-4"/>
                    Light mode
                </button_1.Button>
                <button_1.Button variant={theme === assets_1.SystemTheme.DARK ? 'default' : 'outline'} className={(0, utils_1.cn)('hover:bg-background-secondary w-full flex-1 gap-2 border-none bg-transparent px-0 text-gray-200 shadow-none', theme === assets_1.SystemTheme.DARK && 'bg-gray-900 text-white')} onClick={() => setTheme(assets_1.SystemTheme.DARK)}>
                    <icons_1.Icons.Moon className="h-4 w-4"/>
                    Dark mode
                </button_1.Button>
            </div>

            {/* Brand Palette Groups section */}
            <div className="border-border flex flex-col gap-4 border-b px-4 py-[18px]">
                <div className="flex flex-col gap-3">
                    {/* Theme color groups */}
                    {Object.entries(colorGroups).map(([groupName, colors]) => (<color_pallet_group_1.BrandPalletGroup key={groupName} theme={theme} title={groupName} colors={colors} onRename={handleRename} onDelete={(colorName) => handleDelete(groupName, colorName)} onColorChange={handleColorChange} onColorChangeEnd={handleColorChangeEnd} onDuplicate={(colorName) => handleDuplicate(groupName, colorName)}/>))}
                </div>
                {isAddingNewGroup ? (<div className="flex flex-col gap-1">
                        <color_name_input_1.ColorNameInput initialName="" onSubmit={handleAddNewGroup} onCancel={() => setIsAddingNewGroup(false)}/>
                    </div>) : (<button_1.Button variant="ghost" className="text-muted-foreground hover:text-foreground bg-background-secondary hover:bg-background-secondary/70 h-10 w-full rounded-lg border border-white/5 text-sm" onClick={() => setIsAddingNewGroup(true)}>
                        Add a new group
                    </button_1.Button>)}
            </div>

            {/* Color Palette section */}
            <div className="border-border flex flex-col gap-4 border-b px-4 py-[18px]">
                <h3 className="mb-1 text-sm font-medium">Default Colors</h3>
                {Object.entries(colorDefaults).map(([colorName, colors]) => (<color_pallet_group_1.BrandPalletGroup key={colorName} theme={theme} title={colorName} colors={colors} onRename={handleRename} onDelete={(colorItem) => handleDelete(colorName, colorItem)} onColorChange={(groupName, colorIndex, newColor) => handleDefaultColorChange(colorName, colorIndex, newColor)} onColorChangeEnd={(groupName, colorIndex, newColor) => handleDefaultColorChange(colorName, colorIndex, newColor)} onDuplicate={(colorItem) => handleDuplicate(colorName, colorItem, true)} isDefaultPalette={true}/>))}
            </div>
        </div>);
});
exports.default = ColorPanel;
//# sourceMappingURL=index.js.map