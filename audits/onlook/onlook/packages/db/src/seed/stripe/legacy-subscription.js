"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedLegacySubscriptions = void 0;
const legacy_1 = require("@/schema/subscription/legacy");
const client_1 = require("@onlook/db/src/client");
const client_2 = require("@onlook/stripe/src/client");
const coupon_1 = require("@onlook/stripe/src/scripts/production/coupon");
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// Load .env file
(0, dotenv_1.config)({ path: '../../.env' });
const seedLegacySubscriptions = async () => {
    const stripe = (0, client_2.createStripeClient)();
    // Read all legacy subscriptions from csv file
    console.log('Getting legacy subscriptions emails...');
    const emails = (0, fs_1.readFileSync)(path_1.default.join(__dirname, './subscriptions.csv'), 'utf8').split('\n');
    // Create a stripe coupon
    console.log('Create Coupon...');
    const { id: stripeCouponId, redeemBy } = await (0, coupon_1.createLegacyCoupon)(stripe);
    // Create a code for each email
    for (const email of emails) {
        if (!email)
            continue;
        const { id: stripePromotionCodeId, code: stripePromotionCode } = await (0, coupon_1.createCodeForCoupon)(stripe, stripeCouponId, email);
        await client_1.db.insert(legacy_1.legacySubscriptions).values({
            email,
            stripeCouponId,
            stripePromotionCodeId,
            stripePromotionCode,
            redeemBy
        });
        console.log(`Created legacy subscription for ${email}`);
    }
};
exports.seedLegacySubscriptions = seedLegacySubscriptions;
(async () => {
    try {
        if (!process.env.SUPABASE_DATABASE_URL || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const missingVars = [];
            if (!process.env.SUPABASE_DATABASE_URL)
                missingVars.push('SUPABASE_DATABASE_URL');
            if (!process.env.SUPABASE_URL)
                missingVars.push('SUPABASE_URL');
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
                missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
            throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
        }
        console.log('Seeding stripe...');
        await (0, exports.seedLegacySubscriptions)();
        console.log('Stripe seeded!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
})();
//# sourceMappingURL=legacy-subscription.js.map