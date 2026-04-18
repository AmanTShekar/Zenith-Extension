"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorPickerContent = void 0;
const editor_1 = require("@/components/store/editor");
const assets_1 = require("@onlook/models/assets");
const color_picker_1 = require("@onlook/ui/color-picker");
const Gradient_1 = require("@onlook/ui/color-picker/Gradient");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const separator_1 = require("@onlook/ui/separator");
const tabs_1 = require("@onlook/ui/tabs");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const use_gradient_update_1 = require("../hooks/use-gradient-update");
const hover_tooltip_1 = require("../hover-tooltip");
const gradient_1 = require("../utils/gradient");
const ColorGroup = ({ name, colors, onColorSelect, isDefault = false, isExpanded = true, selectedColor, }) => {
    const [expanded, setExpanded] = (0, react_1.useState)(true);
    const selectedRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        setExpanded(isExpanded);
    }, [isExpanded]);
    (0, react_1.useEffect)(() => {
        if (selectedRef.current) {
            selectedRef.current.scrollIntoView({ block: 'center' });
        }
    }, [expanded]);
    return (<div className="w-full group">
            <button aria-label={`Toggle ${expanded ? 'closed' : 'open'}`} className="sticky top-0 z-10 bg-background rounded flex items-center p-1 w-full" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-1 flex-1">
                    <span className="text-xs font-normal capitalize">{(0, utility_1.toNormalCase)(name)}</span>
                    {isDefault && (<span className="ml-2 text-xs text-muted-foreground">Default</span>)}
                </div>
                {expanded ? <icons_1.Icons.ChevronUp /> : <icons_1.Icons.ChevronDown />}
            </button>

            {expanded &&
            colors.map((color) => {
                const isSelected = selectedColor && utility_1.Color.from(color.lightColor).isEqual(selectedColor);
                return (<div key={color.name} ref={isSelected ? selectedRef : undefined} className={`flex items-center gap-1.5 rounded-md p-1 hover:bg-background-secondary hover:cursor-pointer 
                                ${isSelected ? 'bg-background-tertiary' : ''}`} onClick={() => onColorSelect(color)}>
                            <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: color.lightColor }}/>
                            <span className="text-xs font-normal truncate max-w-32">
                                {(0, utility_1.toNormalCase)(color.name)}
                            </span>
                            {isSelected && (<icons_1.Icons.CheckCircled className="ml-auto text-primary w-4 h-4"/>)}
                        </div>);
            })}
        </div>);
};
var TabValue;
(function (TabValue) {
    TabValue["BRAND"] = "brand";
    TabValue["CUSTOM"] = "custom";
    TabValue["GRADIENT"] = "gradient";
})(TabValue || (TabValue = {}));
const ColorPickerContent = ({ color, onChange, onChangeEnd, backgroundImage, isCreatingNewColor, hideGradient = false, }) => {
    const [viewMode, setViewMode] = (0, react_1.useState)('grid');
    const [palette, setPalette] = (0, react_1.useState)(color.palette);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const inputRef = (0, react_1.useRef)(null);
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [colorGroups, setColorGroups] = (0, react_1.useState)({});
    const [colorDefaults, setColorDefaults] = (0, react_1.useState)({});
    const [theme] = (0, react_1.useState)(assets_1.SystemTheme.LIGHT);
    const { handleGradientUpdateEnd } = (0, use_gradient_update_1.useGradientUpdate)();
    const [gradientState, setGradientState] = (0, react_1.useState)({
        type: 'linear',
        angle: 90,
        stops: [
            { id: 'stop-1', color: '#ff6b6b', position: 0, opacity: 100 },
            { id: 'stop-2', color: '#feca57', position: 100, opacity: 100 },
        ],
    });
    const [selectedStopId, setSelectedStopId] = (0, react_1.useState)('stop-1');
    const [activeTab, setActiveTab] = (0, react_1.useState)(isCreatingNewColor ? TabValue.CUSTOM : TabValue.BRAND);
    const isColorRemoved = (colorToCheck) => colorToCheck.isEqual(utility_1.Color.from('transparent'));
    const presetGradients = [
        {
            id: 'sunset',
            css: 'linear-gradient(45deg, #ff6b6b, #feca57)',
            type: 'linear',
            stops: [
                { id: '1', color: '#ff6b6b', position: 0, opacity: 100 },
                { id: '2', color: '#feca57', position: 100, opacity: 100 },
            ],
        },
        {
            id: 'ocean',
            css: 'linear-gradient(45deg, #48cae4, #023e8a)',
            type: 'linear',
            stops: [
                { id: '1', color: '#48cae4', position: 0, opacity: 100 },
                { id: '2', color: '#023e8a', position: 100, opacity: 100 },
            ],
        },
        {
            id: 'purple-pink',
            css: 'linear-gradient(45deg, #f72585, #b5179e)',
            type: 'linear',
            stops: [
                { id: '1', color: '#f72585', position: 0, opacity: 100 },
                { id: '2', color: '#b5179e', position: 100, opacity: 100 },
            ],
        },
        {
            id: 'blue-purple',
            css: 'linear-gradient(90deg, #667eea, #764ba2)',
            type: 'linear',
            stops: [
                { id: '1', color: '#667eea', position: 0, opacity: 100 },
                { id: '2', color: '#764ba2', position: 100, opacity: 100 },
            ],
        },
        {
            id: 'pink-red',
            css: 'linear-gradient(135deg, #f093fb, #f5576c)',
            type: 'linear',
            stops: [
                { id: '1', color: '#f093fb', position: 0, opacity: 100 },
                { id: '2', color: '#f5576c', position: 100, opacity: 100 },
            ],
        },
        {
            id: 'cyan-blue',
            css: 'linear-gradient(180deg, #4facfe, #00f2fe)',
            type: 'linear',
            stops: [
                { id: '1', color: '#4facfe', position: 0, opacity: 100 },
                { id: '2', color: '#00f2fe', position: 100, opacity: 100 },
            ],
        },
        {
            id: 'angular-sunset',
            css: 'conic-gradient(from 0deg, #ff9a9e, #fecfef, #fecfef)',
            type: 'angular',
            stops: [
                { id: '1', color: '#ff9a9e', position: 0, opacity: 100 },
                { id: '2', color: '#fecfef', position: 50, opacity: 100 },
                { id: '3', color: '#fecfef', position: 100, opacity: 100 },
            ],
        },
        {
            id: 'diamond-mint',
            css: 'radial-gradient(ellipse 80% 80% at center, #a8edea, #fed6e3)',
            type: 'diamond',
            stops: [
                { id: '1', color: '#a8edea', position: 0, opacity: 100 },
                { id: '2', color: '#fed6e3', position: 100, opacity: 100 },
            ],
        },
        {
            id: 'radial-sunset',
            css: 'radial-gradient(circle, #ff6b6b, #feca57)',
            type: 'radial',
            stops: [
                { id: '1', color: '#ff6b6b', position: 0, opacity: 100 },
                { id: '2', color: '#feca57', position: 100, opacity: 100 },
            ],
        },
        {
            id: 'conic-rainbow',
            css: 'conic-gradient(from 0deg, #ff6b6b, #feca57, #48cae4, #ff6b6b)',
            type: 'conic',
            stops: [
                { id: '1', color: '#ff6b6b', position: 0, opacity: 100 },
                { id: '2', color: '#feca57', position: 33, opacity: 100 },
                { id: '3', color: '#48cae4', position: 66, opacity: 100 },
                { id: '4', color: '#ff6b6b', position: 100, opacity: 100 },
            ],
        },
        {
            id: 'green-teal',
            css: 'linear-gradient(45deg, #11998e, #38ef7d)',
            type: 'linear',
            stops: [
                { id: '1', color: '#11998e', position: 0 },
                { id: '2', color: '#38ef7d', position: 100 },
            ],
        },
        {
            id: 'purple-deep',
            css: 'linear-gradient(90deg, #8360c3, #2ebf91)',
            type: 'linear',
            stops: [
                { id: '1', color: '#8360c3', position: 0 },
                { id: '2', color: '#2ebf91', position: 100 },
            ],
        },
        {
            id: 'orange-coral',
            css: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
            type: 'linear',
            stops: [
                { id: '1', color: '#ff9a9e', position: 0 },
                { id: '2', color: '#fecfef', position: 100 },
            ],
        },
        {
            id: 'blue-sky',
            css: 'linear-gradient(45deg, #74b9ff, #0984e3)',
            type: 'linear',
            stops: [
                { id: '1', color: '#74b9ff', position: 0 },
                { id: '2', color: '#0984e3', position: 100 },
            ],
        },
        {
            id: 'mint-fresh',
            css: 'linear-gradient(90deg, #a8edea, #fed6e3)',
            type: 'linear',
            stops: [
                { id: '1', color: '#a8edea', position: 0 },
                { id: '2', color: '#fed6e3', position: 100 },
            ],
        },
        {
            id: 'warm-flame',
            css: 'linear-gradient(135deg, #ff9a9e, #fad0c4)',
            type: 'linear',
            stops: [
                { id: '1', color: '#ff9a9e', position: 0 },
                { id: '2', color: '#fad0c4', position: 100 },
            ],
        },
        {
            id: 'night-fade',
            css: 'linear-gradient(180deg, #a18cd1, #fbc2eb)',
            type: 'linear',
            stops: [
                { id: '1', color: '#a18cd1', position: 0 },
                { id: '2', color: '#fbc2eb', position: 100 },
            ],
        },
        {
            id: 'spring-warmth',
            css: 'linear-gradient(45deg, #fad0c4, #ffd1ff)',
            type: 'linear',
            stops: [
                { id: '1', color: '#fad0c4', position: 0 },
                { id: '2', color: '#ffd1ff', position: 100 },
            ],
        },
        {
            id: 'juicy-peach',
            css: 'linear-gradient(90deg, #ffecd2, #fcb69f)',
            type: 'linear',
            stops: [
                { id: '1', color: '#ffecd2', position: 0 },
                { id: '2', color: '#fcb69f', position: 100 },
            ],
        },
        {
            id: 'young-passion',
            css: 'linear-gradient(135deg, #ff8177, #ff867a)',
            type: 'linear',
            stops: [
                { id: '1', color: '#ff8177', position: 0 },
                { id: '2', color: '#ff867a', position: 100 },
            ],
        },
        {
            id: 'lady-lips',
            css: 'linear-gradient(180deg, #ff9a9e, #f687b3)',
            type: 'linear',
            stops: [
                { id: '1', color: '#ff9a9e', position: 0 },
                { id: '2', color: '#f687b3', position: 100 },
            ],
        },
    ];
    (0, react_1.useEffect)(() => {
        setPalette(color.palette);
    }, [color]);
    (0, react_1.useEffect)(() => {
        const selectedElement = editorEngine.elements.selected[0];
        const computedBackgroundImage = selectedElement
            ? editorEngine.style.selectedStyle?.styles.computed.backgroundImage
            : undefined;
        const activeGradientSource = computedBackgroundImage ?? backgroundImage;
        if ((0, gradient_1.hasGradient)(activeGradientSource)) {
            const parsed = (0, Gradient_1.parseGradientFromCSS)(activeGradientSource);
            if (parsed && parsed.stops.length > 0) {
                setGradientState(parsed);
                setActiveTab(TabValue.GRADIENT);
                const firstStop = parsed.stops[0];
                if (firstStop) {
                    setSelectedStopId(firstStop.id);
                    onChange(utility_1.Color.from(firstStop.color));
                }
            }
            else {
                setActiveTab(TabValue.GRADIENT);
            }
        }
        else if (selectedElement) {
            const defaultGradient = {
                type: 'linear',
                angle: 90,
                stops: [
                    { id: 'stop-1', color: '#ff6b6b', position: 0, opacity: 100 },
                    { id: 'stop-2', color: '#feca57', position: 100, opacity: 100 },
                ],
            };
            setGradientState(defaultGradient);
            setSelectedStopId('stop-1');
        }
    }, [editorEngine.elements.selected, editorEngine.style.selectedStyle?.styles.computed.backgroundImage, backgroundImage, Gradient_1.parseGradientFromCSS, onChange]);
    (0, react_1.useEffect)(() => {
        (async () => {
            try {
                await editorEngine.theme.scanConfig();
                setColorGroups(editorEngine.theme.colorGroups);
                setColorDefaults(editorEngine.theme.colorDefaults);
            }
            catch (error) {
                console.error('Failed to scan fonts:', error);
            }
        })();
    }, []);
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
    const filteredColorGroups = Object.entries(colorGroups).filter(([name, colors]) => {
        const query = searchQuery.toLowerCase();
        return (name.toLowerCase().includes(query) ||
            colors.some((color) => color.name.toLowerCase().includes(query)));
    });
    const filteredColorDefaults = Object.entries(colorDefaults).filter(([name, colors]) => {
        const query = searchQuery.toLowerCase();
        return (name.toLowerCase().includes(query) ||
            colors.some((color) => color.name.toLowerCase().includes(query)));
    });
    const handleColorSelect = (colorItem) => {
        if ((0, gradient_1.hasGradient)(backgroundImage)) {
            editorEngine.style.update('backgroundImage', 'none');
        }
        onChangeEnd(colorItem);
    };
    const handleRemoveColor = () => {
        if ((0, gradient_1.hasGradient)(backgroundImage)) {
            editorEngine.style.update('backgroundImage', 'none');
            return;
        }
        const removeColorAction = {
            name: 'remove',
            originalKey: '',
            lightColor: '',
            darkColor: '',
        };
        onChangeEnd(removeColorAction);
    };
    const handleGradientChange = (0, react_1.useCallback)((newGradient) => {
        setGradientState(newGradient);
        setActiveTab(TabValue.GRADIENT);
        handleGradientUpdateEnd(newGradient);
    }, [handleGradientUpdateEnd]);
    const handleStopColorChange = (0, react_1.useCallback)((stopId, newColor) => {
        try {
            const updatedGradient = {
                ...gradientState,
                stops: gradientState.stops.map((stop) => stop.id === stopId ? { ...stop, color: newColor.toHex() } : stop),
            };
            setGradientState(updatedGradient);
            handleGradientChange(updatedGradient);
        }
        catch (error) {
            console.error('Error updating stop color:', error);
        }
    }, [gradientState, handleGradientChange]);
    const handleStopSelect = (0, react_1.useCallback)((stopId) => {
        setSelectedStopId(stopId);
        setActiveTab(TabValue.GRADIENT);
        const selectedStop = gradientState.stops.find((s) => s.id === stopId);
        if (selectedStop) {
            const stopColor = utility_1.Color.from(selectedStop.color);
            onChange(stopColor);
        }
    }, [gradientState.stops, onChange]);
    const applyPresetGradient = (0, react_1.useCallback)((preset) => {
        try {
            let angle = 0;
            if (preset.type === 'linear') {
                angle = parseInt((/(\d+)deg/.exec(preset.css))?.[1] ?? '90');
            }
            const newGradientState = {
                type: preset.type,
                angle: angle,
                stops: preset.stops.map((stop, index) => ({
                    id: `stop-${index + 1}`,
                    color: stop.color,
                    position: stop.position,
                    opacity: stop.opacity ?? 100,
                })),
            };
            setGradientState(newGradientState);
            setSelectedStopId('stop-1');
            handleGradientChange(newGradientState);
            const firstStop = newGradientState.stops[0];
            if (firstStop) {
                onChange(utility_1.Color.from(firstStop.color));
            }
        }
        catch (error) {
            console.error('Error applying preset gradient:', error);
        }
    }, [handleGradientChange, onChange]);
    function renderPalette() {
        const colors = Object.keys(palette.colors);
        return (<div className="px-0.5 py-1">
                {viewMode === 'grid' ? (<div className="grid grid-cols-7 gap-1.5 p-1 text-center justify-between">
                        {colors.map((level) => (<div key={level} className="w-6 h-6 content-center cursor-pointer rounded border-[0.5px] border-foreground-tertiary/50" style={{ backgroundColor: palette.colors[Number.parseInt(level)] }} onClick={() => {
                        if ((0, gradient_1.hasGradient)(backgroundImage)) {
                            editorEngine.style.update('backgroundImage', 'none');
                        }
                        onChangeEnd(utility_1.Color.from(palette.colors[Number.parseInt(level)] ?? '#000000'));
                    }}/>))}
                    </div>) : (<div className="flex flex-col">
                        {colors.map((level) => (<div className="gap-2 hover:bg-background-secondary p-1 flex align-center cursor-pointer rounded-md group" key={level} onClick={() => {
                        if ((0, gradient_1.hasGradient)(backgroundImage)) {
                            editorEngine.style.update('backgroundImage', 'none');
                        }
                        onChangeEnd(utility_1.Color.from(palette.colors[Number.parseInt(level)] ?? '#000000'));
                    }}>
                                <div key={level} className="w-5 h-5 content-center rounded border-[0.5px] border-foreground-tertiary/50" style={{
                        backgroundColor: palette.colors[Number.parseInt(level)],
                    }}/>
                                <div className="text-small text-foreground-secondary group-hover:text-foreground-primary">
                                    <span>
                                        {palette.name}-{level}
                                    </span>
                                </div>
                            </div>))}
                    </div>)}
            </div>);
    }
    function renderPresets() {
        return (<div className="px-0.5 py-1">
                {viewMode === 'grid' ? (<div className="grid grid-cols-7 gap-1.5 p-1 text-center justify-between">
                        {presetGradients.map((preset) => (<div key={preset.id} className="w-6 h-6 content-center cursor-pointer rounded border-[0.5px] border-foreground-tertiary/50" style={{ background: preset.css }} onClick={() => applyPresetGradient(preset)}/>))}
                    </div>) : (<div className="flex flex-col">
                        {presetGradients.map((preset) => (<div className="gap-2 hover:bg-background-secondary p-1 flex align-center cursor-pointer rounded-md group" key={preset.id} onClick={() => applyPresetGradient(preset)}>
                                <div key={preset.id} className="w-5 h-5 content-center rounded border-[0.5px] border-foreground-tertiary/50" style={{ background: preset.css }}/>
                                <div className="text-small text-foreground-secondary group-hover:text-foreground-primary">
                                    <span>{preset.id}</span>
                                </div>
                            </div>))}
                    </div>)}
            </div>);
    }
    return (<div className="flex flex-col justify-between items-center">
            <tabs_1.Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
                {!isCreatingNewColor && (<tabs_1.TabsList className="bg-transparent px-2 m-0 gap-2 justify-between w-full">
                        <div className="flex gap-1">
                            <tabs_1.TabsTrigger value={TabValue.BRAND} className="flex items-center justify-center px-1.5 py-1 text-xs rounded-md bg-transparent hover:bg-background-secondary hover:text-foreground-primary transition-colors">
                                Brand
                            </tabs_1.TabsTrigger>

                            <tabs_1.TabsTrigger value={TabValue.CUSTOM} className="flex items-center justify-center px-1.5 py-1 text-xs rounded-md bg-transparent hover:bg-background-secondary hover:text-foreground-primary transition-colors">
                                Custom
                            </tabs_1.TabsTrigger>
                            {!hideGradient && (<tabs_1.TabsTrigger value={TabValue.GRADIENT} className="flex items-center justify-center px-1.5 py-1 text-xs rounded-md bg-transparent hover:bg-background-secondary hover:text-foreground-primary transition-colors">
                                    Gradient
                                </tabs_1.TabsTrigger>)}
                        </div>
                        {!isCreatingNewColor && (<hover_tooltip_1.HoverOnlyTooltip content="Remove Color" side="bottom" className="mt-1" hideArrow disabled={isColorRemoved(color)}>
                                <button className={(0, utils_1.cn)('p-1 rounded transition-colors', isColorRemoved(color)
                    ? 'bg-background-secondary'
                    : 'hover:bg-background-tertiary')} onClick={handleRemoveColor}>
                                    <icons_1.Icons.SquareX className={(0, utils_1.cn)('h-4 w-4', isColorRemoved(color)
                    ? 'text-foreground-primary'
                    : 'text-foreground-tertiary')}/>
                                </button>
                            </hover_tooltip_1.HoverOnlyTooltip>)}
                    </tabs_1.TabsList>)}

                {!isCreatingNewColor && (<tabs_1.TabsContent value={TabValue.BRAND} className="p-0 m-0 text-xs">
                        <div className="border-b border-t">
                            <div className="relative">
                                <icons_1.Icons.MagnifyingGlass className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"/>
                                <input_1.Input ref={inputRef} type="text" placeholder="Search colors" className="text-xs pl-7 pr-8 rounded-none border-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown}/>
                                {searchQuery && (<button className="absolute right-[1px] top-[1px] bottom-[1px] aspect-square hover:bg-background-onlook active:bg-transparent flex items-center justify-center rounded-r-[calc(theme(borderRadius.md)-1px)] group" onClick={() => setSearchQuery('')}>
                                        <icons_1.Icons.CrossS className="h-3 w-3 text-foreground-primary/50 group-hover:text-foreground-primary"/>
                                    </button>)}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 overflow-y-auto max-h-96 px-2 mt-2">
                            {filteredColorGroups.map(([name, colors]) => (<ColorGroup key={name} name={name} colors={colors} onColorSelect={handleColorSelect} selectedColor={color}/>))}
                            {filteredColorDefaults.map(([name, colors]) => (<ColorGroup key={name} name={name} colors={colors} onColorSelect={handleColorSelect} isDefault selectedColor={color}/>))}
                        </div>
                    </tabs_1.TabsContent>)}

                <tabs_1.TabsContent value={TabValue.CUSTOM} className="p-0 m-0">
                    <color_picker_1.ColorPicker color={color} onChange={onChange} onChangeEnd={(val) => {
            if ((0, gradient_1.hasGradient)(backgroundImage)) {
                editorEngine.style.update('backgroundImage', 'none');
            }
            onChangeEnd?.(val);
            setPalette(val.palette);
        }}/>
                    <separator_1.Separator />
                    <div className="flex flex-row items-center justify-between w-full px-2 py-1">
                        <span className="text-foreground-secondary text-small">{palette.name}</span>
                        <button aria-label={`Toggle ${viewMode === 'grid' ? 'list' : 'grid'} mode`} className="text-foreground-tertiary hover:text-foreground-hover rounded" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                            {viewMode === 'grid' ? (<icons_1.Icons.ViewGrid className="w-3 h-3"/>) : (<icons_1.Icons.ViewHorizontal className="w-3 h-3"/>)}
                        </button>
                    </div>
                    <separator_1.Separator />
                    <div className="h-28 px-1 overflow-hidden overflow-y-auto">
                        {renderPalette()}
                    </div>
                </tabs_1.TabsContent>
                {!isCreatingNewColor && (<tabs_1.TabsContent value={TabValue.GRADIENT} className="p-0 m-0">
                        <color_picker_1.Gradient gradient={gradientState} onGradientChange={handleGradientChange} onStopColorChange={handleStopColorChange} onStopSelect={handleStopSelect} selectedStopId={selectedStopId} className="border-b border-border" showPresets={false}/>

                        <div className="flex flex-row items-center justify-between w-full px-2 py-1">
                            <span className="text-foreground-secondary text-small">Presets</span>
                            <button className={`px-1 py-1 text-xs transition-colors w-6 h-6 flex items-center justify-center rounded ${viewMode === 'grid'
                ? 'text-foreground-secondary hover:text-foreground-primary hover:bg-background-hover'
                : 'text-foreground-primary bg-background-secondary'}`} onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} title="Toggle view mode">
                                {viewMode === 'grid' ? (<icons_1.Icons.ViewGrid className="w-3 h-3"/>) : (<icons_1.Icons.ViewHorizontal className="w-3 h-3"/>)}
                            </button>
                        </div>
                        <separator_1.Separator />
                        <div className="h-28 px-1 overflow-hidden overflow-y-auto">
                            {renderPresets()}
                        </div>
                    </tabs_1.TabsContent>)}
            </tabs_1.Tabs>
        </div>);
};
exports.ColorPickerContent = ColorPickerContent;
//# sourceMappingURL=color-picker.js.map