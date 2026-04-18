"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSubscriptionCreated = void 0;
const server_1 = require("@/utils/analytics/server");
const db_1 = require("@onlook/db");
const client_1 = require("@onlook/db/src/client");
const stripe_1 = require("@onlook/stripe");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const helpers_1 = require("./helpers");
const handleSubscriptionCreated = async (receivedEvent) => {
    const { stripeSubscriptionId, stripeSubscriptionItemId, stripePriceId, stripeCustomerId, currentPeriodStart, currentPeriodEnd, } = (0, helpers_1.extractIdsFromEvent)(receivedEvent);
    const price = await client_1.db.query.prices.findFirst({
        where: (0, drizzle_orm_1.eq)(db_1.prices.stripePriceId, stripePriceId),
    });
    if (!price) {
        throw new Error(`No price found for price ID: ${stripePriceId}`);
    }
    const user = await client_1.db.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(db_1.users.stripeCustomerId, stripeCustomerId),
    });
    if (!user) {
        throw new Error(`No user found for customer ID: ${stripeCustomerId}`);
    }
    // Update or create subscription
    const [sub, rateLimit] = await client_1.db.transaction(async (tx) => {
        // If it does not exist then we create it and we create the rate limit.
        // The cases have to be separated because the code would otherwise add additional rate limits.
        const [data] = await tx
            .insert(db_1.subscriptions)
            .values({
            userId: user.id,
            priceId: price.id,
            productId: price.productId,
            status: stripe_1.SubscriptionStatus.ACTIVE,
            stripeCustomerId,
            stripeSubscriptionId: stripeSubscriptionId,
            stripeSubscriptionItemId: stripeSubscriptionItemId,
            stripeCurrentPeriodStart: currentPeriodStart,
            stripeCurrentPeriodEnd: currentPeriodEnd,
        })
            .onConflictDoUpdate({
            target: [db_1.subscriptions.stripeSubscriptionItemId],
            set: {
                // Left in case there are concurrent webhook requests for the same subscription
                userId: user.id,
                priceId: price.id,
                productId: price.productId,
                status: stripe_1.SubscriptionStatus.ACTIVE,
                stripeCustomerId,
                stripeSubscriptionId: stripeSubscriptionId,
                stripeCurrentPeriodStart: currentPeriodStart,
                stripeCurrentPeriodEnd: currentPeriodEnd,
            },
        })
            .returning();
        if (!data) {
            console.error('[[handleSubscriptionCreated]] No subscription was upserted.');
            throw new Error('No subscription was upserted.');
        }
        const [rateLimit] = await tx
            .insert(db_1.rateLimits)
            .values({
            userId: user.id,
            subscriptionId: data.id,
            max: price.monthlyMessageLimit,
            left: price.monthlyMessageLimit,
            startedAt: currentPeriodStart,
            endedAt: currentPeriodEnd,
            carryOverKey: (0, uuid_1.v4)(),
            carryOverTotal: 0,
            stripeSubscriptionItemId,
        })
            .returning();
        return [data, rateLimit];
    });
    (0, server_1.trackEvent)({
        distinctId: user.id,
        event: 'user_subscription_created',
        properties: {
            priceId: price.id,
            productId: price.productId,
            $set: {
                subscription_created_at: new Date(),
            }
        }
    });
    console.log('Checkout session completed: ', sub, rateLimit);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
exports.handleSubscriptionCreated = handleSubscriptionCreated;
//# sourceMappingURL=create.js.map