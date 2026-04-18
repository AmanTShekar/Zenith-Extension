"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLegacyCoupon = exports.createCodeForCoupon = void 0;
const uuid_1 = require("uuid");
const createCodeForCoupon = async (stripe, stripeCouponId, email) => {
    const promotionCode = await stripe.promotionCodes.create({
        coupon: stripeCouponId,
        code: (0, uuid_1.v4)(),
        max_redemptions: 1,
        metadata: {
            email,
        },
    });
    return {
        id: promotionCode.id,
        code: promotionCode.code,
    };
};
exports.createCodeForCoupon = createCodeForCoupon;
const createLegacyCoupon = async (stripe) => {
    const redeemBy = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 90); // 90 days from now
    const coupon = await stripe.coupons.create({
        amount_off: 2500, // $25
        currency: 'usd',
        duration: 'once',
        name: 'Desktop Pro User',
        redeem_by: redeemBy,
        metadata: {
            type: 'legacy'
        },
    });
    return {
        id: coupon.id,
        redeemBy: new Date(redeemBy * 1000),
    };
};
exports.createLegacyCoupon = createLegacyCoupon;
//# sourceMappingURL=coupon.js.map