"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageSubscription = exports.checkSubscription = exports.checkoutWithStripe = void 0;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const auth_1 = require("../auth");
const checkoutWithStripe = async () => {
    try {
        const checkoutUrl = await createCheckoutSession();
        electron_1.shell.openExternal(checkoutUrl);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
exports.checkoutWithStripe = checkoutWithStripe;
const createCheckoutSession = async () => {
    const authTokens = await (0, auth_1.getRefreshedAuthTokens)();
    if (!authTokens) {
        throw new Error('No auth tokens found');
    }
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_API_URL}${constants_1.FUNCTIONS_ROUTE}${constants_1.BASE_API_ROUTE}${constants_1.ApiRoutes.CREATE_CHECKOUT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authTokens.accessToken}`,
        },
    });
    const { url } = await response.json();
    if (!url) {
        throw new Error('No checkout URL received');
    }
    return url;
};
const checkSubscription = async () => {
    try {
        const authTokens = await (0, auth_1.getRefreshedAuthTokens)();
        if (!authTokens) {
            throw new Error('No auth tokens found');
        }
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_API_URL}${constants_1.FUNCTIONS_ROUTE}${constants_1.BASE_API_ROUTE}${constants_1.ApiRoutes.CHECK_SUBSCRIPTION}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authTokens.accessToken}`,
            },
        });
        const { data, error } = await response.json();
        if (error || !data) {
            throw new Error(error);
        }
        return { success: true, data };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
exports.checkSubscription = checkSubscription;
const manageSubscription = async () => {
    try {
        const subscriptionUrl = await createCustomerPortalSession();
        electron_1.shell.openExternal(subscriptionUrl);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
exports.manageSubscription = manageSubscription;
const createCustomerPortalSession = async () => {
    const authTokens = await (0, auth_1.getRefreshedAuthTokens)();
    if (!authTokens) {
        throw new Error('No auth tokens found');
    }
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_API_URL}${constants_1.FUNCTIONS_ROUTE}${constants_1.BASE_API_ROUTE}${constants_1.ApiRoutes.CREATE_CUSTOMER_PORTAL_SESSION}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authTokens.accessToken}`,
        },
    });
    const { url } = await response.json();
    if (!url) {
        throw new Error('No subscription URL received');
    }
    return url;
};
//# sourceMappingURL=index.js.map