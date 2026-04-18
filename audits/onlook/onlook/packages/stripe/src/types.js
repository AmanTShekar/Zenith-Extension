"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledSubscriptionAction = exports.SubscriptionStatus = exports.ProductType = void 0;
var ProductType;
(function (ProductType) {
    ProductType["FREE"] = "free";
    ProductType["PRO"] = "pro";
})(ProductType || (exports.ProductType = ProductType = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["CANCELED"] = "canceled";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var ScheduledSubscriptionAction;
(function (ScheduledSubscriptionAction) {
    ScheduledSubscriptionAction["PRICE_CHANGE"] = "price_change";
    ScheduledSubscriptionAction["CANCELLATION"] = "cancellation";
})(ScheduledSubscriptionAction || (exports.ScheduledSubscriptionAction = ScheduledSubscriptionAction = {}));
//# sourceMappingURL=types.js.map