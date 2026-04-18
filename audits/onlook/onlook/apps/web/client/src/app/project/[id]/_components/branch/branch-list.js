"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchList = BranchList;
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const scroll_area_1 = require("@onlook/ui/scroll-area");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
function BranchList({ branches, activeBranch, onBranchSwitch, showSearch = true }) {
    const [searchQuery, setSearchQuery] = (0, react_1.useState)("");
    const filteredBranches = (0, react_1.useMemo)(() => {
        if (!showSearch || !searchQuery) {
            return branches;
        }
        return branches.filter(branch => branch.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [branches, searchQuery, showSearch]);
    return (<>
            <div className="p-1.5 border-b select-none text-small">
                <dropdown_menu_1.DropdownMenuLabel>Branches</dropdown_menu_1.DropdownMenuLabel>
            </div>
            <scroll_area_1.ScrollArea className="max-h-[300px]">
                <div className="p-1">
                    {filteredBranches.map((branch) => (<dropdown_menu_1.DropdownMenuItem key={branch.id} className="flex items-center justify-between cursor-pointer" onSelect={() => onBranchSwitch(branch.id)}>
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                {activeBranch.id === branch.id ? (<icons_1.Icons.Check className="h-4 w-4 text-green-600"/>) : (<icons_1.Icons.Branch className="h-4 w-4 text-muted-foreground"/>)}
                                <span className="truncate font-medium">{branch.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {(0, utility_1.timeAgo)(branch.updatedAt)}{showSearch ? '' : ' ago'}
                            </span>
                        </dropdown_menu_1.DropdownMenuItem>))}

                    {filteredBranches.length === 0 && searchQuery && showSearch && (<div className="text-sm text-muted-foreground text-center py-4">
                            No branches found
                        </div>)}

                    {filteredBranches.length === 0 && !showSearch && branches.length === 0 && (<div className="text-sm text-muted-foreground text-center py-4">
                            No branches found
                        </div>)}
                </div>
            </scroll_area_1.ScrollArea>
        </>);
}
//# sourceMappingURL=branch-list.js.map