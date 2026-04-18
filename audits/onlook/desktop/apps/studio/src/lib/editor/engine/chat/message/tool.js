"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolChatMessageImpl = void 0;
const chat_1 = require("@onlook/models/chat");
const non_secure_1 = require("nanoid/non-secure");
class ToolChatMessageImpl {
    id;
    role = chat_1.ChatMessageRole.TOOL;
    content;
    constructor(content) {
        this.id = (0, non_secure_1.nanoid)();
        this.content = content;
    }
    static fromJSON(data) {
        const message = new ToolChatMessageImpl(data.content);
        message.id = data.id;
        return message;
    }
    static toJSON(message) {
        return {
            id: message.id,
            role: message.role,
            content: message.content,
        };
    }
    static fromCoreMessage(message) {
        return new ToolChatMessageImpl(message.content);
    }
    toCoreMessage() {
        return {
            ...this,
            content: this.content,
        };
    }
}
exports.ToolChatMessageImpl = ToolChatMessageImpl;
//# sourceMappingURL=tool.js.map