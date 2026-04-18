"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceRelations = exports.prices = exports.priceKeys = void 0;
const stripe_1 = require("@onlook/stripe");
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const product_1 = require("./product");
exports.priceKeys = (0, pg_core_1.pgEnum)('price_keys', stripe_1.PriceKey);
exports.prices = (0, pg_core_1.pgTable)('prices', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    // Relationships
    productId: (0, pg_core_1.uuid)('product_id')
        .notNull()
        .references(() => product_1.products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    // Metadata
    key: (0, exports.priceKeys)('price_key').notNull(),
    monthlyMessageLimit: (0, pg_core_1.integer)('monthly_message_limit').notNull(),
    // Stripe
    stripePriceId: (0, pg_core_1.text)('stripe_price_id').notNull().unique(),
}).enableRLS();
exports.priceRelations = (0, drizzle_orm_1.relations)(exports.prices, ({ one }) => ({
    product: one(product_1.products, {
        fields: [exports.prices.productId],
        references: [product_1.products.id],
    }),
}));
//# sourceMappingURL=price.js.map