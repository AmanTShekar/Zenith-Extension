"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditPanel = void 0;
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const constants_1 = require("@onlook/models/constants");
const ide_1 = require("@onlook/models/ide");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const resizable_1 = __importDefault(require("@onlook/ui/resizable"));
const separator_1 = require("@onlook/ui/separator");
const tabs_1 = require("@onlook/ui/tabs");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const ChatTab_1 = require("./ChatTab");
const ChatControls_1 = require("./ChatTab/ChatControls");
const ChatHistory_1 = require("./ChatTab/ChatControls/ChatHistory");
const DevTab_1 = require("./DevTab");
const PropsTab_1 = require("./PropsTab");
const StylesTab_1 = require("./StylesTab");
const EDIT_PANEL_WIDTHS = {
    [models_1.EditorTabValue.CHAT]: 352,
    [models_1.EditorTabValue.PROPS]: 295,
    [models_1.EditorTabValue.STYLES]: 240,
    [models_1.EditorTabValue.DEV]: 700,
};
const DEV_PANEL_MIN_WIDTH = 300;
const DEV_PANEL_MAX_WIDTH = 1000;
exports.EditPanel = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const userManager = (0, Context_1.useUserManager)();
    const { t } = (0, react_i18next_1.useTranslation)();
    const currentIdeType = userManager.settings.settings?.editor?.ideType;
    const isOnlookIde = currentIdeType === ide_1.IdeType.ONLOOK;
    const chatSettings = userManager.settings.settings?.chat || constants_1.DefaultSettings.CHAT_SETTINGS;
    const [isOpen, setIsOpen] = (0, react_1.useState)(true);
    const [selectedTab, setSelectedTab] = (0, react_1.useState)(editorEngine.editPanelTab);
    const [isChatHistoryOpen, setIsChatHistoryOpen] = (0, react_1.useState)(false);
    const editPanelWidth = EDIT_PANEL_WIDTHS[selectedTab];
    (0, react_1.useEffect)(() => {
        tabChange(editorEngine.editPanelTab);
    }, [editorEngine.editPanelTab]);
    // Listens for SHOW_EDITOR_TAB event to switch to DevTab when files are opened via Onlook IDE
    (0, react_1.useEffect)(() => {
        const handleShowEditorTab = (_event, tabValue) => {
            if (tabValue === models_1.EditorTabValue.DEV) {
                tabChange(models_1.EditorTabValue.DEV);
            }
        };
        window.api.on(constants_1.MainChannels.SHOW_EDITOR_TAB, handleShowEditorTab);
        return () => {
            window.api.removeListener(constants_1.MainChannels.SHOW_EDITOR_TAB, handleShowEditorTab);
        };
    }, []);
    function renderEmptyState() {
        return (<div className="text-sm pt-96 flex items-center justify-center text-center opacity-70 px-4">
                {t('editor.panels.edit.tabs.styles.emptyState')}
            </div>);
    }
    function tabChange(value) {
        editorEngine.editPanelTab = value;
        setSelectedTab(value);
        setIsOpen(true);
    }
    function renderTabs() {
        return (<tabs_1.Tabs onValueChange={(value) => tabChange(value)} value={selectedTab}>
                <tabs_1.TabsList className={(0, utils_1.cn)('bg-transparent w-full select-none justify-between items-center px-2', isOpen ? 'h-11' : 'h-full')}>
                    <div className="flex flex-row items-center gap-2 ">
                        <button className="text-default rounded-lg p-2 bg-transparent hover:text-foreground-hover hidden" onClick={() => setIsOpen(false)}>
                            <icons_1.Icons.PinRight />
                        </button>
                        <dropdown_menu_1.DropdownMenu>
                            <dropdown_menu_1.DropdownMenuTrigger asChild disabled={selectedTab !== models_1.EditorTabValue.CHAT}>
                                <div className="flex items-center">
                                    <tabs_1.TabsTrigger className="bg-transparent py-2 px-1 text-small hover:text-foreground-hover" value={models_1.EditorTabValue.CHAT}>
                                        <icons_1.Icons.Sparkles className="mr-1.5 mb-0.5 h-4 w-4"/>
                                        {t('editor.panels.edit.tabs.chat.name')}
                                        <icons_1.Icons.ChevronDown className="ml-1 h-3 w-3 text-muted-foreground"/>
                                    </tabs_1.TabsTrigger>
                                </div>
                            </dropdown_menu_1.DropdownMenuTrigger>
                            <dropdown_menu_1.DropdownMenuContent className="min-w-[220px]">
                                <dropdown_menu_1.DropdownMenuItem className="flex items-center py-1.5" onClick={(e) => {
                e.preventDefault();
                userManager.settings.updateChat({
                    showSuggestions: !chatSettings.showSuggestions,
                });
            }}>
                                    <icons_1.Icons.Check className={(0, utils_1.cn)('mr-2 h-4 w-4', chatSettings.showSuggestions
                ? 'opacity-100'
                : 'opacity-0')}/>
                                    Show suggestions
                                </dropdown_menu_1.DropdownMenuItem>
                                <dropdown_menu_1.DropdownMenuItem className="flex items-center py-1.5" onClick={(e) => {
                e.preventDefault();
                userManager.settings.updateChat({
                    autoApplyCode: !chatSettings.autoApplyCode,
                });
            }}>
                                    <icons_1.Icons.Check className={(0, utils_1.cn)('mr-2 h-4 w-4', chatSettings.autoApplyCode
                ? 'opacity-100'
                : 'opacity-0')}/>
                                    Auto-apply results
                                </dropdown_menu_1.DropdownMenuItem>
                                <dropdown_menu_1.DropdownMenuItem className="flex items-center py-1.5" onClick={(e) => {
                e.preventDefault();
                userManager.settings.updateChat({
                    expandCodeBlocks: !chatSettings.expandCodeBlocks,
                });
            }}>
                                    <icons_1.Icons.Check className={(0, utils_1.cn)('mr-2 h-4 w-4', chatSettings.expandCodeBlocks
                ? 'opacity-100'
                : 'opacity-0')}/>
                                    Show code while rendering
                                </dropdown_menu_1.DropdownMenuItem>
                                <dropdown_menu_1.DropdownMenuItem className="flex items-center py-1.5" onClick={(e) => {
                e.preventDefault();
                userManager.settings.updateChat({
                    showMiniChat: !chatSettings.showMiniChat,
                });
            }}>
                                    <icons_1.Icons.Check className={(0, utils_1.cn)('mr-2 h-4 w-4', chatSettings.showMiniChat ? 'opacity-100' : 'opacity-0')}/>
                                    Show mini chat
                                </dropdown_menu_1.DropdownMenuItem>
                                <dropdown_menu_1.DropdownMenuSeparator />
                                <dropdown_menu_1.DropdownMenuItem onClick={() => {
                setIsChatHistoryOpen(!isChatHistoryOpen);
            }}>
                                    <icons_1.Icons.CounterClockwiseClock className="mr-2 h-4 w-4"/>
                                    Chat History
                                </dropdown_menu_1.DropdownMenuItem>
                            </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                        <tabs_1.TabsTrigger className="bg-transparent py-2 px-1 text-small hover:text-foreground-hover" value={models_1.EditorTabValue.STYLES}>
                            <icons_1.Icons.Styles className="mr-1.5 h-4 w-4"/>
                            {t('editor.panels.edit.tabs.styles.name')}
                        </tabs_1.TabsTrigger>
                        <tabs_1.TabsTrigger className="bg-transparent py-2 px-1 text-xs hover:text-foreground-hover hidden" value={models_1.EditorTabValue.PROPS}>
                            <icons_1.Icons.MixerHorizontal className="mr-1.5 mb-0.5"/>
                            Props
                        </tabs_1.TabsTrigger>
                        {isOnlookIde && (<tabs_1.TabsTrigger className="bg-transparent py-2 px-1 text-small hover:text-foreground-hover" value={models_1.EditorTabValue.DEV}>
                                <icons_1.Icons.Code className="mr-1.5 h-4 w-4"/>
                                Code
                            </tabs_1.TabsTrigger>)}
                    </div>
                    {selectedTab === models_1.EditorTabValue.CHAT && <ChatControls_1.ChatControls />}
                </tabs_1.TabsList>
                <separator_1.Separator className="mt-0"/>
                <ChatHistory_1.ChatHistory isOpen={isChatHistoryOpen} onOpenChange={setIsChatHistoryOpen}/>
                <div className={`h-[calc(100vh-7.75rem)] ${selectedTab === models_1.EditorTabValue.DEV ? 'overflow-hidden' : 'overflow-auto'}`}>
                    <tabs_1.TabsContent value={models_1.EditorTabValue.CHAT}>
                        <ChatTab_1.ChatTab />
                    </tabs_1.TabsContent>
                    <tabs_1.TabsContent value={models_1.EditorTabValue.PROPS}>
                        <PropsTab_1.PropsTab />
                    </tabs_1.TabsContent>
                    <tabs_1.TabsContent value={models_1.EditorTabValue.STYLES}>
                        {editorEngine.elements.selected.length > 0 ? (<StylesTab_1.StylesTab />) : (renderEmptyState())}
                    </tabs_1.TabsContent>
                    {/* Empty TabsContent to make the tabs system work, but actual content is rendered separately */}
                    {isOnlookIde && <tabs_1.TabsContent value={models_1.EditorTabValue.DEV}></tabs_1.TabsContent>}

                    {/* Keep DevTab mounted but control visibility based on selected tab so we dont lose the state when switching tabs */}
                    {isOnlookIde && (<div className={selectedTab === models_1.EditorTabValue.DEV ? 'block h-full' : 'hidden'}>
                            <DevTab_1.DevTab />
                        </div>)}
                </div>
            </tabs_1.Tabs>);
    }
    return (<div className={(0, utils_1.cn)('flex flex-row h-full', editorEngine.mode === models_1.EditorMode.PREVIEW ? 'hidden' : 'visible')}>
            <resizable_1.default side="right" defaultWidth={editPanelWidth} forceWidth={editPanelWidth} minWidth={selectedTab === models_1.EditorTabValue.DEV ? DEV_PANEL_MIN_WIDTH : 240} maxWidth={selectedTab === models_1.EditorTabValue.DEV ? DEV_PANEL_MAX_WIDTH : 700}>
                <div id="editor-panel" className={(0, utils_1.cn)('w-full transition-width duration-300 opacity-100 bg-background/95 overflow-hidden group/panel h-full', editorEngine.mode === models_1.EditorMode.PREVIEW ? 'hidden' : 'visible', 'rounded-tl-xl')}>
                    <div className={(0, utils_1.cn)('border-[0.5px] backdrop-blur-xl shadow h-full relative transition-opacity duration-300', isOpen ? 'opacity-100 visible' : 'opacity-0 invisible')}>
                        {renderTabs()}
                    </div>
                </div>
            </resizable_1.default>
        </div>);
});
//# sourceMappingURL=index.js.map