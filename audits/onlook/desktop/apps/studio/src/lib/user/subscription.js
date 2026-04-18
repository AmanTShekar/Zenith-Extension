"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionManager = void 0;
const constants_1 = require("@onlook/models/constants");
const usage_1 = require("@onlook/models/usage");
const mobx_1 = require("mobx");
const utils_1 = require("../utils");
class SubscriptionManager {
    plan = usage_1.UsagePlanType.BASIC;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
        this.restoreCachedPlan();
        this.getPlanFromServer();
    }
    restoreCachedPlan() {
        const cachedPlan = localStorage?.getItem('currentPlan');
        this.plan = cachedPlan || usage_1.UsagePlanType.BASIC;
    }
    async updatePlan(plan) {
        this.plan = plan;
        localStorage.setItem('currentPlan', plan);
        await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.UPDATE_USER_METADATA, { plan });
    }
    async getPlanFromServer() {
        try {
            const res = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.CHECK_SUBSCRIPTION);
            if (!res?.success) {
                throw new Error(res?.error || 'Error checking premium status');
            }
            const newPlan = res.data.name === 'pro' ? usage_1.UsagePlanType.PRO : usage_1.UsagePlanType.BASIC;
            await this.updatePlan(newPlan);
            return newPlan;
        }
        catch (error) {
            console.error('Error checking premium status:', error);
            return usage_1.UsagePlanType.BASIC;
        }
    }
}
exports.SubscriptionManager = SubscriptionManager;
//# sourceMappingURL=subscription.js.map