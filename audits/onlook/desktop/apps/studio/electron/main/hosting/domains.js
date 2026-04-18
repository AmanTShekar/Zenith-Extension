"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomDomains = getCustomDomains;
exports.getOwnedDomains = getOwnedDomains;
exports.createDomainVerification = createDomainVerification;
exports.verifyDomain = verifyDomain;
const constants_1 = require("@onlook/models/constants");
const auth_1 = require("../auth");
async function getCustomDomains() {
    const authTokens = await (0, auth_1.getRefreshedAuthTokens)();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_API_URL}${constants_1.FUNCTIONS_ROUTE}${constants_1.BASE_API_ROUTE}${constants_1.ApiRoutes.HOSTING}${constants_1.ApiRoutes.CUSTOM_DOMAINS}`, {
        headers: {
            Authorization: `Bearer ${authTokens.accessToken}`,
        },
    });
    const customDomains = (await res.json());
    if (customDomains.error) {
        throw new Error(`Failed to get custom domains, error: ${customDomains.error}`);
    }
    return customDomains.data;
}
async function getOwnedDomains() {
    try {
        const authTokens = await (0, auth_1.getRefreshedAuthTokens)();
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_API_URL}${constants_1.FUNCTIONS_ROUTE}${constants_1.BASE_API_ROUTE}${constants_1.ApiRoutes.HOSTING_V2}${constants_1.HostingRoutes.OWNED_DOMAINS}`, {
            headers: {
                Authorization: `Bearer ${authTokens.accessToken}`,
            },
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(`Failed to get owned domains, error: ${error.error.message}`);
        }
        const ownedDomains = (await res.json());
        if (!ownedDomains.success) {
            throw new Error(`Failed to get owned domains, error: ${ownedDomains.message}`);
        }
        return ownedDomains;
    }
    catch (error) {
        console.error('Failed to get owned domains', error);
        return {
            success: false,
            message: `${error}`,
        };
    }
}
async function createDomainVerification(domain) {
    try {
        const authTokens = await (0, auth_1.getRefreshedAuthTokens)();
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_API_URL}${constants_1.FUNCTIONS_ROUTE}${constants_1.BASE_API_ROUTE}${constants_1.ApiRoutes.HOSTING_V2}${constants_1.HostingRoutes.CREATE_DOMAIN_VERIFICATION}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authTokens.accessToken}`,
            },
            body: JSON.stringify({ domain }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(`Failed to create domain verification, error: ${error.error.message}`);
        }
        const domainVerification = (await res.json());
        if (domainVerification.error) {
            throw new Error(`Failed to create domain verification, error: ${domainVerification.error}`);
        }
        return {
            success: true,
            message: 'Domain verification created',
            verificationCode: domainVerification.data.verificationCode,
        };
    }
    catch (error) {
        console.error('Failed to create domain verification', error);
        return {
            success: false,
            message: `${error}`,
        };
    }
}
async function verifyDomain(domain) {
    try {
        const authTokens = await (0, auth_1.getRefreshedAuthTokens)();
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_API_URL}${constants_1.FUNCTIONS_ROUTE}${constants_1.BASE_API_ROUTE}${constants_1.ApiRoutes.HOSTING_V2}${constants_1.HostingRoutes.VERIFY_DOMAIN}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authTokens.accessToken}`,
            },
            body: JSON.stringify({ domain }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(`Failed to verify domain, error: ${error.error.message}`);
        }
        const domainVerification = (await res.json());
        return {
            success: domainVerification.success,
            message: 'Domain verified',
        };
    }
    catch (error) {
        console.error('Failed to verify domain', error);
        return {
            success: false,
            message: `${error}`,
        };
    }
}
//# sourceMappingURL=domains.js.map