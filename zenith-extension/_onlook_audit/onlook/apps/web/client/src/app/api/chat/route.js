"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamResponse = void 0;
exports.POST = POST;
const server_1 = require("@/trpc/server");
const server_2 = require("@/utils/analytics/server");
const ai_1 = require("@onlook/ai");
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const uuid_1 = require("uuid");
const helpers_1 = require("./helpers");
async function POST(req) {
    try {
        const user = await (0, helpers_1.getSupabaseUser)(req);
        if (!user) {
            return new Response(JSON.stringify({
                error: 'Unauthorized, no user found. Please login again.',
                code: 401
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const usageCheckResult = await (0, helpers_1.checkMessageLimit)(req);
        if (usageCheckResult.exceeded) {
            (0, server_2.trackEvent)({
                distinctId: user.id,
                event: 'message_limit_exceeded',
                properties: {
                    usage: usageCheckResult.usage,
                },
            });
            return new Response(JSON.stringify({
                error: 'Message limit exceeded. Please upgrade to a paid plan.',
                code: 402,
                usage: usageCheckResult.usage,
            }), {
                status: 402,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return (0, exports.streamResponse)(req, user.id);
    }
    catch (error) {
        console.error('Error in chat', error);
        return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            code: 500,
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
const streamResponse = async (req, userId) => {
    const body = await req.json();
    const { messages, chatType, conversationId, projectId } = body;
    // Updating the usage record and rate limit is done here to avoid
    // abuse in the case where a single user sends many concurrent requests.
    // If the call below fails, the user will not be penalized.
    let usageRecord = null;
    try {
        const lastUserMessage = messages.findLast((message) => message.role === 'user');
        const traceId = lastUserMessage?.id ?? (0, uuid_1.v4)();
        if (chatType === models_1.ChatType.EDIT) {
            usageRecord = await (0, helpers_1.incrementUsage)(req, traceId);
        }
        const stream = (0, ai_1.createRootAgentStream)({
            chatType,
            conversationId,
            projectId,
            userId,
            traceId,
            messages,
        });
        return stream.toUIMessageStreamResponse({
            originalMessages: messages,
            generateMessageId: () => (0, uuid_1.v4)(),
            messageMetadata: ({ part }) => {
                return {
                    createdAt: new Date(),
                    conversationId,
                    context: [],
                    checkpoints: [],
                    finishReason: part.type === 'finish-step' ? part.finishReason : undefined,
                    usage: part.type === 'finish-step' ? part.usage : undefined,
                };
            },
            onFinish: async ({ messages: finalMessages }) => {
                const messagesToStore = finalMessages
                    .filter(msg => (msg.role === 'user' || msg.role === 'assistant'))
                    .map(msg => (0, db_1.toDbMessage)(msg, conversationId));
                await server_1.api.chat.message.replaceConversationMessages({
                    conversationId,
                    messages: messagesToStore,
                });
            },
            onError: helpers_1.errorHandler,
        });
    }
    catch (error) {
        console.error('Error in streamResponse setup', error);
        // If there was an error setting up the stream and we incremented usage, revert it
        if (usageRecord) {
            await (0, helpers_1.decrementUsage)(req, usageRecord);
        }
        throw error;
    }
};
exports.streamResponse = streamResponse;
//# sourceMappingURL=route.js.map