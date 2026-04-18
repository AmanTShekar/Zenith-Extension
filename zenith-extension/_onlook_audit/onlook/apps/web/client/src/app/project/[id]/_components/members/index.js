"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Members = void 0;
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const popover_1 = require("@onlook/ui/popover");
const tooltip_1 = require("@onlook/ui/tooltip");
const react_1 = require("react");
const members_content_1 = require("./members-content");
const Members = ({ onPopoverOpenChange }) => {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const handleOpenChange = (open) => {
        setIsOpen(open);
        onPopoverOpenChange?.(open);
    };
    return (<popover_1.Popover open={isOpen} onOpenChange={handleOpenChange}>
            <tooltip_1.Tooltip>
                <tooltip_1.TooltipTrigger asChild>
                    <popover_1.PopoverTrigger asChild>
                        <button_1.Button variant="outline" size="icon" className="rounded-full size-8 hover:border-border bg-background-secondary hover:bg-background-secondary/80 text-foreground-secondary hover:text-foreground-primary">
                            <icons_1.Icons.Plus className="size-4"/>
                        </button_1.Button>
                    </popover_1.PopoverTrigger>
                </tooltip_1.TooltipTrigger>
                <tooltip_1.TooltipContent side="bottom" className="z-50 mt-1" hideArrow>
                    <p>Invite team members</p>
                </tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>
            <popover_1.PopoverContent className="p-0 w-96" side="bottom" align="center" sideOffset={4}>
                <members_content_1.MembersContent />
            </popover_1.PopoverContent>
        </popover_1.Popover>);
};
exports.Members = Members;
//# sourceMappingURL=index.js.map