"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputIcon = void 0;
const constants_1 = require("@onlook/constants");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("react");
const use_input_control_1 = require("../hooks/use-input-control");
const InputIcon = ({ value, unit = 'px', icon, onChange, onUnitChange }) => {
    const [unitValue, setUnitValue] = (0, react_1.useState)(unit);
    const { localValue, handleKeyDown, handleChange } = (0, use_input_control_1.useInputControl)(value, onChange);
    const IconComponent = icon ? icons_1.Icons[icon] : null;
    return (<div className="flex items-center gap-2">
            {IconComponent && (<IconComponent className="h-5 w-5 min-h-5 min-w-5 text-muted-foreground"/>)}
            <div className="flex items-center bg-background-tertiary/50 justify-between rounded-md px-3 h-[36px] w-full">
                <input type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*" value={localValue} onChange={(e) => handleChange(e.target.value)} onKeyDown={handleKeyDown} className="w-[40px] bg-transparent text-sm text-white focus:outline-none uppercase hover:text-white"/>

                <dropdown_menu_1.DropdownMenu modal={false}>
                    <dropdown_menu_1.DropdownMenuTrigger className="text-[12px] text-muted-foreground focus:outline-none cursor-pointer hover:text-white transition-colors">
                        {unitValue === 'px' ? '' : unitValue}
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent align="start" className="min-w-0 w-[64px]">
                        {constants_1.UNITS.map((unitOption) => (<dropdown_menu_1.DropdownMenuItem key={unitOption} onClick={() => {
                onUnitChange?.(unitOption);
                setUnitValue(unitOption);
            }} className="text-[12px] text-center px-2 hover:bg-background-tertiary/70 hover:text-white transition-colors">
                                {unitOption}
                            </dropdown_menu_1.DropdownMenuItem>))}
                    </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>
            </div>
        </div>);
};
exports.InputIcon = InputIcon;
//# sourceMappingURL=input-icon.js.map