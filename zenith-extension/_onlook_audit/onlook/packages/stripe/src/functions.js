"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionSchedule = exports.releaseSubscriptionSchedule = exports.updateSubscriptionNextPeriod = exports.updateSubscription = exports.createBillingPortalSession = exports.createCheckoutSession = exports.isTierUpgrade = exports.createCustomer = void 0;
const client_1 = require("./client");
const createCustomer = async ({ name, email }) => {
    const stripe = (0, client_1.createStripeClient)();
    return stripe.customers.create({ name, email });
};
exports.createCustomer = createCustomer;
const isTierUpgrade = (currentPrice, newPrice) => {
    return newPrice.monthlyMessageLimit > currentPrice.monthlyMessageLimit;
};
exports.isTierUpgrade = isTierUpgrade;
const createCheckoutSession = async ({ priceId, userId, stripeCustomerId, successUrl, cancelUrl, existing, }) => {
    const stripe = (0, client_1.createStripeClient)();
    let session;
    if (existing) {
        session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            payment_method_types: ['card'],
            metadata: {
                user_id: userId,
            },
            allow_promotion_codes: true,
            success_url: successUrl,
            cancel_url: cancelUrl,
            subscription_data: {
                proration_behavior: 'create_prorations',
            },
        });
    }
    else {
        session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            payment_method_types: ['card'],
            metadata: {
                user_id: userId,
            },
            allow_promotion_codes: true,
            success_url: successUrl,
            cancel_url: cancelUrl,
        });
    }
    return session;
};
exports.createCheckoutSession = createCheckoutSession;
const createBillingPortalSession = async ({ customerId, returnUrl, }) => {
    const stripe = (0, client_1.createStripeClient)();
    return await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
};
exports.createBillingPortalSession = createBillingPortalSession;
const updateSubscription = async ({ subscriptionId, subscriptionItemId, priceId, }) => {
    const stripe = (0, client_1.createStripeClient)();
    return stripe.subscriptions.update(subscriptionId, {
        items: [
            {
                id: subscriptionItemId,
                price: priceId,
            },
        ],
        proration_behavior: 'always_invoice',
    });
};
exports.updateSubscription = updateSubscription;
const updateSubscriptionNextPeriod = async ({ subscriptionId, priceId, }) => {
    const stripe = (0, client_1.createStripeClient)();
    // Step 1: Create a subscription schedule from the current subscription
    const schedule = await stripe.subscriptionSchedules.create({
        from_subscription: subscriptionId,
    });
    const currentPhase = schedule.phases[0];
    if (!currentPhase) {
        throw new Error('No current phase found');
    }
    const currentItem = currentPhase.items[0];
    if (!currentItem) {
        throw new Error('No current item found');
    }
    const currentPrice = currentItem.price.toString();
    if (!currentPrice) {
        throw new Error('No current price found');
    }
    // Step 2: Add a new phase that updates the price starting next billing period
    const updatedSchedule = await stripe.subscriptionSchedules.update(schedule.id, {
        phases: [
            {
                items: [
                    {
                        price: currentPrice,
                        quantity: currentItem.quantity,
                    },
                ],
                start_date: currentPhase.start_date,
                end_date: currentPhase.end_date,
            },
            {
                items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                iterations: 1,
            },
        ],
    });
    return updatedSchedule;
};
exports.updateSubscriptionNextPeriod = updateSubscriptionNextPeriod;
const releaseSubscriptionSchedule = async ({ subscriptionScheduleId, }) => {
    const stripe = (0, client_1.createStripeClient)();
    return await stripe.subscriptionSchedules.release(subscriptionScheduleId);
};
exports.releaseSubscriptionSchedule = releaseSubscriptionSchedule;
const getSubscriptionSchedule = async ({ subscriptionScheduleId, }) => {
    const stripe = (0, client_1.createStripeClient)();
    return stripe.subscriptionSchedules.retrieve(subscriptionScheduleId);
};
exports.getSubscriptionSchedule = getSubscriptionSchedule;
//# sourceMappingURL=functions.js.map