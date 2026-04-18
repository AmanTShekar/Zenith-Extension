"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpDropdown = void 0;
const Context_1 = require("@/components/Context");
const ThemeProvider_1 = require("@/components/ThemeProvider");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
exports.HelpDropdown = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const userManager = (0, Context_1.useUserManager)();
    const { theme, setTheme } = (0, ThemeProvider_1.useTheme)();
    const [isDropdownOpen, setIsDropdownOpen] = (0, react_1.useState)(false);
    const { t } = (0, react_i18next_1.useTranslation)();
    return (<dropdown_menu_1.DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button className="w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 p-2 text-muted-foreground hover:text-foreground">
                    <icons_1.Icons.QuestionMarkCircled className="w-5 h-5"/>
                </button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end" side="left" alignOffset={55} sideOffset={-55} className="w-48">
                <dropdown_menu_1.DropdownMenuItem onClick={() => (0, utils_1.invokeMainChannel)(constants_1.MainChannels.RELOAD_APP)}>
                    <icons_1.Icons.Reload className="w-4 h-4 mr-2"/>
                    {t('help.menu.reloadOnlook')}
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuSub>
                    <dropdown_menu_1.DropdownMenuSubTrigger className="text-sm">
                        {theme === constants_1.Theme.Dark && <icons_1.Icons.Moon className="w-4 h-4 mr-2"/>}
                        {theme === constants_1.Theme.Light && <icons_1.Icons.Sun className="w-4 h-4 mr-2"/>}
                        {theme === constants_1.Theme.System && <icons_1.Icons.Laptop className="w-4 h-4 mr-2"/>}
                        {t('help.menu.theme.title')}
                    </dropdown_menu_1.DropdownMenuSubTrigger>
                    <dropdown_menu_1.DropdownMenuSubContent className="w-32 ml-2">
                        <dropdown_menu_1.DropdownMenuItem className="text-sm" onClick={() => {
            setTheme(constants_1.Theme.Light);
        }}>
                            <icons_1.Icons.Sun className="w-4 h-4 mr-2"/>
                            {t('help.menu.theme.light')}
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem className="text-sm" onClick={() => {
            setTheme(constants_1.Theme.Dark);
        }}>
                            <icons_1.Icons.Moon className="w-4 h-4 mr-2"/>
                            {t('help.menu.theme.dark')}
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem className="text-sm" onClick={() => {
            setTheme(constants_1.Theme.System);
        }}>
                            <icons_1.Icons.Laptop className="w-4 h-4 mr-2"/>
                            {t('help.menu.theme.system')}
                        </dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuSubContent>
                </dropdown_menu_1.DropdownMenuSub>
                <dropdown_menu_1.DropdownMenuSub>
                    <dropdown_menu_1.DropdownMenuSubTrigger className="text-sm">
                        <icons_1.Icons.Globe className="w-4 h-4 mr-2"/>
                        {t('help.menu.language')}
                    </dropdown_menu_1.DropdownMenuSubTrigger>
                    <dropdown_menu_1.DropdownMenuSubContent className="w-32 ml-2">
                        {Object.values(constants_1.Language).map((language) => (<dropdown_menu_1.DropdownMenuItem key={language} className="text-sm" onClick={() => userManager.language.update(language)}>
                                {constants_1.LANGUAGE_DISPLAY_NAMES[language]}
                            </dropdown_menu_1.DropdownMenuItem>))}
                    </dropdown_menu_1.DropdownMenuSubContent>
                </dropdown_menu_1.DropdownMenuSub>
                <dropdown_menu_1.DropdownMenuItem className="text-sm" onClick={() => (editorEngine.isHotkeysOpen = true)}>
                    <icons_1.Icons.Keyboard className="w-4 h-4 mr-2"/>
                    {t('help.menu.shortcuts')}
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem className="text-sm" onClick={() => (editorEngine.isSettingsOpen = true)}>
                    <icons_1.Icons.Gear className="w-4 h-4 mr-2"/>
                    {t('help.menu.openSettings')}
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuSub>
                    <dropdown_menu_1.DropdownMenuSubTrigger className="text-sm">
                        <icons_1.Icons.EnvelopeClosed className="w-4 h-4 mr-2"/>
                        {t('help.menu.contactUs.title')}
                    </dropdown_menu_1.DropdownMenuSubTrigger>
                    <dropdown_menu_1.DropdownMenuSubContent className="w-48 ml-2">
                        <dropdown_menu_1.DropdownMenuItem onClick={() => window.open('https://onlook.com', '_blank')}>
                            <icons_1.Icons.Globe className="w-4 h-4 mr-2"/>
                            {t('help.menu.contactUs.website')}
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem onClick={() => window.open(constants_1.Links.DISCORD, '_blank')}>
                            <icons_1.Icons.DiscordLogo className="w-4 h-4 mr-2"/>
                            {t('help.menu.contactUs.discord')}
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem onClick={() => window.open(constants_1.Links.GITHUB, '_blank')}>
                            <icons_1.Icons.GitHubLogo className="w-4 h-4 mr-2"/>
                            {t('help.menu.contactUs.github')}
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem onClick={() => (0, utils_1.invokeMainChannel)(constants_1.MainChannels.OPEN_EXTERNAL_WINDOW, 'mailto:contact@onlook.com')}>
                            <icons_1.Icons.EnvelopeClosed className="w-4 h-4 mr-2"/>
                            {t('help.menu.contactUs.email')}
                        </dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuSubContent>
                </dropdown_menu_1.DropdownMenuSub>
                <dropdown_menu_1.DropdownMenuItem onClick={() => window.open(constants_1.Links.OPEN_ISSUE, '_blank')}>
                    <icons_1.Icons.ExclamationTriangle className="w-4 h-4 mr-2"/>
                    {t('help.menu.reportIssue')}
                </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=HelpDropdown.js.map