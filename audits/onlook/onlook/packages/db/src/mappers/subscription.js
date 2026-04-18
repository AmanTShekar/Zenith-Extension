"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromDbSubscription = fromDbSubscription;
exports.fromDbProduct = fromDbProduct;
exports.fromDbPrice = fromDbPrice;
exports.fromDbScheduledChange = fromDbScheduledChange;
function fromDbSubscription(subscription, scheduledPrice) {
    return {
        id: subscription.id,
        status: subscription.status,
        startedAt: subscription.startedAt,
        endedAt: subscription.endedAt,
        product: fromDbProduct(subscription.product),
        price: fromDbPrice(subscription.price),
        scheduledChange: fromDbScheduledChange(scheduledPrice, subscription.scheduledAction, subscription.scheduledChangeAt, subscription.stripeSubscriptionScheduleId),
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionItemId: subscription.stripeSubscriptionItemId,
    };
}
function fromDbProduct(product) {
    return {
        name: product.name,
        type: product.type,
        stripeProductId: product.stripeProductId,
    };
}
function fromDbPrice(price) {
    return {
        id: price.id,
        productId: price.productId,
        monthlyMessageLimit: price.monthlyMessageLimit,
        stripePriceId: price.stripePriceId,
        key: price.key,
    };
}
function fromDbScheduledChange(price, scheduledAction, scheduledChangeAt, stripeSubscriptionScheduleId) {
    if (!scheduledAction || !scheduledChangeAt) {
        return null;
    }
    return {
        price: price ? fromDbPrice(price) : null,
        scheduledAction,
        scheduledChangeAt,
        stripeSubscriptionScheduleId,
    };
}
//# sourceMappingURL=subscription.js.map