"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitRelations = exports.rateLimits = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const subscription_1 = require("../subscription");
const user_1 = require("../user");
exports.rateLimits = (0, pg_core_1.pgTable)('rate_limits', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    // Relationships
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => user_1.users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    subscriptionId: (0, pg_core_1.uuid)('subscription_id')
        .notNull()
        .references(() => subscription_1.subscriptions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    // Metadata
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
    // The start and end of the rate limit defines the time period for which the rate limit is applied
    // There can be multiple rate limits per subscription and the range doesn't have to match the subscription's
    // start and end dates.
    startedAt: (0, pg_core_1.timestamp)('started_at', { withTimezone: true }).notNull(),
    endedAt: (0, pg_core_1.timestamp)('ended_at', { withTimezone: true }).notNull(),
    // The number of requests that can be made within the time period.
    // For carry-over limits, this reflects the total number of requests that were carried over.
    max: (0, pg_core_1.integer)('max').notNull(),
    // The number of requests left to make within the time period.
    left: (0, pg_core_1.integer)('left').notNull().default(0),
    // This key identifies the rate limit that is carried over.
    // Useful for analytics and debugging and possibly displaying to the user.
    carryOverKey: (0, pg_core_1.uuid)('carry_over_key').notNull(),
    // Track the number of times this rate limit has been carried over.
    carryOverTotal: (0, pg_core_1.integer)('carry_over_total').notNull().default(0),
    // When upgrading a subscription, the subscription item ID is updated.
    // Due to slight limitations of the Stripe API, we need to track the subscription item ID.
    stripeSubscriptionItemId: (0, pg_core_1.text)('stripe_subscription_item_id').notNull(),
}, (table) => [
    (0, pg_core_1.index)('rate_limits_user_time_idx').on(table.userId, table.startedAt, table.endedAt)
]).enableRLS();
exports.rateLimitRelations = (0, drizzle_orm_1.relations)(exports.rateLimits, ({ one, many }) => ({
    user: one(user_1.users, {
        fields: [exports.rateLimits.userId],
        references: [user_1.users.id],
    }),
    subscription: one(subscription_1.subscriptions, {
        fields: [exports.rateLimits.subscriptionId],
        references: [subscription_1.subscriptions.id],
    }),
}));
//# sourceMappingURL=rate-limits.js.map