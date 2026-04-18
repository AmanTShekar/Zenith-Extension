"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandPopoverPicker = void 0;
const Context_1 = require("@/components/Context");
const index_1 = require("@onlook/ui/icons/index");
const input_1 = require("@onlook/ui/input");
const popover_1 = require("@onlook/ui/popover");
const tabs_1 = require("@onlook/ui/tabs");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const _1 = require(".");
const ColorButton_1 = __importDefault(require("./ColorButton"));
const ColorPicker_1 = __importDefault(require("./ColorPicker"));
const ImagePicker_1 = __importDefault(require("./ImagePicker"));
var TabValue;
(function (TabValue) {
    TabValue["BRAND"] = "brand";
    TabValue["CUSTOM"] = "custom";
    TabValue["IMAGE"] = "image";
})(TabValue || (TabValue = {}));
const ColorGroup = ({ name, colors, onColorSelect, isDefault = false, isExpanded = false, }) => {
    const [expanded, setExpanded] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setExpanded(isExpanded);
    }, [isExpanded]);
    return (<div className="w-full group">
            <button aria-label={`Toggle ${expanded ? 'closed' : 'open'}`} className="rounded flex items-center p-1 w-full" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-1  flex-1">
                    <span className="text-xs font-normal capitalize">{(0, utility_1.toNormalCase)(name)}</span>
                    {isDefault && (<span className="ml-2 text-xs text-muted-foreground">Default</span>)}
                </div>
                {expanded ? <index_1.Icons.ChevronUp /> : <index_1.Icons.ChevronDown />}
            </button>

            {expanded &&
            colors.map((color) => (<div key={color.name} className="flex items-center gap-1.5 hover:bg-background-secondary rounded-md p-1 hover:cursor-pointer" onClick={() => onColorSelect(color)}>
                        <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: color.lightColor }}/>
                        <span className="text-xs font-normal truncate max-w-32">
                            {(0, utility_1.toNormalCase)(color.name)}
                        </span>
                    </div>))}
        </div>);
};
exports.BrandPopoverPicker = (0, react_1.memo)(({ color, onChange, onChangeEnd, backgroundImage, compoundStyle }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [isOpen, toggleOpen] = (0, react_1.useState)(false);
    const defaultValue = backgroundImage && !(0, _1.isBackgroundImageEmpty)(backgroundImage)
        ? TabValue.IMAGE
        : TabValue.BRAND;
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const inputRef = (0, react_1.useRef)(null);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setSearchQuery('');
        }
        if (e.key === 'Escape') {
            setSearchQuery('');
            inputRef.current?.blur();
        }
    };
    const filteredColorGroups = Object.entries(editorEngine.theme.colorGroups).filter(([name, colors]) => {
        const query = searchQuery.toLowerCase();
        return (name.toLowerCase().includes(query) ||
            colors.some((color) => color.name.toLowerCase().includes(query)));
    });
    const filteredColorDefaults = Object.entries(editorEngine.theme.colorDefaults).filter(([name, colors]) => {
        const query = searchQuery.toLowerCase();
        return (name.toLowerCase().includes(query) ||
            colors.some((color) => color.name.toLowerCase().includes(query)));
    });
    const handleColorSelect = (color) => {
        onChangeEnd?.(color);
    };
    (0, react_1.useEffect)(() => {
        if (isOpen && !editorEngine.history.isInTransaction) {
            editorEngine.history.startTransaction();
            return;
        }
        if (!isOpen && editorEngine.history.isInTransaction) {
            editorEngine.history.commitTransaction();
        }
        return () => editorEngine.history.commitTransaction();
    }, [isOpen]);
    return (<popover_1.Popover onOpenChange={(open) => toggleOpen(open)}>
                <popover_1.PopoverTrigger>
                    <ColorButton_1.default value={color} onClick={() => toggleOpen(!isOpen)}/>
                </popover_1.PopoverTrigger>
                <popover_1.PopoverContent className="backdrop-blur-lg z-10 rounded-lg p-0 shadow-xl overflow-hidden w-56" side="left" align="start">
                    <div>
                        <tabs_1.Tabs defaultValue={defaultValue} className="bg-transparent pb-0">
                            <tabs_1.TabsList className="bg-transparent px-2 m-0 gap-2">
                                <tabs_1.TabsTrigger value={TabValue.BRAND} className="bg-transparent text-xs p-1 hover:text-foreground-primary">
                                    Brand
                                </tabs_1.TabsTrigger>
                                <tabs_1.TabsTrigger value={TabValue.CUSTOM} className="bg-transparent text-xs p-1 hover:text-foreground-primary">
                                    Custom
                                </tabs_1.TabsTrigger>
                                <tabs_1.TabsTrigger value={TabValue.IMAGE} className="bg-transparent text-xs p-1 hover:text-foreground-primary">
                                    Image
                                </tabs_1.TabsTrigger>
                            </tabs_1.TabsList>
                            <tabs_1.TabsContent value={TabValue.BRAND} className="p-0 m-0 text-xs">
                                <div className="border-b border-t">
                                    <div className="relative">
                                        <index_1.Icons.MagnifyingGlass className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"/>
                                        <input_1.Input ref={inputRef} type="text" placeholder="Search colors" className="text-xs pl-7 pr-8 rounded-none border-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown}/>
                                        {searchQuery && (<button className="absolute right-[1px] top-[1px] bottom-[1px] aspect-square hover:bg-background-onlook active:bg-transparent flex items-center justify-center rounded-r-[calc(theme(borderRadius.md)-1px)] group" onClick={() => setSearchQuery('')}>
                                                <index_1.Icons.CrossS className="h-3 w-3 text-foreground-primary/50 group-hover:text-foreground-primary"/>
                                            </button>)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 overflow-y-auto max-h-96 p-2">
                                    {filteredColorGroups.map(([name, colors]) => (<ColorGroup key={name} name={name} colors={colors} onColorSelect={handleColorSelect} isExpanded={!!searchQuery}/>))}
                                    {filteredColorDefaults.map(([name, colors]) => (<ColorGroup key={name} name={name} colors={colors} onColorSelect={handleColorSelect} isDefault={true} isExpanded={!!searchQuery}/>))}
                                </div>
                            </tabs_1.TabsContent>
                            <tabs_1.TabsContent value={TabValue.CUSTOM} className="p-0 m-0">
                                <ColorPicker_1.default color={color} onChange={onChange} onChangeEnd={onChangeEnd}/>
                            </tabs_1.TabsContent>
                            <tabs_1.TabsContent value={TabValue.IMAGE} className="p-0 m-0">
                                <ImagePicker_1.default compoundStyle={compoundStyle} backgroundImage={backgroundImage}/>
                            </tabs_1.TabsContent>
                        </tabs_1.Tabs>
                    </div>
                </popover_1.PopoverContent>
            </popover_1.Popover>);
});
exports.BrandPopoverPicker.displayName = 'BrandPopoverPicker';
//# sourceMappingURL=ColorBrandPicker.js.map