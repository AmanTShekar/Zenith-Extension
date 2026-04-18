"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatTabContent = void 0;
const use_chat_1 = require("../../../../_hooks/use-chat");
const chat_input_1 = require("../chat-input");
const chat_messages_1 = require("../chat-messages");
const error_1 = require("../error");
const ChatTabContent = ({ conversationId, projectId, initialMessages, }) => {
    const { isStreaming, sendMessage, editMessage, messages, error, stop, queuedMessages, removeFromQueue } = (0, use_chat_1.useChat)({
        conversationId,
        projectId,
        initialMessages,
    });
    return (<div className="flex flex-col h-full justify-end gap-2 pt-2">
            <chat_messages_1.ChatMessages messages={messages} isStreaming={isStreaming} error={error} onEditMessage={editMessage}/>
            <error_1.ErrorSection isStreaming={isStreaming} onSendMessage={sendMessage}/>
            <chat_input_1.ChatInput messages={messages} isStreaming={isStreaming} onStop={stop} onSendMessage={sendMessage} queuedMessages={queuedMessages} removeFromQueue={removeFromQueue}/>
        </div>);
};
exports.ChatTabContent = ChatTabContent;
//# sourceMappingURL=index.js.map