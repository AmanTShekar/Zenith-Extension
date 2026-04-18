"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontFamily = void 0;
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("react");
const tooltip_1 = require("@onlook/ui/tooltip");
const react_tooltip_1 = require("@radix-ui/react-tooltip");
const utils_1 = require("@onlook/ui/utils");
const lodash_1 = require("lodash");
const FontVariant = ({ name }) => {
    const fontVariant = `font-${(0, lodash_1.camelCase)(name).toLowerCase()}`;
    return <div className={(0, utils_1.cn)('text-sm text-muted-foreground', fontVariant)}>{name}</div>;
};
const FontFamily = ({ name, variants = [], onAddFont, onRemoveFont, onSetFont, showDropdown = false, showAddButton = true, isDefault = false, }) => {
    const [expanded, setExpanded] = (0, react_1.useState)(false);
    const handleToggleDefault = () => {
        onSetFont?.();
    };
    return (<div className="w-full group" style={{
            fontFamily: name,
        }}>
            <div className="flex justify-between items-center py-3">
                <div className="flex flex-1 items-center cursor-pointer max-w-52" onClick={() => setExpanded(!expanded)}>
                    <icons_1.Icons.ChevronRight className={`h-4 w-4 mr-2 transition-transform ${expanded ? 'rotate-90' : ''}`}/>
                    <tooltip_1.Tooltip>
                        <tooltip_1.TooltipTrigger asChild>
                            <span className={`text-sm truncate transition-opacity duration-200`}>
                                {name}
                            </span>
                        </tooltip_1.TooltipTrigger>
                        <tooltip_1.TooltipPortal container={document.getElementById('style-panel')}>
                            <tooltip_1.TooltipContent side="right" align="center" sideOffset={10} className="animation-none max-w-[200px] shadow">
                                <react_tooltip_1.TooltipArrow className="fill-foreground"/>
                                <p className="break-words">{name}</p>
                            </tooltip_1.TooltipContent>
                        </tooltip_1.TooltipPortal>
                    </tooltip_1.Tooltip>
                    {isDefault && (<span className="ml-2 text-xs text-muted-foreground">(Default)</span>)}
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                    {showAddButton && onAddFont && (<button_1.Button variant="secondary" size="sm" className="h-7 pl-2 pr-1.5 rounded-md bg-background-secondary" onClick={() => onAddFont()}>
                            Add <icons_1.Icons.Plus className="ml-1 h-3 w-3"/>
                        </button_1.Button>)}
                    {showDropdown && (<dropdown_menu_1.DropdownMenu>
                            <dropdown_menu_1.DropdownMenuTrigger asChild>
                                <button_1.Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-background-secondary">
                                    <icons_1.Icons.DotsHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground"/>
                                </button_1.Button>
                            </dropdown_menu_1.DropdownMenuTrigger>
                            <dropdown_menu_1.DropdownMenuContent align="end" className="min-w-fit">
                                <dropdown_menu_1.DropdownMenuCheckboxItem checked={isDefault} onCheckedChange={handleToggleDefault} className="flex items-center pr-2 cursor-pointer">
                                    <span>Set as default font</span>
                                </dropdown_menu_1.DropdownMenuCheckboxItem>
                                <dropdown_menu_1.DropdownMenuItem className="flex items-center" onClick={() => onRemoveFont?.()}>
                                    <icons_1.Icons.Trash className="h-4 w-4 mr-2"/>
                                    <span>Remove</span>
                                </dropdown_menu_1.DropdownMenuItem>
                            </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>)}
                </div>
            </div>

            {expanded && variants.length > 0 && (<div className="pl-7 flex flex-col gap-2 pb-6">
                    {variants.map((variant) => (<FontVariant key={`${name}-${variant}`} name={variant}/>))}
                </div>)}
        </div>);
};
exports.FontFamily = FontFamily;
//# sourceMappingURL=FontFamily.js.map