"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantChatMessageImpl = void 0;
const chat_1 = require("@onlook/models/chat");
const non_secure_1 = require("nanoid/non-secure");
class AssistantChatMessageImpl {
    id;
    role = chat_1.ChatMessageRole.ASSISTANT;
    content;
    applied = false;
    snapshots = {};
    constructor(content) {
        this.id = (0, non_secure_1.nanoid)();
        this.content = content;
    }
    static fromCoreMessage(message) {
        return new AssistantChatMessageImpl(message.content);
    }
    toCoreMessage() {
        return {
            ...this,
            content: this.content,
        };
    }
    static fromJSON(data) {
        const message = new AssistantChatMessageImpl(data.content);
        message.id = data.id;
        message.applied = data.applied;
        message.snapshots = data.snapshots || {};
        return message;
    }
    static toJSON(message) {
        return {
            id: message.id,
            role: message.role,
            content: message.content,
            applied: message.applied,
            snapshots: message.snapshots,
        };
    }
}
exports.AssistantChatMessageImpl = AssistantChatMessageImpl;
//# sourceMappingURL=assistant.js.map