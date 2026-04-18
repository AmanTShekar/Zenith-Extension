"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const env_1 = require("@/env");
const stripe_1 = require("@onlook/stripe");
const subscription_1 = require("./subscription");
async function POST(request) {
    const stripe = (0, stripe_1.createStripeClient)(env_1.env.STRIPE_SECRET_KEY);
    const endpointSecret = env_1.env.STRIPE_WEBHOOK_SECRET;
    const buf = Buffer.from(await request.arrayBuffer());
    let event;
    if (!endpointSecret) {
        return new Response('STRIPE_WEBHOOK_SECRET is not set', { status: 400 });
    }
    const signature = request.headers.get('stripe-signature');
    try {
        event = stripe.webhooks.constructEvent(buf, signature, endpointSecret);
    }
    catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return new Response('Webhook signature verification failed', { status: 400 });
    }
    switch (event.type) {
        case 'customer.subscription.created': {
            return (0, subscription_1.handleSubscriptionCreated)(event);
        }
        case 'customer.subscription.updated': {
            return (0, subscription_1.handleSubscriptionUpdated)(event);
        }
        // Fires when the subscription expires, not when the user cancels it
        case 'customer.subscription.deleted': {
            return (0, subscription_1.handleSubscriptionDeleted)(event);
        }
        // list of events that could be handled in the future
        case 'customer.subscription.paused':
        case 'customer.subscription.resumed':
        default: {
            return new Response(null, { status: 200 });
        }
    }
}
//# sourceMappingURL=route.js.map