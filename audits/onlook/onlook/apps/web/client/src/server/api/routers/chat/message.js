"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.messageRouter = (0, trpc_1.createTRPCRouter)({
    getAll: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        conversationId: zod_1.z.string(),
    }))
        .query(async ({ ctx, input }) => {
        const result = await ctx.db.query.messages.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.messages.conversationId, input.conversationId),
            orderBy: [(0, drizzle_orm_1.asc)(db_1.messages.createdAt)],
        });
        return result.map((message) => (0, db_1.fromDbMessage)(message));
    }),
    upsert: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        message: db_1.messageInsertSchema
    }))
        .mutation(async ({ ctx, input }) => {
        const conversationId = input.message.conversationId;
        if (conversationId) {
            const conversation = await ctx.db.query.conversations.findFirst({
                where: (0, drizzle_orm_1.eq)(db_1.conversations.id, conversationId),
            });
            if (!conversation) {
                throw new Error(`Conversation not found`);
            }
        }
        const normalizedMessage = normalizeMessage(input.message);
        return await ctx.db
            .insert(db_1.messages)
            .values(normalizedMessage)
            .onConflictDoUpdate({
            target: [db_1.messages.id],
            set: {
                ...normalizedMessage,
            },
        });
    }),
    upsertMany: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        messages: db_1.messageInsertSchema.array(),
    }))
        .mutation(async ({ ctx, input }) => {
        const normalizedMessages = input.messages.map(normalizeMessage);
        await ctx.db.insert(db_1.messages).values(normalizedMessages);
    }),
    update: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        messageId: zod_1.z.string(),
        message: db_1.messageUpdateSchema
    }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.update(db_1.messages).set({
            ...input.message,
        }).where((0, drizzle_orm_1.eq)(db_1.messages.id, input.messageId));
    }),
    updateCheckpoints: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        messageId: zod_1.z.string(),
        checkpoints: zod_1.z.array(zod_1.z.object({
            type: zod_1.z.enum(models_1.MessageCheckpointType),
            oid: zod_1.z.string(),
            branchId: zod_1.z.string(),
            createdAt: zod_1.z.date(),
        })),
    }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.update(db_1.messages).set({
            checkpoints: input.checkpoints,
        }).where((0, drizzle_orm_1.eq)(db_1.messages.id, input.messageId));
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        messageIds: zod_1.z.array(zod_1.z.string()),
    }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.delete(db_1.messages).where((0, drizzle_orm_1.inArray)(db_1.messages.id, input.messageIds));
    }),
    // TODO: We're just doing a full replacement here which is inefficient.
    // To improve this, there's basically two use-cases we need to support:
    // 1) Add new messages (doesn't need to delete + reinsert messages)
    // 2) Edit a previous message (requires deleting all messages following the edited message and inserting new ones)
    // Tool calls are supported in both cases by the fact that they result in new messages being added.
    replaceConversationMessages: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        conversationId: zod_1.z.string(),
        messages: db_1.messageInsertSchema.array(),
    }))
        .mutation(async ({ ctx, input }) => {
        await ctx.db.transaction(async (tx) => {
            await tx.delete(db_1.messages).where((0, drizzle_orm_1.eq)(db_1.messages.conversationId, input.conversationId));
            if (input.messages.length > 0) {
                const normalizedMessages = input.messages.map(normalizeMessage);
                await tx.insert(db_1.messages).values(normalizedMessages);
            }
            await tx.update(db_1.conversations).set({
                updatedAt: new Date()
            }).where((0, drizzle_orm_1.eq)(db_1.conversations.id, input.conversationId));
        });
    }),
});
const normalizeMessage = (message) => {
    return {
        ...message,
        createdAt: typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt,
    };
};
//# sourceMappingURL=message.js.map