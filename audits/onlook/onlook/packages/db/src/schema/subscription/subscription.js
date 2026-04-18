"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRelations = exports.subscriptions = exports.scheduledSubscriptionAction = exports.subscriptionStatusEnum = void 0;
const stripe_1 = require("@onlook/stripe");
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const user_1 = require("../user/user");
const price_1 = require("./price");
const product_1 = require("./product");
exports.subscriptionStatusEnum = (0, pg_core_1.pgEnum)('subscription_status', stripe_1.SubscriptionStatus);
exports.scheduledSubscriptionAction = (0, pg_core_1.pgEnum)('scheduled_subscription_action', stripe_1.ScheduledSubscriptionAction);
exports.subscriptions = (0, pg_core_1.pgTable)('subscriptions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    // Relationships
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => user_1.users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    productId: (0, pg_core_1.uuid)('product_id').notNull().references(() => product_1.products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    priceId: (0, pg_core_1.uuid)('price_id').notNull().references(() => price_1.prices.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    // Metadata
    startedAt: (0, pg_core_1.timestamp)('started_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: (0, pg_core_1.timestamp)('ended_at', { withTimezone: true }),
    status: (0, exports.subscriptionStatusEnum)('status').default(stripe_1.SubscriptionStatus.ACTIVE).notNull(),
    // Stripe
    stripeCustomerId: (0, pg_core_1.text)('stripe_customer_id').notNull(),
    stripeSubscriptionId: (0, pg_core_1.text)('stripe_subscription_id').notNull().unique(),
    stripeSubscriptionItemId: (0, pg_core_1.text)('stripe_subscription_item_id').notNull().unique(),
    stripeSubscriptionScheduleId: (0, pg_core_1.text)('stripe_subscription_schedule_id'),
    // The current period start and end is used to determine if the subscription has renewed.
    stripeCurrentPeriodStart: (0, pg_core_1.timestamp)('stripe_current_period_start', { withTimezone: true }).notNull(),
    stripeCurrentPeriodEnd: (0, pg_core_1.timestamp)('stripe_current_period_end', { withTimezone: true }).notNull(),
    // Scheduled price change
    scheduledAction: (0, exports.scheduledSubscriptionAction)('scheduled_action'),
    scheduledPriceId: (0, pg_core_1.uuid)('scheduled_price_id').references(() => price_1.prices.id),
    scheduledChangeAt: (0, pg_core_1.timestamp)('scheduled_change_at', { withTimezone: true }),
}).enableRLS();
exports.subscriptionRelations = (0, drizzle_orm_1.relations)(exports.subscriptions, ({ one, many }) => ({
    product: one(product_1.products, {
        fields: [exports.subscriptions.productId],
        references: [product_1.products.id],
    }),
    price: one(price_1.prices, {
        fields: [exports.subscriptions.priceId],
        references: [price_1.prices.id],
    }),
    user: one(user_1.users, {
        fields: [exports.subscriptions.userId],
        references: [user_1.users.id],
    }),
}));
//# sourceMappingURL=subscription.js.map