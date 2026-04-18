"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
const product_1 = require("../dev/product");
const createProductionProduct = async () => {
    const stripe = (0, client_1.createStripeClient)();
    const { product, priceMap } = await (0, product_1.createProProductWithPrices)(stripe);
    console.log('Product created:', product);
    console.log('Price map:', priceMap);
};
if (import.meta.main) {
    console.log('Setting up product...');
    try {
        await createProductionProduct();
        console.log('Product setup completed successfully!');
    }
    catch (error) {
        console.error('Error setting up product', error);
    }
}
//# sourceMappingURL=product-price.js.map