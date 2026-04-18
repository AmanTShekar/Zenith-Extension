"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferPageFromUrl = exports.getPublishUrls = exports.getValidSubdomain = void 0;
exports.getValidUrl = getValidUrl;
exports.isApexDomain = isApexDomain;
exports.prependHttp = prependHttp;
const normalize_url_1 = __importDefault(require("normalize-url"));
const tldts_1 = require("tldts");
function getValidUrl(url) {
    // If the url is not https, convert it to https
    const prependedUrl = prependHttp(url);
    const normalizedUrl = (0, normalize_url_1.default)(prependedUrl);
    return normalizedUrl;
}
function isApexDomain(domain) {
    const parsed = (0, tldts_1.parse)(domain);
    if (parsed.subdomain) {
        return {
            isValid: false,
            error: 'Please enter a domain without subdomains (e.g., example.com or example.co.uk)',
        };
    }
    if (!parsed.publicSuffix) {
        return {
            isValid: false,
            error: 'Please enter a domain with suffix (e.g., example.com or example.co.uk)',
        };
    }
    return {
        isValid: true,
    };
}
function prependHttp(url, { https = true } = {}) {
    if (typeof url !== 'string') {
        throw new TypeError(`Expected \`url\` to be of type \`string\`, got \`${typeof url}\``);
    }
    url = url.trim();
    if (/^\.*\/|^(?!localhost)(\w+?:)/.test(url)) {
        return url;
    }
    // Special case for localhost - use http:// instead of https://
    if (url.startsWith('localhost')) {
        return `http://${url}`;
    }
    return url.replace(/^(?!(?:\w+?:)?\/\/)/, https ? 'https://' : 'http://');
}
const getValidSubdomain = (subdomain) => {
    // Make this a valid subdomain by:
    // 1. Converting to lowercase
    // 2. Replacing invalid characters with hyphens
    // 3. Removing consecutive hyphens
    // 4. Removing leading/trailing hyphens
    return subdomain
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};
exports.getValidSubdomain = getValidSubdomain;
const getPublishUrls = (url) => {
    // Return a list including url and www.url
    return [url, `www.${url}`];
};
exports.getPublishUrls = getPublishUrls;
const inferPageFromUrl = (url) => {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        if (pathname === '/' || pathname === '') {
            return { name: 'Home', path: '/' };
        }
        const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        const pageName = lastSegment ? lastSegment.replace(/[-_]/g, ' ') : 'page';
        return { name: pageName, path: pathname };
    }
    catch (error) {
        console.error('Failed to parse URL:', error);
        return { name: 'Unknown Page', path: '/' };
    }
};
exports.inferPageFromUrl = inferPageFromUrl;
//# sourceMappingURL=urls.js.map