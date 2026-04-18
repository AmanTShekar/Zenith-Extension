"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputDropdown = void 0;
const constants_1 = require("@onlook/constants");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const use_input_control_1 = require("../hooks/use-input-control");
const OPTION_OVERRIDES = {
    Fit: 'Hug',
    Relative: 'Rel',
};
const InputDropdown = ({ value, unit = 'px', dropdownValue = 'Hug', dropdownOptions = ['Hug'], onChange, onDropdownChange, onUnitChange, }) => {
    const { localValue, handleKeyDown, handleChange } = (0, use_input_control_1.useInputControl)(value, onChange);
    return (<div className="flex items-center">
            <div className="flex flex-1 items-center bg-background-tertiary/50 justify-between rounded-l-md px-2.5 h-[36px] min-w-[72px]">
                <input type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*" value={localValue} onChange={(e) => handleChange(e.target.value)} onKeyDown={handleKeyDown} className="w-[40px] bg-transparent text-sm text-white focus:outline-none text-left" aria-label="Value input"/>
                <dropdown_menu_1.DropdownMenu modal={false}>
                    <dropdown_menu_1.DropdownMenuTrigger className="text-sm text-muted-foreground focus:outline-none cursor-pointer hover:text-white transition-colors">
                        {unit}
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent align="start" className="min-w-0 w-[64px]">
                        {constants_1.UNITS.map((unitOption) => (<dropdown_menu_1.DropdownMenuItem key={unitOption} onClick={() => onUnitChange?.(unitOption)} className="text-sm w-full h-9 flex justify-center items-center text-center px-2 hover:bg-background-tertiary/70 hover:text-white transition-colors">
                                {unitOption.toUpperCase()}
                            </dropdown_menu_1.DropdownMenuItem>))}
                    </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>
            </div>
            <dropdown_menu_1.DropdownMenu modal={false}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <button_1.Button variant="ghost" className="h-[36px] bg-background-tertiary/50 hover:bg-background-tertiary/70 hover:text-white rounded-l-none rounded-r-md ml-[1px] px-2.5 flex items-center justify-between w-[84px] cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground group-hover:text-white transition-colors">
                                {OPTION_OVERRIDES[dropdownValue] ?? dropdownValue}
                            </span>
                        </div>
                        <icons_1.Icons.ChevronDown className="h-4 w-4 min-h-4 min-w-4 text-muted-foreground group-hover:text-white transition-colors"/>
                    </button_1.Button>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent align="start" className="min-w-[100px] -mt-[1px] p-1 rounded-lg">
                    {dropdownOptions.map((option) => (<dropdown_menu_1.DropdownMenuItem key={option} onClick={() => onDropdownChange?.(option)} className="flex items-center px-2 py-1.5 rounded-md cursor-pointer text-muted-foreground text-sm hover:bg-background-tertiary/70 hover:text-white transition-colors border border-border/0 data-[highlighted]:border-border">
                            {OPTION_OVERRIDES[option] ?? option}
                        </dropdown_menu_1.DropdownMenuItem>))}
                </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
        </div>);
};
exports.InputDropdown = InputDropdown;
//# sourceMappingURL=input-dropdown.js.map