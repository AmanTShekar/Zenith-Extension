"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverflowMenu = void 0;
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const react_1 = __importDefault(require("react"));
const separator_1 = require("./separator");
const toolbar_button_1 = require("./toolbar-button");
const hover_tooltip_1 = require("./hover-tooltip");
const OverflowMenu = ({ isOpen, onOpenChange, overflowGroups, visibleCount }) => {
    if (overflowGroups.length === 0)
        return null;
    return (<>
            {visibleCount > 0 && <separator_1.InputSeparator />}
            <dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
                <hover_tooltip_1.HoverOnlyTooltip content="More options" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <toolbar_button_1.ToolbarButton isOpen={isOpen} className="w-9 flex items-center justify-center" aria-label="Show more toolbar controls">
                            <icons_1.Icons.DotsHorizontal className="w-5 h-5"/>
                        </toolbar_button_1.ToolbarButton>
                    </dropdown_menu_1.DropdownMenuTrigger>
                </hover_tooltip_1.HoverOnlyTooltip>
                <dropdown_menu_1.DropdownMenuContent align="end" className="flex flex-row gap-1 p-1 px-1 bg-background rounded-lg shadow-xl shadow-black/20 min-w-[fit-content] items-center w-[fit-content]">
                    {overflowGroups.map((group, groupIdx) => (<react_1.default.Fragment key={group.key}>
                            {groupIdx > 0 && <separator_1.InputSeparator />}
                            <div className="flex items-center gap-0.5">
                                {group.components.map((comp, idx) => (<react_1.default.Fragment key={idx}>{comp}</react_1.default.Fragment>))}
                            </div>
                        </react_1.default.Fragment>))}
                </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
        </>);
};
exports.OverflowMenu = OverflowMenu;
//# sourceMappingURL=overflow-menu.js.map