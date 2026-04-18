"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDbConversation = exports.fromDbConversation = void 0;
const models_1 = require("@onlook/models");
const fromDbConversation = (conversation) => {
    return {
        ...conversation,
        title: conversation.displayName || null,
        agentType: conversation.agentType || models_1.AgentType.ROOT,
        suggestions: conversation.suggestions || [],
    };
};
exports.fromDbConversation = fromDbConversation;
const toDbConversation = (conversation) => {
    return {
        ...conversation,
        projectId: conversation.projectId,
        displayName: conversation.title || null,
        agentType: conversation.agentType,
        suggestions: conversation.suggestions || [],
    };
};
exports.toDbConversation = toDbConversation;
//# sourceMappingURL=conversation.js.map