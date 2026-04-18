"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnUrlQueryParam = getReturnUrlQueryParam;
exports.sanitizeReturnUrl = sanitizeReturnUrl;
const constants_1 = require("@/utils/constants");
function getReturnUrlQueryParam(returnUrl) {
    return returnUrl ? `${constants_1.LocalForageKeys.RETURN_URL}=${encodeURIComponent(returnUrl)}` : '';
}
function sanitizeReturnUrl(returnUrl, opts = {}) {
    // Default to home page if no return URL
    if (!returnUrl) {
        return constants_1.Routes.HOME;
    }
    try {
        // If it's a relative path, it's safe
        if (returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
            return returnUrl;
        }
        // Resolve current origin from options or the browser (if available)
        const currentOrigin = opts.origin ?? (typeof window !== 'undefined' ? window.location.origin : undefined);
        // On the server (no origin), reject non-relative URLs
        if (!currentOrigin) {
            return constants_1.Routes.HOME;
        }
        // Parse as URL to check if it's same-origin
        const url = new URL(returnUrl, currentOrigin);
        // Only allow same-origin URLs; return a path-only value
        if (url.origin === currentOrigin) {
            return url.pathname + url.search + url.hash;
        }
    }
    catch {
        // Invalid URL format, fall back to default
    }
    // Default to home page for any invalid or external URLs
    return constants_1.Routes.HOME;
}
//# sourceMappingURL=index.js.map