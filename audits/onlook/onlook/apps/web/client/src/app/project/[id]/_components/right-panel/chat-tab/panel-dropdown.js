"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatPanelDropdown = void 0;
const editor_1 = require("@/components/store/editor");
const keys_1 = require("@/i18n/keys");
const react_1 = require("@/trpc/react");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const lodash_1 = require("lodash");
const mobx_react_lite_1 = require("mobx-react-lite");
const next_intl_1 = require("next-intl");
const react_2 = require("react");
exports.ChatPanelDropdown = (0, mobx_react_lite_1.observer)(({ children, isChatHistoryOpen, setIsChatHistoryOpen, }) => {
    const t = (0, next_intl_1.useTranslations)();
    const { mutate: updateSettings } = react_1.api.user.settings.upsert.useMutation({
        onSuccess: () => {
            void apiUtils.user.settings.get.invalidate();
        },
    });
    const { data: userSettings } = react_1.api.user.settings.get.useQuery();
    const apiUtils = react_1.api.useUtils();
    const editorEngine = (0, editor_1.useEditorEngine)();
    const debouncedUpdateSettings = (0, react_2.useMemo)(() => (0, lodash_1.debounce)((settings) => {
        updateSettings({
            ...settings,
        });
    }, 300), [updateSettings]);
    (0, react_2.useEffect)(() => {
        return () => {
            debouncedUpdateSettings.cancel();
        };
    }, [debouncedUpdateSettings]);
    const updateChatSettings = (0, react_2.useCallback)((e, settings) => {
        e.preventDefault();
        apiUtils.user.settings.get.setData(undefined, (oldData) => {
            if (!oldData)
                return oldData;
            return {
                ...oldData,
                chat: {
                    ...oldData.chat,
                    ...settings,
                },
            };
        });
        debouncedUpdateSettings(settings);
    }, [apiUtils.user.settings.get, debouncedUpdateSettings]);
    return (<dropdown_menu_1.DropdownMenu modal={false}>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
                <div className="flex items-center">{children}</div>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent className="min-w-[220px]">
                <dropdown_menu_1.DropdownMenuItem className="flex items-center py-1.5" onClick={(e) => {
            updateChatSettings(e, {
                showSuggestions: !userSettings?.chat.showSuggestions,
            });
        }}>
                    <icons_1.Icons.Check className={(0, utils_1.cn)('mr-2 h-4 w-4', userSettings?.chat.showSuggestions ? 'opacity-100' : 'opacity-0')}/>
                    {t(keys_1.transKeys.editor.panels.edit.tabs.chat.settings.showSuggestions)}
                </dropdown_menu_1.DropdownMenuItem>

                <dropdown_menu_1.DropdownMenuItem className="flex items-center py-1.5" onClick={(e) => {
            updateChatSettings(e, {
                showMiniChat: !userSettings?.chat.showMiniChat,
            });
        }}>
                    <icons_1.Icons.Check className={(0, utils_1.cn)('mr-2 h-4 w-4', userSettings?.chat.showMiniChat ? 'opacity-100' : 'opacity-0')}/>
                    {t(keys_1.transKeys.editor.panels.edit.tabs.chat.settings.showMiniChat)}
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuItem onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}>
                    <icons_1.Icons.CounterClockwiseClock className="mr-2 h-4 w-4"/>
                    {t(keys_1.transKeys.editor.panels.edit.tabs.chat.controls.history)}
                </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=panel-dropdown.js.map