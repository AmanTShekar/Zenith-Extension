"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FREE_PRODUCT_CONFIG = exports.PRO_PRODUCT_CONFIG = exports.PRO_PRICES = exports.PriceKey = void 0;
const types_1 = require("./types");
var PriceKey;
(function (PriceKey) {
    PriceKey["PRO_MONTHLY_TIER_1"] = "PRO_MONTHLY_TIER_1";
    PriceKey["PRO_MONTHLY_TIER_2"] = "PRO_MONTHLY_TIER_2";
    PriceKey["PRO_MONTHLY_TIER_3"] = "PRO_MONTHLY_TIER_3";
    PriceKey["PRO_MONTHLY_TIER_4"] = "PRO_MONTHLY_TIER_4";
    PriceKey["PRO_MONTHLY_TIER_5"] = "PRO_MONTHLY_TIER_5";
    PriceKey["PRO_MONTHLY_TIER_6"] = "PRO_MONTHLY_TIER_6";
    PriceKey["PRO_MONTHLY_TIER_7"] = "PRO_MONTHLY_TIER_7";
    PriceKey["PRO_MONTHLY_TIER_8"] = "PRO_MONTHLY_TIER_8";
    PriceKey["PRO_MONTHLY_TIER_9"] = "PRO_MONTHLY_TIER_9";
    PriceKey["PRO_MONTHLY_TIER_10"] = "PRO_MONTHLY_TIER_10";
    PriceKey["PRO_MONTHLY_TIER_11"] = "PRO_MONTHLY_TIER_11";
})(PriceKey || (exports.PriceKey = PriceKey = {}));
exports.PRO_PRICES = [
    { description: '100 Messages per Month', key: PriceKey.PRO_MONTHLY_TIER_1, name: 'Tier 1', product: types_1.ProductType.PRO, monthlyMessageLimit: 100, cost: 2500, paymentInterval: 'month' },
    { description: '200 Messages per Month', key: PriceKey.PRO_MONTHLY_TIER_2, name: 'Tier 2', product: types_1.ProductType.PRO, monthlyMessageLimit: 200, cost: 5000, paymentInterval: 'month' },
    { description: '400 Messages per Month', key: PriceKey.PRO_MONTHLY_TIER_3, name: 'Tier 3', product: types_1.ProductType.PRO, monthlyMessageLimit: 400, cost: 10000, paymentInterval: 'month' },
    { description: '800 Messages per Month', key: PriceKey.PRO_MONTHLY_TIER_4, name: 'Tier 4', product: types_1.ProductType.PRO, monthlyMessageLimit: 800, cost: 20000, paymentInterval: 'month' },
    { description: '1,200 Messages per Month', key: PriceKey.PRO_MONTHLY_TIER_5, name: 'Tier 5', product: types_1.ProductType.PRO, monthlyMessageLimit: 1200, cost: 29400, paymentInterval: 'month' },
    { description: '2,000 Messages per Month', key: PriceKey.PRO_MONTHLY_TIER_6, name: 'Tier 6', product: types_1.ProductType.PRO, monthlyMessageLimit: 2000, cost: 48000, paymentInterval: 'month' },
    { description: '3,000 Messages per Month', key: PriceKey.PRO_MONTHLY_TIER_7, name: 'Tier 7', product: types_1.ProductType.PRO, monthlyMessageLimit: 3000, cost: 70500, paymentInterval: 'month' },
    { description: '4,000 Messages per Month', key: PriceKey.PRO_MONTHLY_TIER_8, name: 'Tier 8', product: types_1.ProductType.PRO, monthlyMessageLimit: 4000, cost: 92000, paymentInterval: 'month' },
    { description: '5,000 Messages per Month', key: PriceKey.PRO_MONTHLY_TIER_9, name: 'Tier 9', product: types_1.ProductType.PRO, monthlyMessageLimit: 5000, cost: 112500, paymentInterval: 'month' },
    { description: '7,500 Messages per Month', key: PriceKey.PRO_MONTHLY_TIER_10, name: 'Tier 10', product: types_1.ProductType.PRO, monthlyMessageLimit: 7500, cost: 187500, paymentInterval: 'month' },
    { description: 'Unlimited Messages per Month', key: PriceKey.PRO_MONTHLY_TIER_11, name: 'Tier 11', product: types_1.ProductType.PRO, monthlyMessageLimit: 99999, cost: 375000, paymentInterval: 'month' },
];
exports.PRO_PRODUCT_CONFIG = {
    name: 'Onlook Pro',
    prices: exports.PRO_PRICES,
};
exports.FREE_PRODUCT_CONFIG = {
    name: 'Free',
    type: types_1.ProductType.FREE,
    stripeProductId: '',
    dailyLimit: 5,
    monthlyLimit: 50,
};
//# sourceMappingURL=constants.js.map