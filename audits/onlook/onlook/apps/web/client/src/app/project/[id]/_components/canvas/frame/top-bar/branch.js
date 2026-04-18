"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchDisplay = void 0;
const editor_1 = require("@/components/store/editor");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const branch_controls_1 = require("../../../branch/branch-controls");
const hover_tooltip_1 = require("../../../editor-bar/hover-tooltip");
exports.BranchDisplay = (0, mobx_react_lite_1.observer)(({ frame, tooltipSide = "top", buttonSize = "sm", buttonClassName }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const frameBranch = editorEngine.branches.getBranchById(frame.branchId);
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    if (!frameBranch) {
        return null;
    }
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <hover_tooltip_1.HoverOnlyTooltip content="Branch" side={tooltipSide} className="mb-1" hideArrow>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <button_1.Button variant="ghost" size={buttonSize} className={(0, utils_1.cn)("h-auto px-2 py-1 text-xs hover:!bg-transparent focus:!bg-transparent active:!bg-transparent", buttonClassName)}>
                        <icons_1.Icons.Branch />
                        <div className="flex items-center gap-1.5 max-w-24 truncate">
                            <span className="truncate">{frameBranch.name}</span>
                        </div>
                    </button_1.Button>
                </dropdown_menu_1.DropdownMenuTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuSeparator />
            <dropdown_menu_1.DropdownMenuContent align="start" className="w-[200px] p-0">
                <branch_controls_1.BranchControls branch={frameBranch} onClose={() => setIsOpen(false)}/>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=branch.js.map