"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultConversation = void 0;
const models_1 = require("@onlook/models");
const uuid_1 = require("uuid");
const createDefaultConversation = (projectId) => {
    return {
        id: (0, uuid_1.v4)(),
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        displayName: 'New Conversation',
        suggestions: [],
        agentType: models_1.AgentType.ROOT,
    };
};
exports.createDefaultConversation = createDefaultConversation;
//# sourceMappingURL=conversation.js.map