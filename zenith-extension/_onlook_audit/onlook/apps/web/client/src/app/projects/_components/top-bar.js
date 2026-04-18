"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopBar = void 0;
const auth_context_1 = require("@/app/auth/auth-context");
const avatar_dropdown_1 = require("@/components/ui/avatar-dropdown");
const keys_1 = require("@/i18n/keys");
const react_1 = require("@/trpc/react");
const constants_1 = require("@/utils/constants");
const constants_2 = require("@onlook/constants");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const utils_1 = require("@onlook/ui/utils");
const localforage_1 = __importDefault(require("localforage"));
const react_2 = require("motion/react");
const next_intl_1 = require("next-intl");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const react_3 = require("react");
const sonner_1 = require("sonner");
const RECENT_SEARCHES_KEY = 'onlook_recent_searches';
const RECENT_COLORS_KEY = 'onlook_recent_colors';
const TopBar = ({ searchQuery, onSearchChange }) => {
    const t = (0, next_intl_1.useTranslations)();
    const router = (0, navigation_1.useRouter)();
    const [isSearchFocused, setIsSearchFocused] = (0, react_3.useState)(false);
    const [recentSearches, setRecentSearches] = (0, react_3.useState)([]);
    const [recentColors, setRecentColors] = (0, react_3.useState)([]);
    const [isCreatingProject, setIsCreatingProject] = (0, react_3.useState)(false);
    const searchInputRef = (0, react_3.useRef)(null);
    const searchContainerRef = (0, react_3.useRef)(null);
    // API hooks
    const { data: user } = react_1.api.user.get.useQuery();
    const { mutateAsync: forkSandbox } = react_1.api.sandbox.fork.useMutation();
    const { mutateAsync: createProject } = react_1.api.project.create.useMutation();
    const { setIsAuthModalOpen } = (0, auth_context_1.useAuthContext)();
    (0, react_3.useEffect)(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Load suggestions from localforage
    (0, react_3.useEffect)(() => {
        const loadRecentSearches = async () => {
            try {
                const rs = await localforage_1.default.getItem(RECENT_SEARCHES_KEY) ?? [];
                if (Array.isArray(rs))
                    setRecentSearches(rs.slice(0, 6));
            }
            catch { }
        };
        loadRecentSearches();
        const loadRecentColors = async () => {
            try {
                const rc = await localforage_1.default.getItem(RECENT_COLORS_KEY) ?? [];
                if (Array.isArray(rc))
                    setRecentColors(rc.slice(0, 10));
            }
            catch { }
        };
        loadRecentColors();
    }, []);
    // Persist non-empty search queries to recent
    (0, react_3.useEffect)(() => {
        const q = (searchQuery ?? '').trim();
        if (!q)
            return;
        const timer = setTimeout(async () => {
            try {
                const recentSearches = (await localforage_1.default.getItem(RECENT_SEARCHES_KEY)) ?? [];
                const rs = new Set([
                    q,
                    ...recentSearches,
                ]);
                const arr = Array.from(rs).slice(0, 8);
                localforage_1.default.setItem(RECENT_SEARCHES_KEY, arr);
                setRecentSearches(arr);
            }
            catch { }
        }, 600);
        return () => clearTimeout(timer);
    }, [searchQuery]);
    (0, react_3.useEffect)(() => {
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
    const handleStartBlankProject = async () => {
        if (!user?.id) {
            // Store the return URL and open auth modal
            await localforage_1.default.setItem(constants_1.LocalForageKeys.RETURN_URL, window.location.pathname);
            setIsAuthModalOpen(true);
            return;
        }
        setIsCreatingProject(true);
        try {
            // Create a blank project using the BLANK template
            const { sandboxId, previewUrl } = await forkSandbox({
                sandbox: constants_2.SandboxTemplates[constants_2.Templates.EMPTY_NEXTJS],
                config: {
                    title: `Blank project - ${user.id}`,
                    tags: ['blank', user.id],
                },
            });
            const newProject = await createProject({
                project: {
                    name: 'New Project',
                    description: 'Your new blank project',
                    tags: ['blank'],
                },
                sandboxId,
                sandboxUrl: previewUrl,
                userId: user.id,
            });
            if (newProject) {
                router.push(`${constants_1.Routes.PROJECT}/${newProject.id}`);
            }
        }
        catch (error) {
            console.error('Error creating blank project:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('502') || errorMessage.includes('sandbox')) {
                sonner_1.toast.error('Sandbox service temporarily unavailable', {
                    description: 'Please try again in a few moments. Our servers may be experiencing high load.',
                });
            }
            else {
                sonner_1.toast.error('Failed to create project', {
                    description: errorMessage,
                });
            }
        }
        finally {
            setIsCreatingProject(false);
        }
    };
    return (<div className="w-full max-w-6xl mx-auto flex items-center justify-between p-4 text-small text-foreground-secondary gap-6">
            <link_1.default href={constants_1.Routes.HOME} className="flex items-center justify-start mt-0 py-3">
                <icons_1.Icons.OnlookTextLogo className="w-24" viewBox="0 0 139 17"/>
            </link_1.default>

            {typeof onSearchChange === 'function' ? (<div className="flex-1 flex justify-center min-w-0">
                    <react_2.motion.div ref={searchContainerRef} className="relative w-full hidden sm:block" initial={false} animate={isSearchFocused ?
                { width: '100%', maxWidth: '360px' } :
                { width: '100%', maxWidth: '260px' }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}>
                        <icons_1.Icons.MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary z-10"/>
                        <input_1.Input ref={searchInputRef} value={searchQuery ?? ''} onChange={(e) => onSearchChange?.(e.currentTarget.value)} onFocus={() => setIsSearchFocused(true)} placeholder="Search projects" className="pl-9 pr-7 focus-visible:border-transparent focus-visible:ring-0 w-full"/>
                        {searchQuery && (<button onClick={() => onSearchChange?.('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground" aria-label="Clear search">
                                <icons_1.Icons.CrossS className="h-4 w-4"/>
                            </button>)}
                    </react_2.motion.div>
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
                        <dropdown_menu_1.DropdownMenuItem className={(0, utils_1.cn)('focus:bg-blue-100 focus:text-blue-900', 'hover:bg-blue-100 hover:text-blue-900', 'dark:focus:bg-blue-900 dark:focus:text-blue-100', 'dark:hover:bg-blue-900 dark:hover:text-blue-100', 'cursor-pointer select-none group')} onSelect={handleStartBlankProject} disabled={isCreatingProject}>
                            {isCreatingProject ? (<icons_1.Icons.LoadingSpinner className="w-4 h-4 mr-1 animate-spin text-foreground-secondary group-hover:text-blue-100"/>) : (<icons_1.Icons.FilePlus className="w-4 h-4 mr-1 text-foreground-secondary group-hover:text-blue-100"/>)}
                            {t(keys_1.transKeys.projects.actions.blankProject)}
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem className={(0, utils_1.cn)('focus:bg-teal-100 focus:text-teal-900', 'hover:bg-teal-100 hover:text-teal-900', 'dark:focus:bg-teal-900 dark:focus:text-teal-100', 'dark:hover:bg-teal-900 dark:hover:text-teal-100', 'cursor-pointer select-none group')} onSelect={() => {
            router.push(constants_1.Routes.IMPORT_PROJECT);
        }}>
                            <icons_1.Icons.Upload className="w-4 h-4 mr-1 text-foreground-secondary group-hover:text-teal-100"/>
                            <p className="text-microPlus">{t(keys_1.transKeys.projects.actions.import)}</p>
                        </dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>
                <avatar_dropdown_1.CurrentUserAvatar className="w-8 h-8"/>
            </div>
        </div>);
};
exports.TopBar = TopBar;
//# sourceMappingURL=top-bar.js.map