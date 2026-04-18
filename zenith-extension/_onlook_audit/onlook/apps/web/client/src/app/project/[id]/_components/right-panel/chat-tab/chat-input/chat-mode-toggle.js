"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModeToggle = void 0;
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const hover_tooltip_1 = require("../../../editor-bar/hover-tooltip");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
exports.ChatModeToggle = (0, mobx_react_lite_1.observer)(({ chatMode, onChatModeChange, disabled = false }) => {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const handleOpenMenu = () => {
            setIsOpen(true);
        };
        window.addEventListener('open-chat-mode-menu', handleOpenMenu);
        return () => window.removeEventListener('open-chat-mode-menu', handleOpenMenu);
    }, []);
    const getCurrentModeIcon = () => {
        return chatMode === models_1.ChatType.EDIT ? icons_1.Icons.Build : icons_1.Icons.Ask;
    };
    const getCurrentModeLabel = () => {
        return chatMode === models_1.ChatType.EDIT ? 'Build' : 'Ask';
    };
    const Icon = getCurrentModeIcon();
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <hover_tooltip_1.HoverOnlyTooltip className='mb-1' content={<span>
                            Open mode menu
                        </span>} side="top" hideArrow>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button variant="ghost" size="sm" disabled={disabled} className={(0, utils_1.cn)('h-8 px-2 text-foreground-onlook group flex items-center gap-1.5', disabled && 'opacity-50 cursor-not-allowed')}>
                            <Icon className={(0, utils_1.cn)('w-4 h-4', disabled
            ? 'text-foreground-tertiary'
            : chatMode === models_1.ChatType.ASK
                ? 'text-blue-200'
                : 'text-foreground-secondary group-hover:text-foreground')}/>
                            <span className={(0, utils_1.cn)("text-xs font-medium", chatMode === models_1.ChatType.ASK && "text-blue-200")}>
                                {getCurrentModeLabel()}
                            </span>
                        </button_1.Button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent align="start" className="w-40">
                <dropdown_menu_1.DropdownMenuItem onClick={() => onChatModeChange(models_1.ChatType.EDIT)} className={(0, utils_1.cn)('flex items-center gap-2 px-3 py-2', chatMode === models_1.ChatType.EDIT && 'bg-background-onlook')}>
                    <icons_1.Icons.Build className="w-4 h-4"/>
                    <span>Build</span>
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem onClick={() => onChatModeChange(models_1.ChatType.ASK)} className={(0, utils_1.cn)('flex items-center gap-2 px-3 py-2', chatMode === models_1.ChatType.ASK && 'bg-background-onlook')}>
                    <icons_1.Icons.Ask className="w-4 h-4"/>
                    <span>Ask</span>
                </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=chat-mode-toggle.js.map