"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserChatMessageFromString = exports.prepareMessagesForSuggestions = void 0;
exports.createCheckpointsForAllBranches = createCheckpointsForAllBranches;
const models_1 = require("@onlook/models");
const uuid_1 = require("uuid");
const prepareMessagesForSuggestions = (messages) => {
    return messages.slice(-5).map((message) => ({
        role: message.role,
        content: message.parts.map((p) => {
            if (p.type === 'text') {
                return p.text;
            }
            return '';
        }).join(''),
    }));
};
exports.prepareMessagesForSuggestions = prepareMessagesForSuggestions;
const getUserChatMessageFromString = (content, context, conversationId, id) => {
    return {
        id: id ?? (0, uuid_1.v4)(),
        role: 'user',
        parts: [{ type: 'text', text: content }],
        metadata: {
            context,
            checkpoints: [],
            createdAt: new Date(),
            conversationId,
        },
    };
};
exports.getUserChatMessageFromString = getUserChatMessageFromString;
async function createCheckpointsForAllBranches(editorEngine, commitMessage) {
    const checkpoints = [];
    for (const branch of editorEngine.branches.allBranches) {
        const branchData = editorEngine.branches.getBranchDataById(branch.id);
        if (!branchData) {
            continue;
        }
        const result = await branchData.sandbox.gitManager.createCommit(commitMessage);
        if (result.success) {
            const commits = branchData.sandbox.gitManager.commits;
            const latestCommit = commits?.[0];
            if (latestCommit) {
                checkpoints.push({
                    type: models_1.MessageCheckpointType.GIT,
                    oid: latestCommit.oid,
                    branchId: branch.id,
                    createdAt: new Date(),
                });
            }
        }
    }
    return checkpoints;
}
//# sourceMappingURL=utils.js.map