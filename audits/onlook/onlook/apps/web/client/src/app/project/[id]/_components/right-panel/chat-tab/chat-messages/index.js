"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessages = void 0;
const editor_1 = require("@/components/store/editor");
const keys_1 = require("@/i18n/keys");
const ai_elements_1 = require("@onlook/ui/ai-elements");
const icons_1 = require("@onlook/ui/icons");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const next_intl_1 = require("next-intl");
const react_1 = require("react");
const assistant_message_1 = require("./assistant-message");
const error_message_1 = require("./error-message");
const user_message_1 = require("./user-message");
exports.ChatMessages = (0, mobx_react_lite_1.observer)(({ messages, onEditMessage, isStreaming, error, }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const t = (0, next_intl_1.useTranslations)();
    const renderMessage = (0, react_1.useCallback)((message) => {
        let messageNode;
        switch (message.role) {
            case 'assistant':
                messageNode = <assistant_message_1.AssistantMessage key={message.id} message={message} isStreaming={isStreaming}/>;
                break;
            case 'user':
                messageNode = (<user_message_1.UserMessage key={message.id} onEditMessage={onEditMessage} message={message}/>);
                break;
            case 'system':
                messageNode = null;
                break;
            default:
                (0, utility_1.assertNever)(message.role);
        }
        return <div key={message.id} className="my-2">{messageNode}</div>;
    }, [onEditMessage, isStreaming]);
    if (!messages || messages.length === 0) {
        return (!editorEngine.elements.selected.length && (<div className="flex-1 flex flex-col items-center justify-center text-foreground-tertiary/80 h-full">
                    <icons_1.Icons.EmptyState className="size-32"/>
                    <p className="text-center text-regularPlus text-balance max-w-[300px]">
                        {t(keys_1.transKeys.editor.panels.edit.tabs.chat.emptyState)}
                    </p>
                </div>));
    }
    return (<ai_elements_1.Conversation>
            <ai_elements_1.ConversationContent className="p-0 m-0">
                {messages.map((message) => renderMessage(message))}
                {error && <error_message_1.ErrorMessage error={error}/>}
                {isStreaming && <div className="flex w-full h-full flex-row items-center gap-2 px-4 my-2 text-small content-start text-foreground-secondary">
                    <icons_1.Icons.LoadingSpinner className="animate-spin"/>
                    <p>Thinking ...</p>
                </div>}
            </ai_elements_1.ConversationContent>
            <ai_elements_1.ConversationScrollButton />
        </ai_elements_1.Conversation>);
});
//# sourceMappingURL=index.js.map