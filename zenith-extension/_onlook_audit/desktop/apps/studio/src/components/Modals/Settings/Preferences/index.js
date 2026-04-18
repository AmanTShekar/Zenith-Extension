"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const ThemeProvider_1 = require("@/components/ThemeProvider");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const ide_1 = require("@onlook/models/ide");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_i18next_1 = require("react-i18next");
const ide_2 = require("/common/ide");
const PreferencesTab = (0, mobx_react_lite_1.observer)(() => {
    const userManager = (0, Context_1.useUserManager)();
    const { theme, setTheme } = (0, ThemeProvider_1.useTheme)();
    const { i18n } = (0, react_i18next_1.useTranslation)();
    const ide = ide_2.IDE.fromType(userManager.settings.settings?.editor?.ideType || ide_1.DEFAULT_IDE);
    const isAnalyticsEnabled = userManager.settings.settings?.enableAnalytics || false;
    const shouldWarnDelete = userManager.settings.settings?.editor?.shouldWarnDelete ?? true;
    const IDEIcon = icons_1.Icons[ide.icon];
    function updateIde(ide) {
        userManager.settings.updateEditor({ ideType: ide.type });
    }
    function updateAnalytics(enabled) {
        userManager.settings.update({ enableAnalytics: enabled });
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.UPDATE_ANALYTICS_PREFERENCE, enabled);
    }
    function updateDeleteWarning(enabled) {
        userManager.settings.updateEditor({ shouldWarnDelete: enabled });
    }
    return (<div className="flex flex-col gap-8 p-6">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <p className="text-largePlus">Language</p>
                    <p className="text-foreground-onlook text-small">
                        Choose your preferred language
                    </p>
                </div>
                <dropdown_menu_1.DropdownMenu>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button variant="outline" className="text-smallPlus min-w-[150px]">
                            {constants_1.LANGUAGE_DISPLAY_NAMES[i18n.language] || 'English'}
                            <icons_1.Icons.ChevronDown className="ml-auto"/>
                        </button_1.Button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent className="min-w-[150px]">
                        {Object.entries(constants_1.LANGUAGE_DISPLAY_NAMES).map(([code, name]) => (<dropdown_menu_1.DropdownMenuItem key={code} onClick={() => userManager.language.update(code)}>
                                <span>{name}</span>
                                {i18n.language === code && (<icons_1.Icons.CheckCircled className="ml-auto"/>)}
                            </dropdown_menu_1.DropdownMenuItem>))}
                    </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <p className="text-largePlus">Theme</p>
                    <p className="text-foreground-onlook text-small">
                        Choose your preferred appearance
                    </p>
                </div>
                <dropdown_menu_1.DropdownMenu>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button variant="outline" className="text-smallPlus min-w-[150px]">
                            {theme === constants_1.Theme.Dark && <icons_1.Icons.Moon className="mr-2 h-4 w-4"/>}
                            {theme === constants_1.Theme.Light && <icons_1.Icons.Sun className="mr-2 h-4 w-4"/>}
                            {theme === constants_1.Theme.System && <icons_1.Icons.Laptop className="mr-2 h-4 w-4"/>}
                            <span className="capitalize">{theme}</span>
                            <icons_1.Icons.ChevronDown className="ml-auto"/>
                        </button_1.Button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent className="min-w-[150px]">
                        <dropdown_menu_1.DropdownMenuItem onClick={() => setTheme(constants_1.Theme.Light)}>
                            <icons_1.Icons.Sun className="mr-2 h-4 w-4"/>
                            <span>Light</span>
                            {theme === constants_1.Theme.Light && <icons_1.Icons.CheckCircled className="ml-auto"/>}
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem onClick={() => setTheme(constants_1.Theme.Dark)}>
                            <icons_1.Icons.Moon className="mr-2 h-4 w-4"/>
                            <span>Dark</span>
                            {theme === constants_1.Theme.Dark && <icons_1.Icons.CheckCircled className="ml-auto"/>}
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem onClick={() => setTheme(constants_1.Theme.System)}>
                            <icons_1.Icons.Laptop className="mr-2 h-4 w-4"/>
                            <span>System</span>
                            {theme === constants_1.Theme.System && <icons_1.Icons.CheckCircled className="ml-auto"/>}
                        </dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <p className="text-largePlus">Code Editor</p>
                    <p className="text-foreground-onlook text-small">
                        Choose the IDE where you open your code in
                    </p>
                </div>
                <dropdown_menu_1.DropdownMenu>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button variant="outline" className="min-w-[150px]">
                            <IDEIcon className="text-default h-3 w-3 mr-2"/>
                            <span className="smallPlus">{ide.displayName}</span>
                            <icons_1.Icons.ChevronDown className="ml-auto"/>
                        </button_1.Button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent>
                        {ide_2.IDE.getAll().map((item) => {
            const ItemIcon = icons_1.Icons[item.icon];
            return (<dropdown_menu_1.DropdownMenuItem key={item.displayName} className="text-smallPlus min-w-[140px]" onSelect={() => {
                    updateIde(item);
                }}>
                                    <ItemIcon className="text-default h-3 w-3 mr-2"/>
                                    <span>{item.displayName}</span>
                                    {ide === item && <icons_1.Icons.CheckCircled className="ml-auto"/>}
                                </dropdown_menu_1.DropdownMenuItem>);
        })}
                    </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>
            </div>
            <div className=" flex justify-between items-center gap-4">
                <div className=" flex flex-col gap-2">
                    <p className="text-largePlus">{'Warn before delete'}</p>
                    <p className="text-foreground-onlook text-small">
                        {'This adds a warning before deleting elements in the editor'}
                    </p>
                </div>
                <dropdown_menu_1.DropdownMenu>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button variant="outline" className="text-smallPlus min-w-[150px]">
                            {shouldWarnDelete ? 'On' : 'Off'}
                            <icons_1.Icons.ChevronDown className="ml-auto"/>
                        </button_1.Button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent className="text-smallPlus min-w-[150px]">
                        <dropdown_menu_1.DropdownMenuItem onClick={() => updateDeleteWarning(true)}>
                            {'Warning On'}
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem onClick={() => updateDeleteWarning(false)}>
                            {'Warning Off'}
                        </dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>
            </div>
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col gap-2">
                    <p className="text-largePlus">Analytics</p>
                    <p className="text-foreground-onlook text-small">
                        This helps our small team of two know what we need to improve with the
                        product.
                    </p>
                </div>
                <dropdown_menu_1.DropdownMenu>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button variant="outline" className="text-smallPlus min-w-[150px]">
                            {isAnalyticsEnabled ? 'On' : 'Off'}
                            <icons_1.Icons.ChevronDown className="ml-auto"/>
                        </button_1.Button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent className="text-smallPlus min-w-[150px]">
                        <dropdown_menu_1.DropdownMenuItem onClick={() => updateAnalytics(true)}>
                            {'Analytics On'}
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem onClick={() => updateAnalytics(false)}>
                            {'Analytics Off'}
                        </dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>
            </div>
        </div>);
});
exports.default = PreferencesTab;
//# sourceMappingURL=index.js.map