"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRouter = void 0;
const constants_1 = require("@/utils/constants");
const db_1 = require("@onlook/db");
const stripe_1 = require("@onlook/stripe");
const drizzle_orm_1 = require("drizzle-orm");
const headers_1 = require("next/headers");
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
exports.subscriptionRouter = (0, trpc_1.createTRPCRouter)({
    getLegacySubscriptions: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.user;
        const subscription = await ctx.db.query.legacySubscriptions.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.legacySubscriptions.email, user.email), (0, drizzle_orm_1.isNull)(db_1.legacySubscriptions.redeemAt)),
        });
        return subscription ?? null;
    }),
    get: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.user;
        const subscription = await ctx.db.query.subscriptions.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.subscriptions.userId, user.id), (0, drizzle_orm_1.eq)(db_1.subscriptions.status, stripe_1.SubscriptionStatus.ACTIVE)),
            with: {
                product: true,
                price: true,
            },
        });
        if (!subscription) {
            console.log('No active subscription found for user', user.id);
            return null;
        }
        // If there is a scheduled price, we need to fetch it from the database.
        let scheduledPrice = null;
        if (subscription.scheduledPriceId) {
            scheduledPrice = await ctx.db.query.prices.findFirst({
                where: (0, drizzle_orm_1.eq)(db_1.prices.id, subscription.scheduledPriceId),
            }) ?? null;
        }
        return (0, db_1.fromDbSubscription)(subscription, scheduledPrice);
    }),
    getPriceId: trpc_1.protectedProcedure.input(zod_1.z.object({
        priceKey: zod_1.z.nativeEnum(stripe_1.PriceKey),
    })).mutation(async ({ input, ctx }) => {
        const price = await ctx.db.query.prices.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.prices.key, input.priceKey),
        });
        if (!price) {
            throw new Error(`Price not found for key: ${input.priceKey}`);
        }
        return price.stripePriceId;
    }),
    checkout: trpc_1.protectedProcedure.input(zod_1.z.object({
        priceId: zod_1.z.string(),
    })).mutation(async ({ ctx, input }) => {
        const originUrl = (await (0, headers_1.headers)()).get('origin');
        const user = ctx.user;
        const userData = await ctx.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.users.id, user.id),
        });
        if (!userData) {
            throw new Error('User not found');
        }
        let stripeCustomerId = userData?.stripeCustomerId;
        if (!stripeCustomerId) {
            // Store Stripe's customer ID as it is available in all customer-related events and
            // API requests.
            // Important, it may seem like a good idea to check if the customer already exists
            // by looking up the email in Stripe, however, this can be a security risk since
            // a user may sign up with an email that is not their own.
            // This may happen when a user changes their email address in the app and the email
            // is not updated in Stripe.
            const customer = await (0, stripe_1.createCustomer)({
                name: (userData.firstName
                    ? userData.firstName + ' ' + userData.lastName
                    : userData.displayName) || "",
                email: user.email ?? userData.email,
            });
            await ctx.db.update(db_1.users).set({ stripeCustomerId: customer.id }).where((0, drizzle_orm_1.eq)(db_1.users.id, user.id));
            stripeCustomerId = customer.id;
        }
        const session = await (0, stripe_1.createCheckoutSession)({
            priceId: input.priceId,
            userId: user.id,
            stripeCustomerId,
            successUrl: `${originUrl}${constants_1.Routes.CALLBACK_STRIPE_SUCCESS}`,
            cancelUrl: `${originUrl}${constants_1.Routes.CALLBACK_STRIPE_CANCEL}`,
        });
        return session;
    }),
    manageSubscription: trpc_1.protectedProcedure.mutation(async ({ ctx }) => {
        const user = ctx.user;
        const subscription = await ctx.db.query.subscriptions.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.subscriptions.userId, user.id), (0, drizzle_orm_1.eq)(db_1.subscriptions.status, stripe_1.SubscriptionStatus.ACTIVE)),
        });
        if (!subscription) {
            throw new Error('No active subscription found for user');
        }
        const originUrl = (await (0, headers_1.headers)()).get('origin');
        const session = await (0, stripe_1.createBillingPortalSession)({
            customerId: subscription.stripeCustomerId,
            returnUrl: `${originUrl}/subscription/manage`,
        });
        return session;
    }),
    update: trpc_1.protectedProcedure.input(zod_1.z.object({
        stripeSubscriptionId: zod_1.z.string(),
        stripeSubscriptionItemId: zod_1.z.string(),
        stripePriceId: zod_1.z.string(),
    })).mutation(async ({ input, ctx }) => {
        const { stripeSubscriptionId, stripeSubscriptionItemId, stripePriceId } = input;
        const subscription = await ctx.db.query.subscriptions.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.subscriptions.stripeSubscriptionId, stripeSubscriptionId), (0, drizzle_orm_1.eq)(db_1.subscriptions.stripeSubscriptionItemId, stripeSubscriptionItemId)),
            with: {
                price: true,
            },
        });
        if (!subscription) {
            throw new Error('Subscription not found');
        }
        const currentPrice = subscription.price;
        const newPrice = await ctx.db.query.prices.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.prices.stripePriceId, stripePriceId),
        });
        if (!newPrice) {
            throw new Error(`Price not found for priceId: ${stripePriceId}`);
        }
        // If there is a future scheduled change, we release it.
        if (subscription.stripeSubscriptionScheduleId) {
            await (0, stripe_1.releaseSubscriptionSchedule)({
                subscriptionScheduleId: subscription.stripeSubscriptionScheduleId,
            });
        }
        const isUpgrade = (0, stripe_1.isTierUpgrade)(currentPrice, newPrice);
        if (isUpgrade) {
            // If the new price is higher, we invoice the customer immediately.
            await (0, stripe_1.updateSubscription)({
                subscriptionId: stripeSubscriptionId,
                subscriptionItemId: stripeSubscriptionItemId,
                priceId: stripePriceId,
            });
        }
        else {
            // If the new price is lower, we schedule the change for the end of the current period.
            const schedule = await (0, stripe_1.updateSubscriptionNextPeriod)({
                subscriptionId: stripeSubscriptionId,
                priceId: stripePriceId,
            });
            const endDate = schedule.phases[0]?.end_date;
            const scheduledChangeAt = endDate ? new Date(endDate * 1000) : null;
            await ctx.db.update(db_1.subscriptions).set({
                updatedAt: new Date(),
                scheduledChangeAt,
                scheduledPriceId: newPrice.id,
                stripeSubscriptionScheduleId: schedule.id,
            }).where((0, drizzle_orm_1.eq)(db_1.subscriptions.stripeSubscriptionItemId, stripeSubscriptionItemId)).returning();
        }
    }),
    releaseSubscriptionSchedule: trpc_1.protectedProcedure.input(zod_1.z.object({
        subscriptionScheduleId: zod_1.z.string(),
    })).mutation(async ({ input, ctx }) => {
        try {
            await (0, stripe_1.releaseSubscriptionSchedule)({ subscriptionScheduleId: input.subscriptionScheduleId });
        }
        catch (error) {
            // If the schedule is already released then the code should update the subscription to reflect that.
            // This case is supposed to be handled in the webhook but was implemented here just in case.
            if (!error.toString().includes("You cannot release a subscription schedule that is currently in the `released` status.")) {
                throw error;
            }
        }
        const [updatedSubscription] = await ctx.db.update(db_1.subscriptions).set({
            status: stripe_1.SubscriptionStatus.ACTIVE,
            updatedAt: new Date(),
            scheduledPriceId: null,
            stripeSubscriptionScheduleId: null,
            scheduledChangeAt: null,
        }).where((0, drizzle_orm_1.eq)(db_1.subscriptions.stripeSubscriptionScheduleId, input.subscriptionScheduleId)).returning();
        if (!updatedSubscription) {
            throw new Error('Subscription not found');
        }
        return updatedSubscription;
    }),
});
//# sourceMappingURL=subscription.js.map