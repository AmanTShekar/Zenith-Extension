"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontWeightSelector = void 0;
const fonts_1 = require("@onlook/fonts");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const use_dropdown_manager_1 = require("../../hooks/use-dropdown-manager");
const use_text_control_1 = require("../../hooks/use-text-control");
const hover_tooltip_1 = require("../../hover-tooltip");
const toolbar_button_1 = require("../../toolbar-button");
exports.FontWeightSelector = (0, mobx_react_lite_1.observer)(() => {
    const { handleFontWeightChange, textState } = (0, use_text_control_1.useTextControl)();
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'font-weight-dropdown',
    });
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
                <hover_tooltip_1.HoverOnlyTooltip content="Font Weight" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <toolbar_button_1.ToolbarButton isOpen={isOpen} className="flex w-24 items-center justify-start gap-2 px-3">
                            <span className="text-smallPlus">
                                {(0, utility_1.convertFontWeight)(textState.fontWeight)}
                            </span>
                        </toolbar_button_1.ToolbarButton>
                    </dropdown_menu_1.DropdownMenuTrigger>
                </hover_tooltip_1.HoverOnlyTooltip>
                <dropdown_menu_1.DropdownMenuContent align="center" className="mt-1 min-w-[120px] rounded-lg p-1">
                    {fonts_1.VARIANTS.map((weight) => (<dropdown_menu_1.DropdownMenuItem key={weight.value} onClick={() => handleFontWeightChange(weight.value)} className={`text-muted-foreground data-[highlighted]:bg-background-tertiary/10 border-border/0 data-[highlighted]:border-border flex items-center justify-between rounded-md border px-2 py-1.5 text-sm data-[highlighted]:text-white cursor-pointer transition-colors duration-150 hover:bg-background-tertiary/20 hover:text-foreground ${textState.fontWeight === weight.value
                ? 'bg-background-tertiary/20 border-border border text-white'
                : ''}`}>
                            {weight.name}
                            {textState.fontWeight === weight.value && (<icons_1.Icons.Check className="ml-2 h-4 w-4 text-foreground-primary"/>)}
                        </dropdown_menu_1.DropdownMenuItem>))}
                </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=font-weight.js.map