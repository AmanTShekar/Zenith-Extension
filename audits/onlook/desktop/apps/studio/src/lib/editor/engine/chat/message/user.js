"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserChatMessageImpl = void 0;
const provider_1 = require("@onlook/ai/src/prompt/provider");
const chat_1 = require("@onlook/models/chat");
const non_secure_1 = require("nanoid/non-secure");
class UserChatMessageImpl {
    id;
    role = chat_1.ChatMessageRole.USER;
    content;
    context = [];
    promptProvider;
    constructor(content, context = []) {
        this.id = (0, non_secure_1.nanoid)();
        this.content = content;
        this.context = context;
        this.promptProvider = new provider_1.PromptProvider();
    }
    static fromJSON(data) {
        const message = new UserChatMessageImpl(data.content, data.context);
        message.id = data.id;
        return message;
    }
    static toJSON(message) {
        return {
            id: message.id,
            role: message.role,
            content: message.content,
            context: message.context,
        };
    }
    static fromCoreMessage(message) {
        return new UserChatMessageImpl(message.content);
    }
    static fromStringContent(content, context = []) {
        const message = new UserChatMessageImpl([{ type: 'text', text: content }], context);
        return message;
    }
    toCoreMessage() {
        return this.promptProvider.getHydratedUserMessage(this.content, this.context);
    }
    updateContent(content) {
        this.content = content;
    }
    updateStringContent(content) {
        this.content = [
            {
                type: 'text',
                text: content,
            },
        ];
    }
    getStringContent() {
        if (typeof this.content === 'string') {
            return this.content;
        }
        return this.content.map((c) => (c.type === 'text' ? c.text : '')).join('');
    }
}
exports.UserChatMessageImpl = UserChatMessageImpl;
//# sourceMappingURL=user.js.map