"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RightPanel = void 0;
const editor_1 = require("@/components/store/editor");
const keys_1 = require("@/i18n/keys");
const index_1 = require("@onlook/ui/icons/index");
const resizable_1 = require("@onlook/ui/resizable");
const mobx_react_lite_1 = require("mobx-react-lite");
const next_intl_1 = require("next-intl");
const react_1 = require("react");
const chat_tab_1 = require("./chat-tab");
const controls_1 = require("./chat-tab/controls");
const history_1 = require("./chat-tab/history");
const panel_dropdown_1 = require("./chat-tab/panel-dropdown");
exports.RightPanel = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const t = (0, next_intl_1.useTranslations)();
    const [isChatHistoryOpen, setIsChatHistoryOpen] = (0, react_1.useState)(false);
    const currentConversation = editorEngine.chat.conversation.current;
    const editPanelWidth = 352;
    return (<div className='flex h-full w-full transition-width duration-300 bg-background/95 group/panel border-[0.5px] backdrop-blur-xl shadow rounded-tl-xl'>
            <resizable_1.ResizablePanel side="right" defaultWidth={editPanelWidth} forceWidth={editPanelWidth} minWidth={240} maxWidth={500}>
                <div className='flex flex-col h-full'>
                    <div className="flex flex-row p-1 w-full h-10 border-b border-border ">
                        <panel_dropdown_1.ChatPanelDropdown isChatHistoryOpen={isChatHistoryOpen} setIsChatHistoryOpen={setIsChatHistoryOpen}>
                            <div className="flex items-center gap-1.5 bg-transparent p-1 px-2 text-sm text-foreground-secondary hover:text-foreground-primary cursor-pointer group">
                                <index_1.Icons.Sparkles className="mr-0.5 mb-0.5 h-4 w-4"/>
                                {t(keys_1.transKeys.editor.panels.edit.tabs.chat.name)}
                                <index_1.Icons.ChevronDown className="ml-0.5 h-3 w-3 text-muted-foreground group-hover:text-foreground-primary"/>
                            </div>
                        </panel_dropdown_1.ChatPanelDropdown>
                        <div className='ml-auto'>
                            <controls_1.ChatControls />
                        </div>
                    </div>
                    <history_1.ChatHistory isOpen={isChatHistoryOpen} onOpenChange={setIsChatHistoryOpen}/>

                    <div className='flex-1 overflow-y-auto'>
                        {currentConversation && (<chat_tab_1.ChatTab conversationId={currentConversation.id} projectId={editorEngine.projectId}/>)}
                    </div>
                </div>
            </resizable_1.ResizablePanel>
        </div>);
});
//# sourceMappingURL=index.js.map