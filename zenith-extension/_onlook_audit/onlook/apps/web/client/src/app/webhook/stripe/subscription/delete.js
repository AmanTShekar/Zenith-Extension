"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSubscriptionDeleted = void 0;
const server_1 = require("@/utils/analytics/server");
const db_1 = require("@onlook/db");
const client_1 = require("@onlook/db/src/client");
const stripe_1 = require("@onlook/stripe");
const drizzle_orm_1 = require("drizzle-orm");
const helpers_1 = require("./helpers");
const handleSubscriptionDeleted = async (receivedEvent) => {
    const { stripeSubscriptionId } = (0, helpers_1.extractIdsFromEvent)(receivedEvent);
    const res = await client_1.db
        .update(db_1.subscriptions)
        .set({
        status: stripe_1.SubscriptionStatus.CANCELED,
        endedAt: new Date(),
    })
        .where((0, drizzle_orm_1.eq)(db_1.subscriptions.stripeSubscriptionId, stripeSubscriptionId));
    console.log('Subscription cancelled: ', res);
    await trackSubscriptionCancelled(stripeSubscriptionId);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
exports.handleSubscriptionDeleted = handleSubscriptionDeleted;
const trackSubscriptionCancelled = async (stripeSubscriptionId) => {
    try {
        const subscription = await client_1.db.query.subscriptions.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.subscriptions.stripeSubscriptionId, stripeSubscriptionId),
        });
        if (subscription) {
            (0, server_1.trackEvent)({
                distinctId: subscription.userId,
                event: 'user_subscription_cancelled',
                properties: {
                    $set: {
                        subscription_cancelled_at: new Date(),
                    }
                }
            });
        }
    }
    catch (error) {
        console.error('Error tracking user subscription cancelled: ', error);
    }
};
//# sourceMappingURL=delete.js.map