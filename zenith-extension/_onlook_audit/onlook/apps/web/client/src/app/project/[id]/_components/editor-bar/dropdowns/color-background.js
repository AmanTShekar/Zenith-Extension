"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorBackground = void 0;
const editor_1 = require("@/components/store/editor");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const use_color_update_1 = require("../hooks/use-color-update");
const use_dropdown_manager_1 = require("../hooks/use-dropdown-manager");
const hover_tooltip_1 = require("../hover-tooltip");
const color_picker_1 = require("../inputs/color-picker");
const toolbar_button_1 = require("../toolbar-button");
const gradient_1 = require("../utils/gradient");
exports.ColorBackground = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const initialColor = editorEngine.style.selectedStyle?.styles.computed.backgroundColor;
    const backgroundImage = editorEngine.style.selectedStyle?.styles.computed.backgroundImage;
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'color-background-dropdown',
    });
    const { handleColorUpdate, handleColorUpdateEnd, tempColor } = (0, use_color_update_1.useColorUpdate)({
        elementStyleKey: 'backgroundColor',
        initialColor: initialColor,
    });
    const colorHex = (0, react_1.useMemo)(() => tempColor?.toHex(), [tempColor]);
    const previewStyle = (0, react_1.useMemo)(() => {
        if ((0, gradient_1.hasGradient)(backgroundImage)) {
            return { background: backgroundImage };
        }
        return { backgroundColor: colorHex };
    }, [backgroundImage, colorHex]);
    return (<div className="flex flex-col gap-2">
            <dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
                <hover_tooltip_1.HoverOnlyTooltip content="Background Color" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <toolbar_button_1.ToolbarButton isOpen={isOpen} className="flex w-10 flex-col items-center justify-center gap-0.5">
                            <icons_1.Icons.PaintBucket className="h-2 w-2"/>
                            <div className="h-[4px] w-6 rounded-full border-[0.5px] border-border" style={previewStyle}/>
                        </toolbar_button_1.ToolbarButton>
                    </dropdown_menu_1.DropdownMenuTrigger>
                </hover_tooltip_1.HoverOnlyTooltip>
                <dropdown_menu_1.DropdownMenuContent align="start" side="bottom" className="w-[224px] mt-1 p-0 rounded-lg overflow-hidden shadow-xl backdrop-blur-lg">
                    <color_picker_1.ColorPickerContent color={tempColor} onChange={handleColorUpdate} onChangeEnd={handleColorUpdateEnd} backgroundImage={backgroundImage}/>
                </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
        </div>);
});
//# sourceMappingURL=color-background.js.map