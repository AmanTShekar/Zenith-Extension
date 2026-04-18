"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatManager = exports.FOCUS_CHAT_INPUT_EVENT = void 0;
const utils_1 = require("@/lib/utils");
const chat_1 = require("@onlook/models/chat");
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
const non_secure_1 = require("nanoid/non-secure");
const code_1 = require("./code");
const context_1 = require("./context");
const conversation_1 = require("./conversation");
const helpers_1 = require("./helpers");
const stream_1 = require("./stream");
const suggestions_1 = require("./suggestions");
exports.FOCUS_CHAT_INPUT_EVENT = 'focus-chat-input';
class ChatManager {
    editorEngine;
    projectsManager;
    userManager;
    isWaiting = false;
    conversation;
    code;
    context;
    stream;
    suggestions;
    constructor(editorEngine, projectsManager, userManager) {
        this.editorEngine = editorEngine;
        this.projectsManager = projectsManager;
        this.userManager = userManager;
        (0, mobx_1.makeAutoObservable)(this);
        this.context = new context_1.ChatContext(this.editorEngine, this.projectsManager);
        this.conversation = new conversation_1.ConversationManager(this.editorEngine, this.projectsManager);
        this.stream = new stream_1.StreamResolver();
        this.code = new code_1.ChatCodeManager(this, this.editorEngine, this.projectsManager);
        this.suggestions = new suggestions_1.SuggestionManager(this.projectsManager);
    }
    focusChatInput() {
        window.dispatchEvent(new Event(exports.FOCUS_CHAT_INPUT_EVENT));
    }
    async sendNewMessage(content) {
        if (!this.conversation.current) {
            console.error('No conversation found');
            return;
        }
        const context = await this.context.getChatContext();
        const userMessage = this.conversation.addUserMessage(content, context);
        this.conversation.current.updateName(content);
        if (!userMessage) {
            console.error('Failed to add user message');
            return;
        }
        (0, utils_1.sendAnalytics)('send chat message', {
            content,
        });
        await this.sendChatToAi(chat_1.StreamRequestType.CHAT, content);
    }
    async sendFixErrorToAi(errors) {
        if (!this.conversation.current) {
            console.error('No conversation found');
            return false;
        }
        const prompt = `How can I resolve these errors? If you propose a fix, please make it concise.`;
        const errorContexts = this.context.getMessageContext(errors);
        const projectContexts = this.context.getProjectContext();
        const userMessage = this.conversation.addUserMessage(prompt, [
            ...errorContexts,
            ...projectContexts,
        ]);
        this.conversation.current.updateName(errors[0].content);
        if (!userMessage) {
            console.error('Failed to add user message');
            return false;
        }
        (0, utils_1.sendAnalytics)('send fix error chat message', {
            errors: errors.map((e) => e.content),
        });
        await this.sendChatToAi(chat_1.StreamRequestType.ERROR_FIX, prompt);
        return true;
    }
    async sendChatToAi(requestType, userPrompt) {
        if (!this.conversation.current) {
            console.error('No conversation found');
            return;
        }
        // Save current changes before sending to AI
        this.projectsManager.versions?.createCommit(userPrompt ?? 'Save before applying code', false);
        this.stream.clearBeforeSend();
        this.isWaiting = true;
        const messages = this.conversation.current.getMessagesForStream();
        const res = await this.sendStreamRequest(messages, requestType);
        if (res) {
            this.handleChatResponse(res, requestType);
        }
        else {
            console.error('No stream response found');
        }
        this.stream.clearAfterSend();
        this.isWaiting = false;
        (0, utils_1.sendAnalytics)('receive chat response');
    }
    sendStreamRequest(messages, requestType) {
        const requestId = (0, non_secure_1.nanoid)();
        return (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SEND_CHAT_MESSAGES_STREAM, {
            messages,
            requestId,
            requestType,
        });
    }
    stopStream() {
        const requestId = (0, non_secure_1.nanoid)();
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SEND_STOP_STREAM_REQUEST, {
            requestId,
        });
        (0, utils_1.sendAnalytics)('stop chat stream');
    }
    resubmitMessage(id, newMessageContent) {
        if (!this.conversation.current) {
            console.error('No conversation found');
            return;
        }
        const message = this.conversation.current.messages.find((m) => m.id === id);
        if (!message) {
            console.error('No message found with id', id);
            return;
        }
        if (message.role !== chat_1.ChatMessageRole.USER) {
            console.error('Can only edit user messages');
            return;
        }
        message.updateStringContent(newMessageContent);
        this.conversation.current.removeAllMessagesAfter(message);
        this.sendChatToAi(chat_1.StreamRequestType.CHAT);
        (0, utils_1.sendAnalytics)('resubmit chat message');
    }
    async handleChatResponse(res, requestType) {
        if (!res) {
            console.error('No response found');
            return;
        }
        if (res.type === 'rate-limited') {
            this.handleRateLimited(res);
            return;
        }
        else if (res.type === 'error') {
            this.handleError(res);
            return;
        }
        if (!this.conversation.current) {
            console.error('No conversation found');
            return;
        }
        if (res.usage) {
            this.conversation.current.updateTokenUsage(res.usage);
        }
        if (this.conversation.current.needsSummary()) {
            await this.conversation.generateConversationSummary();
        }
        this.handleNewCoreMessages(res.payload);
        if (requestType === chat_1.StreamRequestType.CHAT &&
            this.conversation.current?.messages &&
            this.conversation.current.messages.length > 0) {
            this.suggestions.shouldHide = true;
            this.suggestions.generateNextSuggestions(this.conversation.current.getMessagesForStream());
        }
        this.context.clearAttachments();
    }
    handleNewCoreMessages(messages) {
        for (const message of messages) {
            if (message.role === chat_1.ChatMessageRole.ASSISTANT) {
                const assistantMessage = this.conversation.addCoreAssistantMessage(message);
                if (!assistantMessage) {
                    console.error('Failed to add assistant message');
                }
                else {
                    this.autoApplyCode(assistantMessage);
                }
            }
            else if (message.role === chat_1.ChatMessageRole.USER) {
                const userMessage = this.conversation.addCoreUserMessage(message);
                if (!userMessage) {
                    console.error('Failed to add user message');
                }
            }
            else if (message.role === chat_1.ChatMessageRole.TOOL) {
                const toolMessage = this.conversation.addCoreToolMessage(message);
                if (!toolMessage) {
                    console.error('Failed to add tool message');
                }
            }
        }
    }
    autoApplyCode(assistantMessage) {
        if (this.userManager.settings.settings?.chat?.autoApplyCode) {
            setTimeout(() => {
                this.code.applyCode(assistantMessage.id);
            }, 100);
        }
    }
    handleRateLimited(res) {
        this.stream.errorMessage = res.rateLimitResult?.reason;
        this.stream.rateLimited = res.rateLimitResult ?? null;
        (0, utils_1.sendAnalytics)('rate limited', {
            rateLimitResult: res.rateLimitResult,
        });
    }
    handleError(res) {
        console.error('Error found in chat response', res.message);
        if ((0, helpers_1.isPromptTooLongError)(res.message)) {
            this.stream.errorMessage = helpers_1.PROMPT_TOO_LONG_ERROR;
        }
        else {
            this.stream.errorMessage = res.message;
        }
        (0, utils_1.sendAnalytics)('chat error', {
            content: res.message,
        });
    }
    dispose() {
        this.stream.dispose();
        this.code?.dispose();
        this.context?.dispose();
        if (this.conversation) {
            this.conversation.current = null;
        }
    }
}
exports.ChatManager = ChatManager;
//# sourceMappingURL=index.js.map