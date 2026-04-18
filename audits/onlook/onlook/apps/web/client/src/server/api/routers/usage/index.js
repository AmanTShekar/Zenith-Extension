"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFreePlanUsage = exports.usageRouter = void 0;
const db_1 = require("@onlook/db");
const models_1 = require("@onlook/models");
const stripe_1 = require("@onlook/stripe");
const sub_1 = require("date-fns/sub");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.usageRouter = (0, trpc_1.createTRPCRouter)({
    get: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.user;
        return ctx.db.transaction(async (tx) => {
            // Calculate date ranges
            const now = new Date();
            // If the user has an active subscription then they can use their rate limits (including carry-over)
            const subscription = await tx.query.subscriptions.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.subscriptions.userId, user.id), (0, drizzle_orm_1.eq)(db_1.subscriptions.status, stripe_1.SubscriptionStatus.ACTIVE)),
            });
            // if no subscription then user is on a free plan
            if (!subscription) {
                return (0, exports.getFreePlanUsage)(tx, user.id, now);
            }
            return getSubscriptionUsage(tx, user.id, now);
        });
    }),
    increment: trpc_1.protectedProcedure.input(zod_1.z.object({
        type: zod_1.z.enum(models_1.UsageType),
        traceId: zod_1.z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        // running a transaction helps with concurrency issues and ensures that
        // the usage is incremented atomically
        return ctx.db.transaction(async (tx) => {
            // users on free plans don't have their rate limits stored in the database
            // the limits are calculated on the fly instead
            const subscription = await tx.query.subscriptions.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.subscriptions.userId, user.id), (0, drizzle_orm_1.eq)(db_1.subscriptions.status, stripe_1.SubscriptionStatus.ACTIVE)),
            });
            let rateLimitId;
            if (subscription) {
                const now = new Date();
                const [limit] = await tx
                    .select({ id: db_1.rateLimits.id, left: db_1.rateLimits.left })
                    .from(db_1.rateLimits)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.rateLimits.userId, user.id), (0, drizzle_orm_1.lte)(db_1.rateLimits.startedAt, now), (0, drizzle_orm_1.gte)(db_1.rateLimits.endedAt, now), (0, drizzle_orm_1.ne)(db_1.rateLimits.left, 0)))
                    // deduct from the credits that have carried over the most
                    // (in other words, the oldest credits)
                    .orderBy((0, drizzle_orm_1.desc)(db_1.rateLimits.carryOverTotal))
                    .limit(1);
                // if there are no credits left then rollback
                if (!limit?.left) {
                    tx.rollback();
                    return;
                }
                await tx.update(db_1.rateLimits).set({
                    left: (0, drizzle_orm_1.sql) `${db_1.rateLimits.left} - 1`,
                }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.rateLimits.id, limit.id)));
                rateLimitId = limit.id;
            }
            const usageRecord = await tx.insert(db_1.usageRecords).values({
                userId: user.id,
                type: input.type,
                timestamp: new Date(),
                traceId: input.traceId,
            }).onConflictDoNothing().returning({ id: db_1.usageRecords.id });
            return { rateLimitId, usageRecordId: usageRecord?.[0]?.id };
        });
    }),
    revertIncrement: trpc_1.protectedProcedure.input(zod_1.z.object({
        usageRecordId: zod_1.z.string().optional(),
        rateLimitId: zod_1.z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
        return ctx.db.transaction(async (tx) => {
            if (input.rateLimitId) {
                await tx.update(db_1.rateLimits).set({
                    left: (0, drizzle_orm_1.sql) `${db_1.rateLimits.left} + 1`,
                }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.rateLimits.id, input.rateLimitId)));
            }
            if (input.usageRecordId) {
                await tx.delete(db_1.usageRecords).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.usageRecords.id, input.usageRecordId)));
            }
            return { rateLimitId: input.rateLimitId, usageRecordId: input.usageRecordId };
        });
    }),
});
const getFreePlanUsage = async (tx, userId, now) => {
    // Previous day
    const dayEnd = now;
    const dayStart = (0, sub_1.sub)(now, { days: 1 });
    // Previous month  
    const monthEnd = now;
    const monthStart = (0, sub_1.sub)(now, { months: 1 });
    // Count records from previous day
    const lastDayCount = await tx
        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(db_1.usageRecords)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.usageRecords.userId, userId), (0, drizzle_orm_1.gte)(db_1.usageRecords.timestamp, dayStart), (0, drizzle_orm_1.lt)(db_1.usageRecords.timestamp, dayEnd)));
    // Count records from previous month
    const lastMonthCount = await tx
        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(db_1.usageRecords)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.usageRecords.userId, userId), (0, drizzle_orm_1.gte)(db_1.usageRecords.timestamp, monthStart), (0, drizzle_orm_1.lt)(db_1.usageRecords.timestamp, monthEnd)));
    return {
        daily: {
            period: 'day',
            usageCount: lastDayCount[0]?.count || 0,
            limitCount: stripe_1.FREE_PRODUCT_CONFIG.dailyLimit,
        },
        monthly: {
            period: 'month',
            usageCount: lastMonthCount[0]?.count || 0,
            limitCount: stripe_1.FREE_PRODUCT_CONFIG.monthlyLimit,
        },
    };
};
exports.getFreePlanUsage = getFreePlanUsage;
const getSubscriptionUsage = async (tx, userId, now) => {
    // Selects all valid rate limits for the user (i.e. not expired)
    // and sums the left and max values
    const limit = await tx
        .select({ left: (0, drizzle_orm_1.sum)(db_1.rateLimits.left), max: (0, drizzle_orm_1.sum)(db_1.rateLimits.max) })
        .from(db_1.rateLimits)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.rateLimits.userId, userId), (0, drizzle_orm_1.lte)(db_1.rateLimits.startedAt, now), (0, drizzle_orm_1.gt)(db_1.rateLimits.endedAt, now)))
        .then(res => ({
        left: res[0]?.left ? parseInt(res[0]?.left, 10) : 0,
        max: res[0]?.max ? parseInt(res[0]?.max, 10) : 0,
    }));
    return {
        daily: {
            period: 'day',
            // technically, this is the monthly value, since subscriptions don't have daily limits
            // the code returns the monthly limits, which is technically correct.
            usageCount: limit.max - limit.left,
            limitCount: limit.max,
        },
        monthly: {
            period: 'month',
            usageCount: limit.max - limit.left,
            limitCount: limit.max,
        },
    };
};
//# sourceMappingURL=index.js.map