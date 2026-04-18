"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedStripe = void 0;
const client_1 = require("@onlook/db/src/client");
const stripe_1 = require("@onlook/stripe");
const product_1 = require("@onlook/stripe/src/scripts/dev/product");
const dotenv_1 = require("dotenv");
const schema_1 = require("../../schema");
// Load .env file
(0, dotenv_1.config)({ path: '../../.env' });
const seedStripe = async () => {
    console.log('Getting product and prices...');
    const { product: stripeProduct, prices: stripePrices } = await (0, product_1.getProProductAndPrices)();
    if (!stripeProduct) {
        console.log('Product not found');
        throw new Error('Product not found');
    }
    if (!stripePrices.data.length) {
        console.log('Prices not found');
        throw new Error('Prices not found');
    }
    console.log('Inserting product...');
    const [product] = await client_1.db.insert(schema_1.products).values({
        name: stripeProduct.name,
        type: stripe_1.ProductType.PRO,
        stripeProductId: stripeProduct.id,
    }).returning();
    if (!product)
        throw new Error('Product failed to insert');
    console.log('Inserting prices...');
    await client_1.db.insert(schema_1.prices).values(stripePrices.data.map((price) => {
        const key = price.nickname;
        const priceConfig = stripe_1.PRO_PRODUCT_CONFIG.prices.find(p => p.key === key);
        if (!priceConfig)
            throw new Error(`Price config not found for ${key}`);
        const monthlyMessageLimit = priceConfig.monthlyMessageLimit;
        return {
            productId: product.id,
            key: price.nickname,
            monthlyMessageLimit,
            stripePriceId: price.id,
        };
    }));
};
exports.seedStripe = seedStripe;
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
        await (0, exports.seedStripe)();
        console.log('Stripe seeded!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
})();
//# sourceMappingURL=stripe.js.map