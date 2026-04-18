"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopBarPresentation = void 0;
const keys_1 = require("@/i18n/keys");
const avatar_1 = require("@onlook/ui/avatar");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const react_1 = require("motion/react");
const next_intl_1 = require("next-intl");
const link_1 = __importDefault(require("next/link"));
const react_2 = require("react");
/**
 * TopBarPresentation - Pure presentational version of the TopBar component.
 * Receives all data and callbacks as props instead of using hooks/context.
 */
const TopBarPresentation = ({ user, searchQuery, onSearchChange, recentSearches = [], isCreatingProject = false, onCreateBlank, onImport, homeRoute = '/', }) => {
    const t = (0, next_intl_1.useTranslations)();
    const [isSearchFocused, setIsSearchFocused] = (0, react_2.useState)(false);
    const searchInputRef = (0, react_2.useRef)(null);
    const searchContainerRef = (0, react_2.useRef)(null);
    (0, react_2.useEffect)(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    (0, react_2.useEffect)(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsSearchFocused(false);
                searchInputRef.current?.blur();
                onSearchChange?.('');
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onSearchChange]);
    return (<div className="w-full max-w-6xl mx-auto flex items-center justify-between p-4 text-small text-foreground-secondary gap-6">
            <link_1.default href={homeRoute} className="flex items-center justify-start mt-0 py-3">
                <icons_1.Icons.OnlookTextLogo className="w-24" viewBox="0 0 139 17"/>
            </link_1.default>

            {typeof onSearchChange === 'function' ? (<div className="flex-1 flex justify-center min-w-0">
                    <react_1.motion.div ref={searchContainerRef} className="relative w-full hidden sm:block" initial={false} animate={isSearchFocused ?
                { width: '100%', maxWidth: '360px' } :
                { width: '100%', maxWidth: '260px' }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}>
                        <icons_1.Icons.MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary z-10"/>
                        <input_1.Input ref={searchInputRef} value={searchQuery ?? ''} onChange={(e) => onSearchChange?.(e.currentTarget.value)} onFocus={() => setIsSearchFocused(true)} placeholder="Search projects" className="pl-9 pr-7 focus-visible:border-transparent focus-visible:ring-0 w-full"/>
                        {searchQuery && (<button onClick={() => onSearchChange?.('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground" aria-label="Clear search">
                                <icons_1.Icons.CrossS className="h-4 w-4"/>
                            </button>)}
                    </react_1.motion.div>
                </div>) : (<div className="flex-1"/>)}

            <div className="flex justify-end gap-3 mt-0 items-center">
                <dropdown_menu_1.DropdownMenu>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button className="text-sm focus:outline-none cursor-pointer py-[0.4rem] h-8" variant="default" disabled={isCreatingProject}>
                            {isCreatingProject ? (<>
                                    Creating... <icons_1.Icons.LoadingSpinner className="animate-spin"/>
                                </>) : (<>
                                    Create <icons_1.Icons.ChevronDown />
                                </>)}
                        </button_1.Button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent sideOffset={8} className="translate-x-[-12px]">
                        <dropdown_menu_1.DropdownMenuItem className={(0, utils_1.cn)('focus:bg-blue-100 focus:text-blue-900', 'hover:bg-blue-100 hover:text-blue-900', 'dark:focus:bg-blue-900 dark:focus:text-blue-100', 'dark:hover:bg-blue-900 dark:hover:text-blue-100', 'cursor-pointer select-none group')} onSelect={onCreateBlank} disabled={isCreatingProject}>
                            {isCreatingProject ? (<icons_1.Icons.LoadingSpinner className="w-4 h-4 mr-1 animate-spin text-foreground-secondary group-hover:text-blue-100"/>) : (<icons_1.Icons.FilePlus className="w-4 h-4 mr-1 text-foreground-secondary group-hover:text-blue-100"/>)}
                            {t(keys_1.transKeys.projects.actions.blankProject)}
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem className={(0, utils_1.cn)('focus:bg-teal-100 focus:text-teal-900', 'hover:bg-teal-100 hover:text-teal-900', 'dark:focus:bg-teal-900 dark:focus:text-teal-100', 'dark:hover:bg-teal-900 dark:hover:text-teal-100', 'cursor-pointer select-none group')} onSelect={onImport}>
                            <icons_1.Icons.Upload className="w-4 h-4 mr-1 text-foreground-secondary group-hover:text-teal-100"/>
                            <p className="text-microPlus">{t(keys_1.transKeys.projects.actions.import)}</p>
                        </dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>
                {/* Simple avatar for presentational component - no dropdown */}
                <avatar_1.Avatar className="w-8 h-8">
                    {user?.avatarUrl && <avatar_1.AvatarImage src={user.avatarUrl} alt={(0, utility_1.getInitials)(user?.displayName ?? user?.firstName ?? '')}/>}
                    <avatar_1.AvatarFallback>{(0, utility_1.getInitials)(user?.displayName ?? user?.firstName ?? '')}</avatar_1.AvatarFallback>
                </avatar_1.Avatar>
            </div>
        </div>);
};
exports.TopBarPresentation = TopBarPresentation;
//# sourceMappingURL=top-bar-presentation.js.map