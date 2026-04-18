"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSubscriptionUpdated = void 0;
const server_1 = require("@/utils/analytics/server");
const db_1 = require("@onlook/db");
const client_1 = require("@onlook/db/src/client");
const stripe_1 = require("@onlook/stripe");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const helpers_1 = require("./helpers");
const handleSubscriptionUpdated = async (receivedEvent) => {
    const { stripeSubscriptionItemId, stripeSubscriptionId, stripeSubscriptionScheduleId, stripePriceId, currentPeriodStart, currentPeriodEnd, } = (0, helpers_1.extractIdsFromEvent)(receivedEvent);
    const stripeSubscription = receivedEvent.data.object;
    const subscription = await client_1.db.query.subscriptions.findFirst({
        where: (0, drizzle_orm_1.eq)(db_1.subscriptions.stripeSubscriptionId, stripeSubscriptionId),
    });
    if (!subscription) {
        throw new Error('Subscription not found');
    }
    const newPrice = await client_1.db.query.prices.findFirst({
        where: (0, drizzle_orm_1.eq)(db_1.prices.stripePriceId, stripePriceId),
    });
    if (!newPrice) {
        throw new Error(`No price found for updated price ID: ${stripePriceId}`);
    }
    const currentPriceId = subscription.priceId;
    const currentPrice = await client_1.db.query.prices.findFirst({
        where: (0, drizzle_orm_1.eq)(db_1.prices.id, currentPriceId),
    });
    if (!currentPrice) {
        throw new Error(`No price found for current price ID: ${currentPriceId}`);
    }
    const isUpgrade = (0, stripe_1.isTierUpgrade)(currentPrice, newPrice);
    const isRenewal = stripeSubscription.status === stripe_1.SubscriptionStatus.ACTIVE &&
        +currentPeriodEnd !== +subscription.stripeCurrentPeriodEnd;
    let renew = false;
    // Update subscription if price changed
    if (isUpgrade) {
        renew = await handleSubscriptionUpgrade(subscription, currentPrice, currentPeriodStart, currentPeriodEnd, stripeSubscriptionItemId, newPrice, isUpgrade);
    }
    else if (isRenewal) {
        // Based on the doc/dashboard, it is not possible to programmatically update the current period start and end.
        // If it is updated then the subscription is renewed.
        // Creating a new invoice may trigger this block to run; unless the invoice includes an upgrade.
        renew = true;
    }
    if (renew) {
        await handleSubscriptionRenewed(subscription, currentPeriodStart, currentPeriodEnd, stripeSubscriptionItemId, newPrice);
    }
    // If the subscription is cancelled, schedule the cancellation in database for display purposes.
    if (stripeSubscription.cancel_at) {
        const cancelAt = new Date(stripeSubscription.cancel_at * 1000);
        await client_1.db.transaction(async (tx) => {
            await tx
                .update(db_1.subscriptions)
                .set({
                priceId: newPrice.id,
                scheduledAction: stripe_1.ScheduledSubscriptionAction.CANCELLATION,
                scheduledChangeAt: cancelAt,
                stripeSubscriptionItemId,
            })
                .where((0, drizzle_orm_1.eq)(db_1.subscriptions.id, subscription.id));
        });
        console.log('Subscription cancellation scheduled at ', stripeSubscription.cancel_at);
    }
    else {
        await updateSubscriptionScheduleIfNeeded(subscription.id, stripeSubscriptionScheduleId);
    }
    (0, server_1.trackEvent)({
        distinctId: subscription.userId,
        event: 'user_subscription_updated',
        properties: {
            priceId: newPrice.id,
            productId: newPrice.productId,
            cancellationScheduled: !!stripeSubscription.cancel_at,
            $set: {
                subscription_updated_at: new Date(),
            },
        },
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
exports.handleSubscriptionUpdated = handleSubscriptionUpdated;
const handleSubscriptionUpgrade = async (subscription, currentPrice, currentPeriodStart, currentPeriodEnd, stripeSubscriptionItemId, newPrice, isUpgrade) => {
    let renew = false;
    await client_1.db.transaction(async (tx) => {
        await tx
            .update(db_1.subscriptions)
            // this call is solely to update the priceId
            // there is another call below in the case where
            .set({
            priceId: newPrice.id,
            // in the case of an upgrade, the downgrade if there is one is unscheduled.
            scheduledAction: null,
            scheduledChangeAt: null,
            scheduledPriceId: null,
            stripeSubscriptionScheduleId: null,
        })
            .where((0, drizzle_orm_1.eq)(db_1.subscriptions.id, subscription.id));
        // This is important because a subscription may be upgraded to a higher tier without prorating.
        // In the case of a pro-rated tier increase, the system creates a new rate limit with the delta.
        const isProRated = isUpgrade && +currentPeriodEnd === +subscription.stripeCurrentPeriodEnd;
        const tierIncrease = newPrice.monthlyMessageLimit - currentPrice.monthlyMessageLimit;
        if (isProRated) {
            await tx.insert(db_1.rateLimits).values({
                userId: subscription.userId,
                subscriptionId: subscription.id,
                max: tierIncrease,
                left: tierIncrease,
                startedAt: currentPeriodStart,
                endedAt: currentPeriodEnd,
                carryOverKey: (0, uuid_1.v4)(),
                carryOverTotal: 0,
                stripeSubscriptionItemId,
            });
        }
        else {
            // If it is not pro-rated, then it is a completely new period.
            // Therefore, it should behave similarly to a renewal: credits need to be carried over.
            renew = true;
        }
    });
    return renew;
};
const updateSubscriptionScheduleIfNeeded = async (subscriptionId, stripeSubscriptionScheduleId) => {
    if (!stripeSubscriptionScheduleId) {
        // If there is no schedule, clear the scheduled action and price change on.
        await client_1.db.update(db_1.subscriptions).set({
            scheduledAction: null,
            scheduledChangeAt: null,
            scheduledPriceId: null,
            stripeSubscriptionScheduleId: null,
            updatedAt: new Date(),
        }).where((0, drizzle_orm_1.eq)(db_1.subscriptions.id, subscriptionId));
        return;
    }
    const schedule = await (0, stripe_1.getSubscriptionSchedule)({
        subscriptionScheduleId: stripeSubscriptionScheduleId,
    });
    // the phases includes the current phase and the next phases
    // the code does some extra steps of the off chance, it does not include the current
    // phase and the array is not sorted
    const phases = schedule.phases
        // filter out the current phase
        .filter((_) => _.start_date !== schedule.current_phase?.start_date)
        .sort((a, b) => a.start_date - b.start_date);
    const endDate = phases[0]?.start_date;
    const scheduledChangeAt = endDate ? new Date(endDate * 1000) : null;
    const stripePrice = phases[0]?.items[0]?.price;
    const stripePriceId = typeof stripePrice === 'string' ? stripePrice : stripePrice?.id;
    // If the schedule event is not a price change, then it is not handled here.
    if (!stripePriceId) {
        console.log('Stripe Price ID not found.');
        return;
    }
    const price = await client_1.db.query.prices.findFirst({
        where: (0, drizzle_orm_1.eq)(db_1.prices.stripePriceId, stripePriceId),
    });
    if (!price) {
        throw new Error('Price not found.');
    }
    await client_1.db
        .update(db_1.subscriptions)
        .set({
        updatedAt: new Date(),
        scheduledAction: stripe_1.ScheduledSubscriptionAction.PRICE_CHANGE,
        scheduledPriceId: price.id,
        scheduledChangeAt,
        stripeSubscriptionScheduleId: schedule.id,
    })
        .where((0, drizzle_orm_1.eq)(db_1.subscriptions.id, subscriptionId))
        .returning();
};
const handleSubscriptionRenewed = async (subscription, currentPeriodStart, currentPeriodEnd, stripeSubscriptionItemId, newPrice) => {
    await client_1.db.transaction(async (tx) => {
        // Carry-over the credits from the previous period.
        const rates = await tx.query.rateLimits.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.rateLimits.subscriptionId, subscription.id), (0, drizzle_orm_1.eq)(db_1.rateLimits.stripeSubscriptionItemId, subscription.stripeSubscriptionItemId)),
        });
        for (const rate of rates) {
            await tx
                .update(db_1.rateLimits)
                .set({
                endedAt: currentPeriodStart,
            })
                .where((0, drizzle_orm_1.eq)(db_1.rateLimits.id, rate.id));
            // Here you can decide the logic for the carry-over.
            // Example, you may want to carry over 100% of the credits on the first carry-over,
            // and 50% of the credits on the next carry-overs.
            // const max = rate.carryOverTotal === 0 ? rate.left : rate.left * 0.50;
            const max = rate.left;
            // For now, we only carry over the credits on the first carry-over.
            // In the future, we may want to carry over the credits on the next carry-overs.
            if (rate.carryOverTotal === 0) {
                await tx.insert(db_1.rateLimits).values({
                    userId: subscription.userId,
                    subscriptionId: subscription.id,
                    max,
                    left: max,
                    startedAt: currentPeriodStart,
                    endedAt: currentPeriodEnd,
                    carryOverKey: rate.carryOverKey,
                    carryOverTotal: rate.carryOverTotal + 1,
                    stripeSubscriptionItemId,
                });
            }
        }
        // Create a new rate limit for the new period.
        await tx.insert(db_1.rateLimits).values({
            userId: subscription.userId,
            subscriptionId: subscription.id,
            max: newPrice.monthlyMessageLimit,
            left: newPrice.monthlyMessageLimit,
            startedAt: currentPeriodStart,
            endedAt: currentPeriodEnd,
            carryOverKey: (0, uuid_1.v4)(),
            carryOverTotal: 0,
            stripeSubscriptionItemId,
        });
        await tx
            .update(db_1.subscriptions)
            .set({
            status: stripe_1.SubscriptionStatus.ACTIVE,
            stripeSubscriptionItemId,
            stripeCurrentPeriodStart: currentPeriodStart,
            stripeCurrentPeriodEnd: currentPeriodEnd,
        })
            .where((0, drizzle_orm_1.eq)(db_1.subscriptions.id, subscription.id));
    });
};
//# sourceMappingURL=update.js.map