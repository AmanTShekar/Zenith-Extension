"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.products = exports.productType = void 0;
const stripe_1 = require("@onlook/stripe");
const pg_core_1 = require("drizzle-orm/pg-core");
exports.productType = (0, pg_core_1.pgEnum)('product_type', stripe_1.ProductType);
exports.products = (0, pg_core_1.pgTable)('products', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)('name').notNull(),
    type: (0, exports.productType)('type').notNull(),
    // Stripe
    stripeProductId: (0, pg_core_1.text)('stripe_product_id').notNull().unique(),
}).enableRLS();
//# sourceMappingURL=product.js.map