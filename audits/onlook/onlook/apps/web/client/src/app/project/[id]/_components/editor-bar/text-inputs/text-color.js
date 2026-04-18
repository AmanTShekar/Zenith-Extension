"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextColor = void 0;
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const use_color_update_1 = require("../hooks/use-color-update");
const use_dropdown_manager_1 = require("../hooks/use-dropdown-manager");
const use_text_control_1 = require("../hooks/use-text-control");
const hover_tooltip_1 = require("../hover-tooltip");
const color_picker_1 = require("../inputs/color-picker");
const toolbar_button_1 = require("../toolbar-button");
exports.TextColor = (0, mobx_react_lite_1.observer)(() => {
    const { handleTextColorChange, textState } = (0, use_text_control_1.useTextControl)();
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'text-color-dropdown'
    });
    const { handleColorUpdate, handleColorUpdateEnd, tempColor } = (0, use_color_update_1.useColorUpdate)({
        elementStyleKey: 'color',
        onValueChange: (_, value) => handleTextColorChange(value),
        initialColor: textState.textColor,
    });
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
                <hover_tooltip_1.HoverOnlyTooltip content="Text Color" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <toolbar_button_1.ToolbarButton isOpen={isOpen} className="flex w-10 flex-col items-center justify-center gap-0.5">
                            <icons_1.Icons.TextColorSymbol className="h-3.5 w-3.5"/>
                            <div className="h-[4px] w-6 rounded-full bg-current" style={{ backgroundColor: textState.textColor || '#000000' }}/>
                        </toolbar_button_1.ToolbarButton>
                    </dropdown_menu_1.DropdownMenuTrigger>
                </hover_tooltip_1.HoverOnlyTooltip>
                <dropdown_menu_1.DropdownMenuContent align="start" side="bottom" className="w-[224px] mt-1 p-0 rounded-lg overflow-hidden shadow-xl backdrop-blur-lg">
                    <color_picker_1.ColorPickerContent color={tempColor} onChange={handleColorUpdate} onChangeEnd={handleColorUpdateEnd} hideGradient={true}/>
                </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=text-color.js.map