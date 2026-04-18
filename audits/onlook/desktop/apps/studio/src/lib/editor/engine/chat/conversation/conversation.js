"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatConversationImpl = void 0;
const chat_1 = require("@onlook/models/chat");
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
const non_secure_1 = require("nanoid/non-secure");
const assistant_1 = require("../message/assistant");
const user_1 = require("../message/user");
class ChatConversationImpl {
    id;
    projectId;
    displayName = null;
    messages;
    createdAt;
    updatedAt;
    // Summary
    TOKEN_LIMIT = 200000;
    SUMMARY_THRESHOLD = this.TOKEN_LIMIT * 0.75; // Trigger at 75% of token limit
    RETAINED_MESSAGES = 10;
    summaryMessage = null;
    tokenUsage = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
    };
    constructor(projectId, messages) {
        (0, mobx_1.makeAutoObservable)(this);
        this.id = (0, non_secure_1.nanoid)();
        this.projectId = projectId;
        this.messages = messages;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
    getMessageById(id) {
        return this.messages.find((m) => m.id === id);
    }
    static fromJSON(data) {
        const conversation = new ChatConversationImpl(data.projectId, []);
        conversation.id = data.id;
        conversation.displayName = data.displayName;
        conversation.messages = data.messages
            .map((m) => {
            if (m.role === chat_1.ChatMessageRole.USER) {
                return user_1.UserChatMessageImpl.fromJSON(m);
            }
            else if (m.role === chat_1.ChatMessageRole.ASSISTANT) {
                return assistant_1.AssistantChatMessageImpl.fromJSON(m);
            }
            else {
                console.error('Invalid message role', m.role);
                return null;
            }
        })
            .filter((m) => m !== null);
        conversation.createdAt = data.createdAt;
        conversation.updatedAt = data.updatedAt;
        if (data.tokenUsage) {
            conversation.tokenUsage = data.tokenUsage;
        }
        if (data.summaryMessage) {
            conversation.summaryMessage = assistant_1.AssistantChatMessageImpl.fromJSON(data.summaryMessage);
        }
        return conversation;
    }
    needsSummary() {
        return this.tokenUsage.totalTokens > this.SUMMARY_THRESHOLD;
    }
    updateTokenUsage(usage) {
        this.tokenUsage = usage;
    }
    getMessagesForStream() {
        const messages = [];
        if (this.summaryMessage) {
            messages.push(this.summaryMessage.toCoreMessage());
            const retainedMessages = this.messages.slice(-this.RETAINED_MESSAGES);
            messages.push(...retainedMessages.map((m) => m.toCoreMessage()));
        }
        else {
            messages.push(...this.messages.map((m) => m.toCoreMessage()));
        }
        return this.validateAndFixToolMessages(messages);
    }
    /**
     * Validates that each tool_use message has a corresponding tool_result message after it.
     * If not, a stub tool_result message will be created to prevent API errors.
     */
    validateAndFixToolMessages(messages) {
        try {
            const result = [];
            for (let i = 0; i < messages.length; i++) {
                const currentMessage = messages[i];
                result.push(currentMessage);
                if (currentMessage.role === 'assistant' && Array.isArray(currentMessage.content)) {
                    const toolCallParts = currentMessage.content.filter((part) => part.type === 'tool-call');
                    if (toolCallParts.length > 0) {
                        const nextMessage = i + 1 < messages.length ? messages[i + 1] : null;
                        const missingToolResults = [];
                        for (const toolCall of toolCallParts) {
                            let hasCorrespondingResult = false;
                            if (nextMessage?.role === 'tool' &&
                                Array.isArray(nextMessage.content)) {
                                hasCorrespondingResult = nextMessage.content.some((part) => part.type === 'tool-result' &&
                                    part.toolCallId === toolCall.toolCallId);
                            }
                            if (!hasCorrespondingResult) {
                                console.error(`Missing tool_result for tool call ${toolCall.toolCallId} (${toolCall.toolName}). Adding stub result.`);
                                missingToolResults.push({
                                    type: 'tool-result',
                                    toolCallId: toolCall.toolCallId,
                                    toolName: toolCall.toolName,
                                    result: 'success',
                                    isError: true,
                                });
                            }
                        }
                        if (missingToolResults.length > 0) {
                            console.warn(`Adding ${missingToolResults.length} stub tool result(s) for message without corresponding tool_result`);
                            result.push({
                                role: 'tool',
                                content: missingToolResults,
                            });
                        }
                    }
                }
            }
            return result;
        }
        catch (error) {
            console.error('Error validating and fixing tool messages', error);
            return messages;
        }
    }
    setSummaryMessage(content) {
        this.summaryMessage = new assistant_1.AssistantChatMessageImpl(`Technical Summary of Previous Conversations:\n${content}`);
    }
    appendMessage(message) {
        this.messages = [...this.messages, message];
        this.updatedAt = new Date().toISOString();
    }
    removeAllMessagesAfter(message) {
        const index = this.messages.findIndex((m) => m.id === message.id);
        this.messages = this.messages.slice(0, index + 1);
        this.updatedAt = new Date().toISOString();
    }
    updateName(name, override = false) {
        if (override || !this.displayName) {
            this.displayName = name.slice(0, constants_1.MAX_NAME_LENGTH);
        }
    }
    getLastUserMessage() {
        return this.messages.findLast((message) => message.role === chat_1.ChatMessageRole.USER);
    }
    updateMessage(message) {
        const index = this.messages.findIndex((m) => m.id === message.id);
        this.messages[index] = message;
        this.updatedAt = new Date().toISOString();
        this.messages = [...this.messages];
    }
    updateCodeReverted(id) {
        this.messages = [...this.messages];
    }
}
exports.ChatConversationImpl = ChatConversationImpl;
//# sourceMappingURL=conversation.js.map