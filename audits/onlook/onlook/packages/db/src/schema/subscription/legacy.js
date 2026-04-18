"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacySubscriptions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.legacySubscriptions = (0, pg_core_1.pgTable)('legacy_subscriptions', {
    email: (0, pg_core_1.text)('email').notNull().primaryKey(),
    stripeCouponId: (0, pg_core_1.text)('stripe_coupon_id').notNull(),
    stripePromotionCodeId: (0, pg_core_1.text)('stripe_promotion_code_id').notNull(),
    stripePromotionCode: (0, pg_core_1.text)('stripe_promotion_code').notNull(),
    redeemAt: (0, pg_core_1.timestamp)('redeem_at', { withTimezone: true }),
    redeemBy: (0, pg_core_1.timestamp)('redeem_by', { withTimezone: true }),
}).enableRLS();
//# sourceMappingURL=legacy.js.map