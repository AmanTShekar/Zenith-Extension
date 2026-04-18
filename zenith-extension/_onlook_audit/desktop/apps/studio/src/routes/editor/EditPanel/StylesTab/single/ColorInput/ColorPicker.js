"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const color_picker_1 = require("@onlook/ui/color-picker");
const icons_1 = require("@onlook/ui/icons");
const popover_1 = require("@onlook/ui/popover");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const ColorPickerContent = ({ color, onChange, onChangeEnd }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [viewMode, setViewMode] = (0, react_1.useState)('grid');
    const [palette, setPalette] = (0, react_1.useState)(color.palette);
    (0, react_1.useEffect)(() => {
        setPalette(color.palette);
    }, [color]);
    function renderPalette() {
        const colors = Object.keys(palette.colors);
        return (<div className="px-0.5 py-1.5">
                {viewMode === 'grid' ? (<div className="grid grid-cols-7 gap-1.5 p-1 text-center justify-between">
                        {colors.map((level) => (<div key={level} className="w-6 h-6 content-center cursor-pointer rounded border-[0.5px] border-foreground-tertiary/50" style={{ backgroundColor: palette.colors[Number.parseInt(level)] }} onClick={() => onChangeEnd(utility_1.Color.from(palette.colors[Number.parseInt(level)]))}>
                                {/* Commenting out so that we can use this for tooltips over these grid elements */}
                                {/* <p
                        className={cn(
                            'text-xs text-white drop-shadow-lg',
                            parseInt(level) < 500 ? 'invert' : '',
                        )}
                    > */}
                            </div>))}
                    </div>) : (<div className="flex flex-col">
                        {colors.map((level) => (<div className="gap-2 hover:bg-background-secondary p-1 flex align-center cursor-pointer rounded-md group" key={level} onClick={() => onChangeEnd(utility_1.Color.from(palette.colors[Number.parseInt(level)]))}>
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
    return (<div className="flex flex-col justify-between items-center">
            <color_picker_1.ColorPicker color={color} onMouseDown={() => editorEngine.history.startTransaction()} onChange={onChange} onChangeEnd={(val) => {
            onChangeEnd?.(val);
            setPalette(val.palette);
        }}/>
            <popover_1.PopoverSeparator />
            <div className="flex flex-row items-center justify-between w-full px-2.5 py-1.5">
                <span className="text-foreground-secondary text-smallPlus">{palette.name}</span>
                <button aria-label={`Toggle ${viewMode === 'grid' ? 'list' : 'grid'} mode`} className="text-foreground-tertiary hover:text-foreground-hover rounded" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                    {viewMode === 'grid' ? (<icons_1.Icons.ViewGrid className="h-4 w-4"/>) : (<icons_1.Icons.ViewHorizontal className="h-4 w-4"/>)}
                </button>
            </div>
            <popover_1.PopoverSeparator />
            <popover_1.PopoverScrollArea className="h-28 px-1 overflow-hidden overflow-y-auto">
                {renderPalette()}
            </popover_1.PopoverScrollArea>
        </div>);
};
exports.default = ColorPickerContent;
//# sourceMappingURL=ColorPicker.js.map