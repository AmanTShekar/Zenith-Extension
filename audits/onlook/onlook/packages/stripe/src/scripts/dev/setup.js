"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const product_1 = require("./product");
if (import.meta.main) {
    console.log('Setting up product...');
    try {
        await (0, product_1.setupProduct)();
        console.log('Product setup completed successfully!');
    }
    catch (error) {
        console.error('Error setting up product', error);
    }
}
//# sourceMappingURL=setup.js.map