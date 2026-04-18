"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateDropdown = void 0;
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const StateDropdown = () => {
    return (<dropdown_menu_1.DropdownMenu modal={false}>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button variant="ghost" size="toolbar" className="flex items-center gap-2 text-muted-foreground border border-border/0 cursor-pointer rounded-lg hover:bg-background-tertiary/20 hover:text-white hover:border hover:border-border data-[state=open]:bg-background-tertiary/20 data-[state=open]:text-white data-[state=open]:border data-[state=open]:border-border focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none active:border-0">
                    <icons_1.Icons.StateCursor className="h-4 w-4 min-h-4 min-w-4"/>
                    <span className="text-sm">State</span>
                </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="start" className="min-w-[120px] mt-1 p-1 rounded-lg">
                <dropdown_menu_1.DropdownMenuItem className="flex items-center px-2 py-1.5 rounded-md text-muted-foreground text-sm data-[highlighted]:bg-background-tertiary/10 border border-border/0 data-[highlighted]:border-border data-[highlighted]:text-white">
                    Default
                </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
};
exports.StateDropdown = StateDropdown;
//# sourceMappingURL=state-dropdown.js.map