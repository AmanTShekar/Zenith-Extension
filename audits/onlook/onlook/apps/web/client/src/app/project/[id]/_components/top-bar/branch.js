"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchDisplay = void 0;
const editor_1 = require("@/components/store/editor");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const branch_controls_1 = require("../branch/branch-controls");
const branch_list_1 = require("../branch/branch-list");
exports.BranchDisplay = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const activeBranch = editorEngine.branches.activeBranch;
    const allBranches = editorEngine.branches.allBranches;
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const handleBranchSwitch = async (branchId) => {
        try {
            await editorEngine.branches.switchToBranch(branchId);
            setIsOpen(false);
        }
        catch (error) {
            console.error("Failed to switch branch:", error);
        }
    };
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button variant="ghost" className="text-small font-normal text-foreground-onlook hover:text-foreground-active hover:!bg-transparent cursor-pointer group px-0 gap-2">
                    <icons_1.Icons.Branch className="h-4 w-4"/>
                    <span className="max-w-[60px] md:max-w-[100px] lg:max-w-[200px] text-small truncate cursor-pointer group-hover:text-foreground-active">
                        {activeBranch.name}
                    </span>
                </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="start" className="w-[240px] p-0">
                <branch_list_1.BranchList branches={allBranches} activeBranch={activeBranch} onBranchSwitch={handleBranchSwitch} showSearch={true}/>
                <dropdown_menu_1.DropdownMenuSeparator />
                <branch_controls_1.BranchControls branch={activeBranch} onClose={() => setIsOpen(false)}/>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=branch.js.map