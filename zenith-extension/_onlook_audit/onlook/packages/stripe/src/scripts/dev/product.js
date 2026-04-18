"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupProduct = exports.createProProductWithPrices = exports.getProProductAndPrices = void 0;
const client_1 = require("../../client");
const constants_1 = require("../../constants");
const customer_1 = require("./customer");
const reset_1 = require("./reset");
const getProProductAndPrices = async () => {
    const stripe = (0, client_1.createStripeClient)();
    const productName = constants_1.PRO_PRODUCT_CONFIG.name;
    // Find existing product
    const products = await stripe.products.list({ active: true });
    const product = products.data.find((p) => p.name === productName);
    if (!product) {
        throw new Error('Product not found');
    }
    const prices = await stripe.prices.list({ product: product.id, limit: 100 });
    if (!prices.data.length) {
        throw new Error('Prices not found');
    }
    return { product, prices };
};
exports.getProProductAndPrices = getProProductAndPrices;
async function createPrices(stripe, productId, priceConfig) {
    const price = await stripe.prices.create({
        product: productId,
        currency: 'usd',
        unit_amount: priceConfig.cost,
        recurring: {
            usage_type: 'licensed',
            interval: priceConfig.paymentInterval,
        },
        nickname: priceConfig.key,
    });
    return { key: priceConfig.key, price };
}
const createProProductWithPrices = async (stripe) => {
    console.log('Creating product...');
    const product = await stripe.products.create({ name: constants_1.PRO_PRODUCT_CONFIG.name });
    const priceMap = new Map();
    for (const priceConfig of constants_1.PRO_PRODUCT_CONFIG.prices) {
        console.log(`Creating price for ${priceConfig.key}...`);
        const { key, price } = await createPrices(stripe, product.id, priceConfig);
        priceMap.set(key, price);
    }
    return { product, priceMap };
};
exports.createProProductWithPrices = createProProductWithPrices;
/**
 * Create a product with a tiered pricing structure.
 */
const setupProduct = async () => {
    const stripe = (0, client_1.createStripeClient)();
    const productName = constants_1.PRO_PRODUCT_CONFIG.name;
    console.log('Cleaning up existing product and related resources');
    // Clean up any existing product and related resources
    await (0, reset_1.cleanupExistingProduct)(stripe, productName);
    const { product, priceMap } = await (0, exports.createProProductWithPrices)(stripe);
    const { customer, subscription } = await (0, customer_1.createTestCustomerAndSubscribe)(stripe, priceMap.get(constants_1.PriceKey.PRO_MONTHLY_TIER_1));
    // Upgrade the customer to the next tier
    await stripe.subscriptions.update(subscription.id, {
        items: [{ price: priceMap.get(constants_1.PriceKey.PRO_MONTHLY_TIER_2).id }],
    });
    return { product, priceMap, customer, subscription };
};
exports.setupProduct = setupProduct;
//# sourceMappingURL=product.js.map