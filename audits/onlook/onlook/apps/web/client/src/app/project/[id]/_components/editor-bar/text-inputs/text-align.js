"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextAlignSelector = void 0;
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const use_text_control_1 = require("../hooks/use-text-control");
const use_dropdown_manager_1 = require("../hooks/use-dropdown-manager");
const hover_tooltip_1 = require("../hover-tooltip");
const toolbar_button_1 = require("../toolbar-button");
exports.TextAlignSelector = (0, mobx_react_lite_1.observer)(() => {
    const { handleTextAlignChange, textState } = (0, use_text_control_1.useTextControl)();
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'text-align-dropdown'
    });
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
                <hover_tooltip_1.HoverOnlyTooltip content="Text Align" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <toolbar_button_1.ToolbarButton isOpen={isOpen} className="flex items-center justify-center gap-2 px-2 min-w-9">
                            {(() => {
            switch (textState.textAlign) {
                case 'center':
                    return <icons_1.Icons.TextAlignCenter className="h-4 w-4"/>;
                case 'right':
                    return <icons_1.Icons.TextAlignRight className="h-4 w-4"/>;
                case 'justify':
                    return <icons_1.Icons.TextAlignJustified className="h-4 w-4"/>;
                case 'left':
                default:
                    return <icons_1.Icons.TextAlignLeft className="h-4 w-4"/>;
            }
        })()}
                        </toolbar_button_1.ToolbarButton>
                    </dropdown_menu_1.DropdownMenuTrigger>
                </hover_tooltip_1.HoverOnlyTooltip>
                <dropdown_menu_1.DropdownMenuContent align="center" className="mt-1 flex min-w-fit gap-1 rounded-lg p-1">
                    {[
            { value: 'left', icon: icons_1.Icons.TextAlignLeft },
            { value: 'center', icon: icons_1.Icons.TextAlignCenter },
            { value: 'right', icon: icons_1.Icons.TextAlignRight },
            { value: 'justify', icon: icons_1.Icons.TextAlignJustified },
        ].map(({ value, icon: Icon }) => (<dropdown_menu_1.DropdownMenuItem key={value} onClick={() => handleTextAlignChange(value)} className={`text-muted-foreground data-[highlighted]:bg-background-tertiary/10 border-border/0 data-[highlighted]:border-border rounded-md border px-2 py-1.5 data-[highlighted]:text-foreground cursor-pointer transition-colors duration-150 hover:bg-background-tertiary/20 hover:text-foreground ${textState.textAlign === value
                ? 'bg-background-tertiary/20 border-border border text-white'
                : ''}`}>
                            <Icon className="h-4 w-4"/>
                        </dropdown_menu_1.DropdownMenuItem>))}
                </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=text-align.js.map