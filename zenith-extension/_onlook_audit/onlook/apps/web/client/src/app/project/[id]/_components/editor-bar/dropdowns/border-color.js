"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorderColor = void 0;
const editor_1 = require("@/components/store/editor");
const toolbar_button_1 = require("../toolbar-button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const use_box_control_1 = require("../hooks/use-box-control");
const use_color_update_1 = require("../hooks/use-color-update");
const use_dropdown_manager_1 = require("../hooks/use-dropdown-manager");
const hover_tooltip_1 = require("../hover-tooltip");
const color_picker_1 = require("../inputs/color-picker");
exports.BorderColor = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { borderExists } = (0, use_box_control_1.useBoxControl)('border');
    const initialColor = editorEngine.style.selectedStyle?.styles.computed.borderColor;
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'border-color-dropdown',
    });
    const { handleColorUpdate, handleColorUpdateEnd, tempColor } = (0, use_color_update_1.useColorUpdate)({
        elementStyleKey: 'borderColor',
        initialColor: initialColor,
    });
    const colorHex = (0, react_1.useMemo)(() => tempColor?.toHex(), [tempColor]);
    if (!borderExists) {
        return null;
    }
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <hover_tooltip_1.HoverOnlyTooltip content="Border Color" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <toolbar_button_1.ToolbarButton isOpen={isOpen} className="flex min-w-9 flex-col items-center justify-center gap-0.5">
                        <icons_1.Icons.PencilIcon className="h-4 w-4 min-h-4 min-w-4"/>
                        <div className="w-6 rounded-full bg-current border-[0.5px] border-border" style={{ backgroundColor: colorHex, height: '4px' }}/>
                    </toolbar_button_1.ToolbarButton>
                </dropdown_menu_1.DropdownMenuTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent align="start" side="bottom" className="w-[224px] mt-1 p-0 rounded-lg overflow-hidden shadow-xl backdrop-blur-lg">
                <color_picker_1.ColorPickerContent color={tempColor} onChange={handleColorUpdate} onChangeEnd={handleColorUpdateEnd}/>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=border-color.js.map