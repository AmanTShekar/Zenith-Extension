"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedTypography = void 0;
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const use_text_control_1 = require("../hooks/use-text-control");
const use_dropdown_manager_1 = require("../hooks/use-dropdown-manager");
const input_color_1 = require("../inputs/input-color");
const input_icon_1 = require("../inputs/input-icon");
const input_radio_1 = require("../inputs/input-radio");
const hover_tooltip_1 = require("../hover-tooltip");
const toolbar_button_1 = require("../toolbar-button");
const AdvancedTypography = () => {
    const { textState, handleLetterSpacingChange, handleCapitalizationChange, handleTextDecorationChange, handleLineHeightChange, } = (0, use_text_control_1.useTextControl)();
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'advanced-typography-dropdown'
    });
    const handleClose = () => {
        onOpenChange(false);
    };
    const capitalizationOptions = [
        { value: 'uppercase', label: 'AA' },
        { value: 'capitalize', label: 'Aa' },
        { value: 'lowercase', label: 'aa' },
        { value: 'none', icon: <icons_1.Icons.CrossL className="h-4 w-4"/> },
    ];
    const decorationOptions = [
        { value: 'underline', icon: <icons_1.Icons.TextUnderline className="h-4 w-4"/> },
        { value: 'overline', icon: <icons_1.Icons.TextOverline className="h-4 w-4"/> },
        { value: 'line-through', icon: <icons_1.Icons.TextStrikeThrough className="h-4 w-4"/> },
        { value: 'none', icon: <icons_1.Icons.CrossL className="h-4 w-4"/> },
    ];
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <hover_tooltip_1.HoverOnlyTooltip content="Advanced Typography" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <toolbar_button_1.ToolbarButton isOpen={isOpen} className="flex min-w-9 items-center justify-center px-2">
                        <icons_1.Icons.AdvancedTypography className="h-4 w-4"/>
                    </toolbar_button_1.ToolbarButton>
                </dropdown_menu_1.DropdownMenuTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent side="bottom" align="start" className="mt-1 w-[300px] rounded-xl p-0 bg-background shadow-lg border border-border">
                <div className="flex justify-between items-center pl-4 pr-2.5 py-1.5 border-b border-border">
                    <h2 className="text-sm font-normal text-foreground">Advanced Typography</h2>
                    <button_1.Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-background-secondary" onClick={handleClose}>
                        <icons_1.Icons.CrossS className="h-4 w-4"/>
                    </button_1.Button>
                </div>
                <div className="space-y-4 px-4 py-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground w-20">Color</span>
                        <div className="flex-1">
                            <input_color_1.InputColor color={textState.textColor} elementStyleKey="color"/>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground w-20">Line</span>
                        <div className="flex-1">
                            <input_icon_1.InputIcon value={isNaN(parseFloat(textState.lineHeight)) ? 0 : parseFloat(textState.lineHeight)} onChange={(value) => handleLineHeightChange(value.toString())}/>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground w-20">Letter</span>
                        <div className="flex-1">
                            <input_icon_1.InputIcon value={isNaN(parseFloat(textState.letterSpacing)) ? 0 : parseFloat(textState.letterSpacing)} onChange={(value) => handleLetterSpacingChange(value.toString())}/>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-20">Capitalize</span>
                        <div className="w-[225px]">
                            <input_radio_1.InputRadio options={capitalizationOptions} value={textState.capitalization} onChange={handleCapitalizationChange} className="flex-1"/>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-20">Decorate</span>
                        <div className="w-[225px]">
                            <input_radio_1.InputRadio options={decorationOptions} value={textState.textDecorationLine} onChange={handleTextDecorationChange} className="flex-1"/>
                        </div>
                    </div>
                </div>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
};
exports.AdvancedTypography = AdvancedTypography;
//# sourceMappingURL=advanced-typography.js.map