"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestionsRouter = void 0;
const ai_1 = require("@onlook/ai");
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const chat_1 = require("@onlook/models/chat");
const ai_2 = require("ai");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.suggestionsRouter = (0, trpc_1.createTRPCRouter)({
    generate: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        conversationId: zod_1.z.string(),
        messages: zod_1.z.array(zod_1.z.object({
            role: zod_1.z.enum(['user', 'assistant', 'system']),
            content: zod_1.z.string(),
        })),
    }))
        .mutation(async ({ ctx, input }) => {
        const { model, headers } = (0, ai_1.initModel)({
            provider: models_1.LLMProvider.OPENROUTER,
            model: models_1.OPENROUTER_MODELS.OPEN_AI_GPT_5_NANO,
        });
        const { object } = await (0, ai_2.generateObject)({
            model,
            headers,
            schema: chat_1.ChatSuggestionsSchema,
            messages: [
                {
                    role: 'system',
                    content: ai_1.SUGGESTION_SYSTEM_PROMPT,
                },
                ...(0, ai_2.convertToModelMessages)(input.messages.map((m) => ({
                    role: m.role,
                    parts: [{ type: 'text', text: m.content }],
                }))),
                {
                    role: 'user',
                    content: 'Based on our conversation, what should I work on next to improve this page? Provide 3 specific, actionable suggestions. These should be realistic and achievable. Return the suggestions as a JSON object. DO NOT include any other text.',
                },
            ],
            maxOutputTokens: 10000,
        });
        const suggestions = object.suggestions;
        try {
            await ctx.db.update(db_1.conversations).set({
                suggestions,
            }).where((0, drizzle_orm_1.eq)(db_1.conversations.id, input.conversationId));
        }
        catch (error) {
            console.error('Error updating conversation suggestions:', error);
        }
        return suggestions;
    }),
});
//# sourceMappingURL=suggestion.js.map