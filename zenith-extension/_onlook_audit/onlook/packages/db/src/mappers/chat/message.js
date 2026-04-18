"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDbMessage = exports.fromDbMessage = void 0;
const fromDbMessage = (message) => {
    return {
        ...message,
        metadata: {
            conversationId: message.conversationId,
            createdAt: message.createdAt,
            context: message.context ?? [],
            checkpoints: message.checkpoints ?? [],
            usage: message.usage ?? undefined,
        },
        parts: message.parts ?? [],
    };
};
exports.fromDbMessage = fromDbMessage;
const toDbMessage = (message, conversationId) => {
    const createdAt = message.metadata?.createdAt;
    return {
        id: message.id,
        createdAt: createdAt instanceof Date ? createdAt : createdAt ? new Date(createdAt) : new Date(),
        conversationId,
        context: message?.metadata?.context ?? [],
        parts: message.parts,
        role: message.role,
        checkpoints: message.metadata?.checkpoints ?? [],
        usage: message.metadata?.usage ?? null,
        // deprecated
        applied: null,
        commitOid: null,
        snapshots: null,
        content: '',
    };
};
exports.toDbMessage = toDbMessage;
//# sourceMappingURL=message.js.map