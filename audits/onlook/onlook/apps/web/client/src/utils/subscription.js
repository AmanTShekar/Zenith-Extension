"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserSubscriptionAccess = checkUserSubscriptionAccess;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("@onlook/db");
const client_1 = require("@onlook/db/src/client");
const stripe_1 = require("@onlook/stripe");
async function checkUserSubscriptionAccess(userId, userEmail) {
    const subscription = await client_1.db.query.subscriptions.findFirst({
        where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.subscriptions.userId, userId), (0, drizzle_orm_1.eq)(db_1.subscriptions.status, stripe_1.SubscriptionStatus.ACTIVE)),
    });
    const legacySubscription = userEmail
        ? await client_1.db.query.legacySubscriptions.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.legacySubscriptions.email, userEmail), (0, drizzle_orm_1.isNull)(db_1.legacySubscriptions.redeemAt)),
        })
        : null;
    return {
        hasActiveSubscription: !!subscription,
        hasLegacySubscription: !!legacySubscription,
    };
}
//# sourceMappingURL=subscription.js.map