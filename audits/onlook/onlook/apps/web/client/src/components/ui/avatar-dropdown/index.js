"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUserAvatar = void 0;
const state_1 = require("@/components/store/state");
const react_1 = require("@/trpc/react");
const constants_1 = require("@/utils/constants");
const client_1 = require("@/utils/supabase/client");
const telemetry_1 = require("@/utils/telemetry");
const url_1 = require("@/utils/url");
const avatar_1 = require("@onlook/ui/avatar");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utility_1 = require("@onlook/utility");
const navigation_1 = require("next/navigation");
const react_2 = require("react");
const plans_1 = require("./plans");
const helpers_1 = require("../settings-modal/helpers");
const CurrentUserAvatar = ({ className }) => {
    const stateManager = (0, state_1.useStateManager)();
    const supabase = (0, client_1.createClient)();
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const { data: user } = react_1.api.user.get.useQuery();
    const initials = (0, utility_1.getInitials)(user?.displayName ?? user?.firstName ?? '');
    const [open, setOpen] = (0, react_2.useState)(false);
    const handleSignOut = async () => {
        // Clear analytics/feedback identities before signing out
        void (0, telemetry_1.resetTelemetry)();
        await supabase.auth.signOut();
        const returnUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        router.push(`${constants_1.Routes.LOGIN}?${(0, url_1.getReturnUrlQueryParam)(returnUrl)}`);
    };
    const handleOpenSubscription = () => {
        stateManager.settingsTab = helpers_1.SettingsTabValue.SUBSCRIPTION;
        stateManager.isSettingsModalOpen = true;
        setOpen(false);
    };
    const handleOpenSettings = () => {
        stateManager.settingsTab = helpers_1.SettingsTabValue.PREFERENCES;
        stateManager.isSettingsModalOpen = true;
        setOpen(false);
    };
    const BUTTONS = [
        {
            label: 'Subscription',
            icon: icons_1.Icons.CreditCard,
            onClick: handleOpenSubscription,
        },
        {
            label: 'Settings',
            icon: icons_1.Icons.Gear,
            onClick: handleOpenSettings,
        },
        {
            label: 'Send Feedback',
            icon: icons_1.Icons.MessageSquare,
            onClick: () => {
                void (0, telemetry_1.openFeedbackWidget)();
                setOpen(false);
            },
        },
        {
            label: 'Sign Out',
            icon: icons_1.Icons.Exit,
            onClick: handleSignOut,
        },
    ];
    return (<dropdown_menu_1.DropdownMenu open={open} onOpenChange={setOpen}>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button>
                    <avatar_1.Avatar className={className}>
                        {user?.avatarUrl && <avatar_1.AvatarImage src={user.avatarUrl} alt={initials}/>}
                        <avatar_1.AvatarFallback>{initials}</avatar_1.AvatarFallback>
                    </avatar_1.Avatar>
                </button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent className="w-72 p-0">
                <div className="flex items-center gap-2 p-3 select-none">
                    <div className="flex flex-col">
                        <span className="text-smallPlus">{user?.firstName ?? user?.displayName}</span>
                        <span className="text-mini text-foreground-secondary">{user?.email}</span>
                    </div>
                </div>
                <dropdown_menu_1.DropdownMenuSeparator />
                <plans_1.UsageSection open={open}/>
                <dropdown_menu_1.DropdownMenuSeparator />
                <div className="p-2">
                    {BUTTONS.map((button) => {
            const IconComponent = button.icon;
            return (<dropdown_menu_1.DropdownMenuItem key={button.label} className="cursor-pointer" onClick={button.onClick}>
                                <div className="flex flex-row center items-center group">
                                    <IconComponent className="mr-2"/>
                                    {button.label}
                                </div>
                            </dropdown_menu_1.DropdownMenuItem>);
        })}
                </div>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
};
exports.CurrentUserAvatar = CurrentUserAvatar;
//# sourceMappingURL=index.js.map