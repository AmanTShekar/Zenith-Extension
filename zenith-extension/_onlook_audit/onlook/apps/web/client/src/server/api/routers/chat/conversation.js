"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRouter = void 0;
const ai_1 = require("@onlook/ai");
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const ai_2 = require("ai");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.conversationRouter = (0, trpc_1.createTRPCRouter)({
    getAll: trpc_1.protectedProcedure
        .input(zod_1.z.object({ projectId: zod_1.z.string() }))
        .query(async ({ ctx, input }) => {
        const dbConversations = await ctx.db.query.conversations.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.conversations.projectId, input.projectId),
            orderBy: (conversations, { desc }) => [desc(conversations.updatedAt)],
        });
        return dbConversations.map((conversation) => (0, db_1.fromDbConversation)(conversation));
    }),
    get: trpc_1.protectedProcedure
        .input(zod_1.z.object({ conversationId: zod_1.z.string() }))
        .query(async ({ ctx, input }) => {
        const conversation = await ctx.db.query.conversations.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.conversations.id, input.conversationId),
        });
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        return (0, db_1.fromDbConversation)(conversation);
    }),
    upsert: trpc_1.protectedProcedure
        .input(db_1.conversationInsertSchema)
        .mutation(async ({ ctx, input }) => {
        const [conversation] = await ctx.db.insert(db_1.conversations).values(input).returning();
        if (!conversation) {
            throw new Error('Conversation not created');
        }
        return (0, db_1.fromDbConversation)(conversation);
    }),
    update: trpc_1.protectedProcedure
        .input(db_1.conversationUpdateSchema)
        .mutation(async ({ ctx, input }) => {
        const [conversation] = await ctx.db.update({
            ...db_1.conversations,
            updatedAt: new Date(),
        }).set(input)
            .where((0, drizzle_orm_1.eq)(db_1.conversations.id, input.id)).returning();
        if (!conversation) {
            throw new Error('Conversation not updated');
        }
        return (0, db_1.fromDbConversation)(conversation);
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        conversationId: zod_1.z.string()
    }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.delete(db_1.conversations).where((0, drizzle_orm_1.eq)(db_1.conversations.id, input.conversationId));
    }),
    generateTitle: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        conversationId: zod_1.z.string(),
        content: zod_1.z.string(),
    }))
        .mutation(async ({ ctx, input }) => {
        const { model, providerOptions, headers } = (0, ai_1.initModel)({
            provider: models_1.LLMProvider.OPENROUTER,
            model: models_1.OPENROUTER_MODELS.CLAUDE_3_5_HAIKU,
        });
        const MAX_NAME_LENGTH = 50;
        const result = await (0, ai_2.generateText)({
            model,
            headers,
            prompt: `Generate a concise and meaningful conversation title (2-4 words maximum) that reflects the main purpose or theme of the conversation based on user's creation prompt. Generate only the conversation title, nothing else. Keep it short and descriptive. User's creation prompt: <prompt>${input.content}</prompt>`,
            providerOptions,
            maxOutputTokens: 50,
            experimental_telemetry: {
                isEnabled: true,
                metadata: {
                    conversationId: input.conversationId,
                    userId: ctx.user.id,
                    tags: ['conversation-title-generation'],
                    sessionId: input.conversationId,
                    langfuseTraceId: (0, uuid_1.v4)(),
                },
            },
        });
        const generatedName = result.text.trim();
        if (generatedName && generatedName.length > 0 && generatedName.length <= MAX_NAME_LENGTH) {
            await ctx.db.update(db_1.conversations).set({
                displayName: generatedName,
            }).where((0, drizzle_orm_1.eq)(db_1.conversations.id, input.conversationId));
            return generatedName;
        }
        console.error('Error generating conversation title', result);
        return null;
    }),
});
//# sourceMappingURL=conversation.js.map