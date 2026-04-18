"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const domain_1 = require("../src/domain");
(0, bun_test_1.describe)('createSecureUrl', () => {
    (0, bun_test_1.it)('should return an empty string for an undefined value', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)(undefined)).toBe('');
    });
    (0, bun_test_1.it)('should return an empty string for a null value', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)(null)).toBe('');
    });
    (0, bun_test_1.it)('should return an empty string for an empty string', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)('')).toBe('');
    });
    (0, bun_test_1.it)('should return an empty string for a whitespace string', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)('   ')).toBe('');
    });
    (0, bun_test_1.it)('should add https to a domain without a protocol', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)('onlook.dev')).toBe('https://onlook.dev');
    });
    (0, bun_test_1.it)('should convert http to https', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)('http://onlook.dev')).toBe('https://onlook.dev');
    });
    (0, bun_test_1.it)('should keep an existing https protocol', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)('https://onlook.dev')).toBe('https://onlook.dev');
    });
    (0, bun_test_1.it)('should handle domains with paths and queries', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)('onlook.dev/path?query=1')).toBe('https://onlook.dev/path?query=1');
    });
    (0, bun_test_1.it)('should handle www subdomains', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)('www.onlook.dev')).toBe('https://www.onlook.dev');
    });
    (0, bun_test_1.it)('should trim whitespace from the url', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)('  http://onlook.dev/path ')).toBe('https://onlook.dev/path');
    });
    (0, bun_test_1.it)('should return an empty string for an invalid url string', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)('this is not a url')).toBe('');
    });
    (0, bun_test_1.it)('should return an empty string for a url that only contains a protocol', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)('http://')).toBe('');
    });
    (0, bun_test_1.it)('should handle other protocols and convert them to https', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)('ftp://onlook.dev')).toBe('https://onlook.dev');
    });
    (0, bun_test_1.it)('should return an empty string for a url that does not contain a domain', () => {
        (0, bun_test_1.expect)((0, domain_1.createSecureUrl)('a')).toBe('');
    });
});
//# sourceMappingURL=domain.test.js.map