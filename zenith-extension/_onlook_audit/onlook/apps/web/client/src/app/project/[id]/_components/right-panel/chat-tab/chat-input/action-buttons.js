"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionButtons = void 0;
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const ActionButtons = ({ disabled = false, handleImageEvent, handleScreenshot, }) => {
    const handleOpenFileDialog = (e) => {
        e.preventDefault();
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.accept = 'image/*';
        inputElement.onchange = async () => {
            if (inputElement.files && inputElement.files.length > 0) {
                const file = inputElement.files[0];
                if (!file) {
                    return;
                }
                const fileName = file.name;
                await handleImageEvent(file, fileName);
            }
        };
        inputElement.click();
    };
    return (<dropdown_menu_1.DropdownMenu>
            <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button variant={'ghost'} size={'icon'} className="w-9 h-9 text-foreground-tertiary group hover:bg-transparent cursor-pointer" disabled={disabled} onMouseDown={(e) => {
            e.currentTarget.blur();
        }}>
                            <icons_1.Icons.Image className={(0, utils_1.cn)('w-5 h-5', disabled
            ? 'text-foreground-tertiary'
            : 'group-hover:text-foreground')}/>
                        </button_1.Button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipPortal>
                    <tooltip_1.TooltipContent side="top" sideOffset={6} hideArrow>
                        {disabled ? 'Select an element to start' : 'Add Image or Screenshot'}
                    </tooltip_1.TooltipContent>
                </tooltip_1.TooltipPortal>
            </tooltip_1.Tooltip>
            <dropdown_menu_1.DropdownMenuContent align="end" className="w-48">
                <dropdown_menu_1.DropdownMenuItem onClick={handleOpenFileDialog} disabled={disabled}>
                    <icons_1.Icons.Upload className="mr-2 h-4 w-4"/>
                    Upload Image
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem onClick={handleScreenshot} disabled={disabled}>
                    <icons_1.Icons.Laptop className="mr-2 h-4 w-4"/>
                    Add Screenshot
                </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
};
exports.ActionButtons = ActionButtons;
//# sourceMappingURL=action-buttons.js.map