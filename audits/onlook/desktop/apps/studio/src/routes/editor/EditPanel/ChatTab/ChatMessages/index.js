"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessages = void 0;
const Context_1 = require("@/components/Context");
const chat_1 = require("@onlook/models/chat");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const AssistantMessage_1 = require("./AssistantMessage");
const ErrorMessage_1 = require("./ErrorMessage");
const StreamMessage_1 = require("./StreamMessage");
const UserMessage_1 = require("./UserMessage");
exports.ChatMessages = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const { t } = (0, react_i18next_1.useTranslation)();
    const chatMessagesRef = (0, react_2.useRef)(null);
    (0, react_2.useEffect)(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [editorEngine.chat.conversation.current?.messages.length]);
    const renderMessage = (0, react_2.useCallback)((message) => {
        let messageNode;
        switch (message.role) {
            case chat_1.ChatMessageRole.ASSISTANT:
                messageNode = <AssistantMessage_1.AssistantMessage message={message}/>;
                break;
            case chat_1.ChatMessageRole.USER:
                messageNode = <UserMessage_1.UserMessage message={message}/>;
                break;
            case chat_1.ChatMessageRole.TOOL:
                // No need to render tool results messages
                break;
        }
        return <div key={message.id}>{messageNode}</div>;
    }, []);
    // Render in reverse order to make the latest message appear at the bottom
    return (<react_1.AnimatePresence mode="wait">
            {editorEngine.chat.conversation.current &&
            editorEngine.chat.conversation.current?.messages.length !== 0 ? (<react_1.motion.div className="flex flex-col-reverse gap-2 select-text overflow-auto" ref={chatMessagesRef} key="conversation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <StreamMessage_1.StreamMessage />
                    <ErrorMessage_1.ErrorMessage />
                    {[...editorEngine.chat.conversation.current.messages]
                .reverse()
                .map((message) => renderMessage(message))}
                </react_1.motion.div>) : (
        // Only show empty state if no elements are selected
        !editorEngine.elements.selected.length && (<react_1.motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 flex flex-col items-center justify-center text-foreground-tertiary/80">
                        <div className="w-32 h-32">
                            <icons_1.Icons.EmptyState className="w-full h-full"/>
                        </div>
                        <p className="text-center text-regularPlus text-balance max-w-[300px]">
                            {t('editor.panels.edit.tabs.chat.emptyState')}
                        </p>
                    </react_1.motion.div>))}
        </react_1.AnimatePresence>);
});
//# sourceMappingURL=index.js.map