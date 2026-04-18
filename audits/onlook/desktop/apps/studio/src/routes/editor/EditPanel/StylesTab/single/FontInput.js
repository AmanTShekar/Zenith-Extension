"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontInput = void 0;
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const icons_1 = require("@onlook/ui/icons");
const popover_1 = require("@onlook/ui/popover");
const tooltip_1 = require("@onlook/ui/tooltip");
const utility_1 = require("@onlook/utility");
const react_tooltip_1 = require("@radix-ui/react-tooltip");
const lodash_1 = require("lodash");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
exports.FontInput = (0, mobx_react_lite_1.observer)(({ elementStyle, onValueChange, }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [value, setValue] = (0, react_1.useState)(elementStyle.defaultValue);
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (!editorEngine.style.selectedStyle) {
            return;
        }
        const newValue = elementStyle.getValue(editorEngine.style.selectedStyle?.styles);
        setValue((0, utility_1.convertFontString)(newValue));
    }, [editorEngine.style.selectedStyle]);
    const handleValueChange = (newValue) => {
        if (!newValue) {
            return;
        }
        setValue(newValue.id);
        editorEngine.style.updateFontFamily(elementStyle.key, newValue);
        onValueChange?.(elementStyle.key, newValue.id);
        setIsOpen(false);
    };
    const handleAddNewFont = () => {
        editorEngine.layersPanelTab = models_1.LayersPanelTabValue.BRAND;
        editorEngine.brandTab = models_1.BrandTabValue.FONTS;
        editorEngine.isLayersPanelLocked = true;
    };
    const selectedFont = (0, react_1.useMemo)(() => editorEngine.font.fonts?.find((val) => (0, lodash_1.camelCase)(val.family) === value), [value, editorEngine.font.fonts]);
    return (<popover_1.Popover open={isOpen} onOpenChange={setIsOpen}>
                <popover_1.PopoverTrigger asChild>
                    <button className="p-[6px] w-32 px-2 text-start rounded border-none text-xs text-active bg-background-onlook/75 appearance-none focus:outline-none focus:ring-0 flex items-center justify-between">
                        <tooltip_1.Tooltip>
                            <tooltip_1.TooltipTrigger asChild>
                                <span className="truncate" style={{ fontFamily: selectedFont?.family }}>
                                    {selectedFont?.family || 'Select font'}
                                </span>
                            </tooltip_1.TooltipTrigger>
                            <tooltip_1.TooltipPortal container={document.getElementById('style-panel')}>
                                <tooltip_1.TooltipContent side="right" align="center" sideOffset={10} className="animation-none max-w-[200px] shadow">
                                    <react_tooltip_1.TooltipArrow className="fill-foreground"/>
                                    <p className="break-words">
                                        {selectedFont?.family || 'Select font'}
                                    </p>
                                </tooltip_1.TooltipContent>
                            </tooltip_1.TooltipPortal>
                        </tooltip_1.Tooltip>
                        <icons_1.Icons.ChevronDown className="text-foreground-onlook"/>
                    </button>
                </popover_1.PopoverTrigger>
                <popover_1.PopoverContent className="backdrop-blur-lg z-10 rounded-lg p-0 shadow-xl overflow-hidden w-56" side="left" align="start">
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-border">
                            <h2 className="text-sm font-medium">Fonts</h2>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <icons_1.Icons.CrossL className="h-4 w-4"/>
                            </button>
                        </div>

                        {/* Font List */}
                        <div className="flex-1 overflow-hidden">
                            <div className="flex flex-col overflow-y-auto max-h-64 p-2">
                                {editorEngine.font.fonts.map((font) => (<button key={font.id} className="w-full text-start p-2 text-sm hover:bg-background-secondary rounded-md flex items-center justify-between group" style={{ fontFamily: font.family }} onClick={() => handleValueChange(font)}>
                                        <tooltip_1.Tooltip>
                                            <tooltip_1.TooltipTrigger asChild>
                                                <span className="truncate">{font.family}</span>
                                            </tooltip_1.TooltipTrigger>
                                            <tooltip_1.TooltipPortal container={document.getElementById('style-panel')}>
                                                <tooltip_1.TooltipContent side="left" align="center" sideOffset={20} className="animation-none max-w-[200px] shadow">
                                                    <react_tooltip_1.TooltipArrow className="fill-foreground"/>
                                                    <p className="break-words">{font.family}</p>
                                                </tooltip_1.TooltipContent>
                                            </tooltip_1.TooltipPortal>
                                        </tooltip_1.Tooltip>
                                        {selectedFont?.id === font.id && (<icons_1.Icons.Check className="h-4 w-4 text-foreground-active"/>)}
                                    </button>))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-2 border-t border-border">
                            <button onClick={handleAddNewFont} className="w-full p-2 text-sm text-center rounded-md bg-background-onlook hover:bg-background-secondary text-muted-foreground hover:text-foreground transition-colors">
                                Add a new font
                            </button>
                        </div>
                    </div>
                </popover_1.PopoverContent>
            </popover_1.Popover>);
});
//# sourceMappingURL=FontInput.js.map