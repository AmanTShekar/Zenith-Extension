"use strict";
/**
 * Domain utility functions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecureUrl = exports.isValidDomain = exports.getRootDomain = exports.isSubdomain = exports.verifyDomainOwnership = void 0;
const normalize_url_1 = __importDefault(require("normalize-url"));
/**
 * Verifies domain ownership by checking various conditions
 * @param requestDomains - Array of domains to verify
 * @param ownedDomains - Array of domains that are owned
 * @param hostingDomain - The main hosting domain (optional)
 * @returns True if all request domains are owned or valid, false otherwise
 */
const verifyDomainOwnership = (requestDomains, ownedDomains, hostingDomain) => {
    return requestDomains.every((requestDomain) => {
        // Check if domain is directly owned
        if (ownedDomains.includes(requestDomain)) {
            return true;
        }
        // Check if www version of owned domain
        const withoutWww = requestDomain.replace(/^www\./, '');
        if (ownedDomains.includes(withoutWww)) {
            return true;
        }
        // Check if subdomain of hosting domain
        if (hostingDomain && requestDomain.endsWith(`.${hostingDomain}`)) {
            return true;
        }
        return false;
    });
};
exports.verifyDomainOwnership = verifyDomainOwnership;
/**
 * Checks if a domain is a subdomain of a given parent domain
 * @param domain - The domain to check
 * @param parentDomain - The parent domain
 * @returns True if domain is a subdomain of parentDomain
 */
const isSubdomain = (domain, parentDomain) => {
    return domain !== parentDomain && domain.endsWith(`.${parentDomain}`);
};
exports.isSubdomain = isSubdomain;
/**
 * Extracts the root domain from a full domain (removes subdomains)
 * @param domain - The domain to extract root from
 * @returns The root domain
 */
const getRootDomain = (domain) => {
    const parts = domain.split('.');
    if (parts.length <= 2) {
        return domain;
    }
    return parts.slice(-2).join('.');
};
exports.getRootDomain = getRootDomain;
/**
 * Validates if a string is a valid domain format
 * @param domain - The domain string to validate
 * @returns True if the domain format is valid
 */
const isValidDomain = (domain) => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
    return domainRegex.test(domain) && domain.length <= 253;
};
exports.isValidDomain = isValidDomain;
/**
 * Creates a secure URL from a given URL string
 * @param url - The URL string to create a secure URL from
 * @returns The secure URL string
 */
const createSecureUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return '';
    }
    try {
        const normalizedUrl = (0, normalize_url_1.default)(url, {
            forceHttps: true,
            stripAuthentication: true,
            removeTrailingSlash: true,
            stripWWW: false,
            defaultProtocol: 'https',
        });
        // For single-word strings like 'test', normalize-url returns 'https://test',
        // which is not what we want. A valid domain should have at least one dot.
        const { protocol, hostname, pathname } = new URL(normalizedUrl);
        if (!hostname.includes('.') && pathname === '/') {
            return '';
        }
        if (protocol !== 'https:' && protocol !== 'http:') {
            const urlObject = new URL(normalizedUrl);
            urlObject.protocol = 'https:';
            return urlObject.toString().replace(/\/$/, '');
        }
        return normalizedUrl;
    }
    catch (error) {
        // Invalid URL format
        console.error(`Invalid URL format. Input: "${url}", Error: ${error instanceof Error ? error.message : error}`);
        return '';
    }
};
exports.createSecureUrl = createSecureUrl;
//# sourceMappingURL=domain.js.map