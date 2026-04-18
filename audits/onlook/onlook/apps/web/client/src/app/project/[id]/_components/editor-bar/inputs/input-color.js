"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputColor = void 0;
const popover_1 = require("@onlook/ui/popover");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const color_picker_1 = require("./color-picker");
const use_color_update_1 = require("../hooks/use-color-update");
const InputColor = ({ color, elementStyleKey, onColorChange }) => {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const { handleColorUpdateEnd, handleColorUpdate, tempColor } = (0, use_color_update_1.useColorUpdate)({
        elementStyleKey,
        onValueChange: (_, value) => onColorChange?.(value),
        initialColor: color,
    });
    const handleInputChange = (0, react_1.useCallback)((e) => {
        const value = e.target.value;
        handleColorUpdateEnd(utility_1.Color.from(value));
        onColorChange?.(value);
    }, [onColorChange]);
    return (<div className="flex h-9 w-full items-center">
            <div className="bg-background-tertiary/50 mr-[1px] flex h-full flex-1 items-center rounded-l-md px-3 py-1.5 pl-1.5">
                <popover_1.Popover onOpenChange={setIsOpen}>
                    <popover_1.PopoverTrigger>
                        <div className="flex items-center">
                            <div className="mr-2 aspect-square h-5 w-5 rounded-sm" style={{ backgroundColor: tempColor.toHex() }} onClick={() => setIsOpen(!isOpen)}/>
                            <input type="text" value={tempColor.toHex6()} onChange={handleInputChange} className="h-full w-full bg-transparent text-sm text-white focus:outline-none"/>
                        </div>
                    </popover_1.PopoverTrigger>
                    <popover_1.PopoverContent className="w-[224px] overflow-hidden rounded-lg p-0 shadow-xl backdrop-blur-lg" side="left" align="start" alignOffset={-24}>
                        <color_picker_1.ColorPickerContent color={tempColor} onChange={handleColorUpdate} onChangeEnd={handleColorUpdateEnd}/>
                    </popover_1.PopoverContent>
                </popover_1.Popover>
            </div>
            <div className="text-xs text-white bg-background-tertiary/50 flex h-full items-center rounded-r-md px-3 py-1.5">
                {Math.round(tempColor.rgb.a * 100).toString()}%
            </div>
        </div>);
};
exports.InputColor = InputColor;
//# sourceMappingURL=input-color.js.map