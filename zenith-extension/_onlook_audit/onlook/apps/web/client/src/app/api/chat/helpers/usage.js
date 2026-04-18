"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrementUsage = exports.incrementUsage = exports.getSupabaseUser = exports.checkMessageLimit = void 0;
const request_server_1 = require("@/trpc/request-server");
const request_server_2 = require("@/utils/supabase/request-server");
const models_1 = require("@onlook/models");
const checkMessageLimit = async (req) => {
    const { api } = await (0, request_server_1.createClient)(req);
    const usage = await api.usage.get();
    const dailyUsage = usage.daily;
    const dailyExceeded = dailyUsage.usageCount >= dailyUsage.limitCount;
    if (dailyExceeded) {
        return {
            exceeded: true,
            usage: dailyUsage,
        };
    }
    const monthlyUsage = usage.monthly;
    const monthlyExceeded = monthlyUsage.usageCount >= monthlyUsage.limitCount;
    if (monthlyExceeded) {
        return {
            exceeded: true,
            usage: monthlyUsage,
        };
    }
    return {
        exceeded: false,
        usage: monthlyUsage,
    };
};
exports.checkMessageLimit = checkMessageLimit;
const getSupabaseUser = async (request) => {
    const supabase = await (0, request_server_2.createClient)(request);
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};
exports.getSupabaseUser = getSupabaseUser;
const incrementUsage = async (req, traceId) => {
    try {
        const user = await (0, exports.getSupabaseUser)(req);
        if (!user) {
            throw new Error('User not found');
        }
        const { api } = await (0, request_server_1.createClient)(req);
        const incrementRes = await api.usage.increment({
            type: models_1.UsageType.MESSAGE,
            traceId,
        });
        return {
            usageRecordId: incrementRes?.usageRecordId,
            rateLimitId: incrementRes?.rateLimitId,
        };
    }
    catch (error) {
        console.error('Error in chat usage increment', error);
    }
    return null;
};
exports.incrementUsage = incrementUsage;
const decrementUsage = async (req, usageRecord) => {
    try {
        if (!usageRecord) {
            return;
        }
        const { usageRecordId, rateLimitId } = usageRecord;
        // We should call revertIncrement even if only one of the IDs is available
        // For free plan users, rateLimitId will be undefined but we still want to delete the usage record
        if (!usageRecordId && !rateLimitId) {
            return;
        }
        const { api } = await (0, request_server_1.createClient)(req);
        await api.usage.revertIncrement({ usageRecordId, rateLimitId });
    }
    catch (error) {
        console.error('Error in chat usage decrement', error);
    }
};
exports.decrementUsage = decrementUsage;
//# sourceMappingURL=usage.js.map