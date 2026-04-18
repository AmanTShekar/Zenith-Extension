"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backfillSubscriptions = exports.getStripeItems = exports.getAllSubscriptions = void 0;
const rate_limits_1 = require("@/schema/subscription/rate-limits");
const subscription_1 = require("@/schema/subscription/subscription");
const usage_1 = require("@/schema/subscription/usage");
const user_1 = require("@/schema/user/user");
const client_1 = require("@onlook/db/src/client");
const models_1 = require("@onlook/models");
const stripe_1 = require("@onlook/stripe");
const client_2 = require("@onlook/stripe/src/client");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const getAllSubscriptions = async () => {
    const subs = (await client_1.db.query.subscriptions.findMany({
        // where: eq(subscriptions.status, SubscriptionStatus.ACTIVE),
        with: {
            product: true,
            price: true,
        },
        orderBy: (0, drizzle_orm_1.asc)(subscription_1.subscriptions.startedAt),
    }));
    return subs;
};
exports.getAllSubscriptions = getAllSubscriptions;
const getStripeItems = async (subscriptions) => {
    const stripe = (0, client_2.createStripeClient)();
    const items = [];
    for (const sub of subscriptions) {
        const subscriptionItem = await stripe.subscriptionItems.retrieve(sub.stripeSubscriptionItemId);
        const stripeCurrentPeriodStart = new Date(subscriptionItem.current_period_start * 1000);
        const stripeCurrentPeriodEnd = new Date(subscriptionItem.current_period_end * 1000);
        const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
        items.push({
            subscription: sub,
            stripeSubscriptionItemId: sub.stripeSubscriptionItemId,
            stripeCustomerId: stripeSubscription.customer,
            stripeCurrentPeriodStart,
            stripeCurrentPeriodEnd,
        });
    }
    return items;
};
exports.getStripeItems = getStripeItems;
const insertRateLimit = async (tx, item) => {
    if (item.subscription.status !== stripe_1.SubscriptionStatus.ACTIVE) {
        return;
    }
    console.log(`Inserting rate limit for subscription ${item.subscription.id}`);
    // Count usage records within the current period
    const usageCountResult = await tx
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(usage_1.usageRecords)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(usage_1.usageRecords.userId, item.subscription.userId), (0, drizzle_orm_1.eq)(usage_1.usageRecords.type, models_1.UsageType.MESSAGE), (0, drizzle_orm_1.gte)(usage_1.usageRecords.timestamp, item.stripeCurrentPeriodStart), (0, drizzle_orm_1.lt)(usage_1.usageRecords.timestamp, item.stripeCurrentPeriodEnd)));
    const usageCount = usageCountResult[0]?.count || 0;
    const remainingUsage = Math.max(0, item.subscription.price.monthlyMessageLimit - usageCount);
    const insertValue = {
        userId: item.subscription.userId,
        subscriptionId: item.subscription.id,
        startedAt: item.stripeCurrentPeriodStart,
        endedAt: item.stripeCurrentPeriodEnd,
        max: item.subscription.price.monthlyMessageLimit,
        left: remainingUsage,
        carryOverKey: (0, uuid_1.v4)(),
        carryOverTotal: 0,
        stripeSubscriptionItemId: item.stripeSubscriptionItemId,
    };
    console.log(`Inserting rate limit for subscription ${item.subscription.id}: ${JSON.stringify(insertValue, null, 2)}`);
    // Insert rate limit record
    await tx.insert(rate_limits_1.rateLimits).values(insertValue).onConflictDoNothing();
};
const backfillSubscriptions = async () => {
    console.log('Backfilling subscriptions...');
    const subs = await (0, exports.getAllSubscriptions)();
    console.log(`Found ${subs.length} subscriptions`);
    const stripeItems = await (0, exports.getStripeItems)(subs);
    console.log(`Found ${stripeItems.length} stripe items`);
    for (const item of stripeItems) {
        console.log(`Backfilling subscription ${item.subscription.id}`);
        await client_1.db.transaction(async (tx) => {
            console.log(`Updating subscription ${item.subscription.id}`);
            // Update subscription
            await tx.update(subscription_1.subscriptions).set({
                stripeCurrentPeriodStart: item.stripeCurrentPeriodStart,
                stripeCurrentPeriodEnd: item.stripeCurrentPeriodEnd,
            }).where((0, drizzle_orm_1.eq)(subscription_1.subscriptions.id, item.subscription.id));
            console.log(`Updating user ${item.subscription.userId}`);
            // Update user
            await tx.update(user_1.users).set({
                stripeCustomerId: item.stripeCustomerId,
            }).where((0, drizzle_orm_1.eq)(user_1.users.id, item.subscription.userId));
            console.log(`Inserting rate limit for subscription ${item.subscription.id}`);
            // Insert rate limit based on usage records and subscription price
            await insertRateLimit(tx, item);
            console.log(`Rate limit inserted for subscription ${item.subscription.id}`);
        });
    }
};
exports.backfillSubscriptions = backfillSubscriptions;
(async () => {
    await (0, exports.backfillSubscriptions)();
    process.exit(0);
})();
//# sourceMappingURL=backfill-subscriptions.js.map