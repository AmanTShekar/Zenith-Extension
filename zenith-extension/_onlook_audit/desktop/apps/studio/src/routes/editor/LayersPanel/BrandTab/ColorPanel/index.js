"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const assets_1 = require("@onlook/models/assets");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const ColorPalletGroup_1 = require("./ColorPalletGroup");
const ColorNameInput_1 = require("./ColorNameInput");
const ColorPanel = (0, mobx_react_lite_1.observer)(() => {
    const [theme, setTheme] = (0, react_1.useState)(assets_1.Theme.LIGHT);
    const [isAddingNewGroup, setIsAddingNewGroup] = (0, react_1.useState)(false);
    const editorEngine = (0, Context_1.useEditorEngine)();
    const themeManager = editorEngine.theme;
    const { colorGroups, colorDefaults } = themeManager;
    (0, react_1.useEffect)(() => {
        themeManager.scanConfig();
    }, []);
    const handleRename = (groupName, newName) => {
        themeManager.rename(groupName, newName);
    };
    const handleDelete = (groupName, colorName) => {
        themeManager.delete(groupName, colorName);
    };
    const handleColorChange = (groupName, index, newColor, newName, parentName) => {
        themeManager.update(groupName, index, newColor, newName, parentName, theme, false);
    };
    const handleColorChangeEnd = (groupName, index, newColor, newName, parentName) => {
        themeManager.update(groupName, index, newColor, newName, parentName, theme, true);
    };
    const handleDuplicate = (groupName, colorName, isDefaultPalette) => {
        themeManager.duplicate(groupName, colorName, isDefaultPalette, theme);
    };
    const handleAddNewGroup = (newName) => {
        themeManager.add(newName);
        setIsAddingNewGroup(false);
    };
    const handleDefaultColorChange = (groupName, colorIndex, newColor) => {
        themeManager.handleDefaultColorChange(groupName, colorIndex, newColor, theme);
    };
    const handleClose = () => {
        editorEngine.brandTab = null;
    };
    return (<div className="flex flex-col h-full text-xs text-active flex-grow w-full p-0 overflow-y-auto">
            <div className="flex justify-between items-center pl-4 pr-2.5 py-1.5 border-b border-border fixed top-0 left-0 right-0 bg-background z-10">
                <h2 className="text-sm font-normal text-foreground">Brand Colors</h2>
                <button_1.Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-background-secondary" onClick={handleClose}>
                    <icons_1.Icons.CrossS className="h-4 w-4"/>
                </button_1.Button>
            </div>
            {/* Theme Toggle */}
            <div className="flex gap-2 px-4 py-3 border-b border-border mt-[2.5rem]">
                <button_1.Button variant={theme === assets_1.Theme.LIGHT ? 'default' : 'outline'} className={(0, utils_1.cn)('flex-1 gap-2 px-0 w-full border-none text-gray-200 bg-transparent hover:bg-background-secondary shadow-none', theme === assets_1.Theme.LIGHT && 'bg-gray-900 text-white')} onClick={() => setTheme(assets_1.Theme.LIGHT)}>
                    <icons_1.Icons.Sun className="h-4 w-4"/>
                    Light mode
                </button_1.Button>
                <button_1.Button variant={theme === assets_1.Theme.DARK ? 'default' : 'outline'} className={(0, utils_1.cn)('flex-1 gap-2 px-0 w-full border-none text-gray-200 bg-transparent hover:bg-background-secondary shadow-none', theme === assets_1.Theme.DARK && 'bg-gray-900 text-white')} onClick={() => setTheme(assets_1.Theme.DARK)}>
                    <icons_1.Icons.Moon className="h-4 w-4"/>
                    Dark mode
                </button_1.Button>
            </div>

            {/* Brand Palette Groups section */}
            <div className="flex flex-col gap-4 px-4 py-[18px] border-b border-border">
                <div className="flex flex-col gap-3">
                    {/* Theme color groups */}
                    {Object.entries(colorGroups).map(([groupName, colors]) => (<ColorPalletGroup_1.BrandPalletGroup key={groupName} theme={theme} title={groupName} colors={colors} onRename={handleRename} onDelete={(colorName) => handleDelete(groupName, colorName)} onColorChange={handleColorChange} onColorChangeEnd={handleColorChangeEnd} onDuplicate={(colorName) => handleDuplicate(groupName, colorName)}/>))}
                </div>
                {isAddingNewGroup ? (<div className="flex flex-col gap-1">
                        <ColorNameInput_1.ColorNameInput initialName="" onSubmit={handleAddNewGroup} onCancel={() => setIsAddingNewGroup(false)}/>
                    </div>) : (<button_1.Button variant="ghost" className="w-full h-10 text-sm text-muted-foreground hover:text-foreground bg-background-secondary hover:bg-background-secondary/70 rounded-lg border border-white/5" onClick={() => setIsAddingNewGroup(true)}>
                        Add a new group
                    </button_1.Button>)}
            </div>

            {/* Color Palette section */}
            <div className="flex flex-col gap-4 px-4 py-[18px] border-b border-border">
                <h3 className="text-sm font-medium mb-1">Default Colors</h3>
                {Object.entries(colorDefaults).map(([colorName, colors]) => (<ColorPalletGroup_1.BrandPalletGroup key={colorName} theme={theme} title={colorName} colors={colors} onRename={handleRename} onDelete={(colorItem) => handleDelete(colorName, colorItem)} onColorChange={(groupName, colorIndex, newColor) => handleDefaultColorChange(colorName, colorIndex, newColor)} onColorChangeEnd={(groupName, colorIndex, newColor) => handleDefaultColorChange(colorName, colorIndex, newColor)} onDuplicate={(colorItem) => handleDuplicate(colorName, colorItem, true)} isDefaultPalette={true}/>))}
            </div>
        </div>);
});
exports.default = ColorPanel;
//# sourceMappingURL=index.js.map