"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const urls_1 = require("../src/urls");
// Mock console.error to suppress expected error logs in tests
let originalConsoleError;
(0, bun_test_1.describe)('inferPageFromUrl', () => {
    (0, bun_test_1.beforeEach)(() => {
        originalConsoleError = console.error;
    });
    (0, bun_test_1.afterEach)(() => {
        console.error = originalConsoleError;
    });
    (0, bun_test_1.describe)('Root path handling', () => {
        (0, bun_test_1.it)('should return Home for root path', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/')).toEqual({
                name: 'Home',
                path: '/',
            });
        });
        (0, bun_test_1.it)('should return Home for URL without trailing slash', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com')).toEqual({
                name: 'Home',
                path: '/',
            });
        });
        (0, bun_test_1.it)('should return Home for localhost root', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('http://localhost:3000/')).toEqual({
                name: 'Home',
                path: '/',
            });
        });
    });
    (0, bun_test_1.describe)('Single path segment', () => {
        (0, bun_test_1.it)('should extract page name from single segment', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/about')).toEqual({
                name: 'about',
                path: '/about',
            });
        });
        (0, bun_test_1.it)('should handle dashes in page names', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/contact-us')).toEqual({
                name: 'contact us',
                path: '/contact-us',
            });
        });
        (0, bun_test_1.it)('should handle underscores in page names', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/user_profile')).toEqual({
                name: 'user profile',
                path: '/user_profile',
            });
        });
        (0, bun_test_1.it)('should handle mixed dashes and underscores', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/user-profile_settings')).toEqual({
                name: 'user profile settings',
                path: '/user-profile_settings',
            });
        });
        (0, bun_test_1.it)('should handle multiple consecutive dashes/underscores', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/test--page__name')).toEqual({
                name: 'test  page  name',
                path: '/test--page__name',
            });
        });
    });
    (0, bun_test_1.describe)('Multiple path segments', () => {
        (0, bun_test_1.it)('should return the last segment as page name', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/blog/post-title')).toEqual({
                name: 'post title',
                path: '/blog/post-title',
            });
        });
        (0, bun_test_1.it)('should handle deep nested paths', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/admin/users/edit')).toEqual({
                name: 'edit',
                path: '/admin/users/edit',
            });
        });
        (0, bun_test_1.it)('should handle paths with multiple levels and formatting', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/api/v1/user-settings')).toEqual({
                name: 'user settings',
                path: '/api/v1/user-settings',
            });
        });
    });
    (0, bun_test_1.describe)('URLs with query parameters and fragments', () => {
        (0, bun_test_1.it)('should ignore query parameters', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/search?q=test&page=1')).toEqual({
                name: 'search',
                path: '/search',
            });
        });
        (0, bun_test_1.it)('should ignore URL fragments', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/docs#section-1')).toEqual({
                name: 'docs',
                path: '/docs',
            });
        });
        (0, bun_test_1.it)('should handle both query parameters and fragments', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/products?category=tech#featured')).toEqual({
                name: 'products',
                path: '/products',
            });
        });
        (0, bun_test_1.it)('should handle root path with query parameters', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/?welcome=true')).toEqual({
                name: 'Home',
                path: '/',
            });
        });
    });
    (0, bun_test_1.describe)('Trailing slash handling', () => {
        (0, bun_test_1.it)('should handle paths with trailing slashes', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/about/')).toEqual({
                name: 'about',
                path: '/about/',
            });
        });
        (0, bun_test_1.it)('should handle nested paths with trailing slashes', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/blog/posts/')).toEqual({
                name: 'posts',
                path: '/blog/posts/',
            });
        });
    });
    (0, bun_test_1.describe)('Special cases', () => {
        (0, bun_test_1.it)('should handle numeric page names', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/page/123')).toEqual({
                name: '123',
                path: '/page/123',
            });
        });
        (0, bun_test_1.it)('should handle single character segments', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/a')).toEqual({
                name: 'a',
                path: '/a',
            });
        });
        (0, bun_test_1.it)('should handle empty segments (double slashes)', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/blog//post')).toEqual({
                name: 'post',
                path: '/blog//post',
            });
        });
        (0, bun_test_1.it)('should handle different protocols', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('http://example.com/secure')).toEqual({
                name: 'secure',
                path: '/secure',
            });
        });
        (0, bun_test_1.it)('should handle different ports', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com:8080/api')).toEqual({
                name: 'api',
                path: '/api',
            });
        });
    });
    (0, bun_test_1.describe)('Error handling', () => {
        (0, bun_test_1.beforeEach)(() => {
            // Suppress console.error for error handling tests since they're expected
            console.error = () => { };
        });
        (0, bun_test_1.it)('should handle invalid URLs gracefully', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('not-a-valid-url')).toEqual({
                name: 'Unknown Page',
                path: '/',
            });
        });
        (0, bun_test_1.it)('should handle empty string', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('')).toEqual({
                name: 'Unknown Page',
                path: '/',
            });
        });
        (0, bun_test_1.it)('should handle malformed URLs', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('http://')).toEqual({
                name: 'Unknown Page',
                path: '/',
            });
        });
        (0, bun_test_1.it)('should handle URLs with spaces (auto-encoded)', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('https://example.com/page with spaces')).toEqual({
                name: 'page%20with%20spaces',
                path: '/page%20with%20spaces',
            });
        });
        (0, bun_test_1.it)('should handle truly malformed URLs', () => {
            (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)('://invalid-url')).toEqual({
                name: 'Unknown Page',
                path: '/',
            });
        });
    });
    (0, bun_test_1.describe)('Real-world examples', () => {
        (0, bun_test_1.it)('should handle common website patterns', () => {
            const testCases = [
                {
                    url: 'https://mysite.com/pricing',
                    expected: { name: 'pricing', path: '/pricing' },
                },
                {
                    url: 'https://docs.example.com/getting-started',
                    expected: { name: 'getting started', path: '/getting-started' },
                },
                {
                    url: 'https://blog.example.com/2024/my-first-post',
                    expected: { name: 'my first post', path: '/2024/my-first-post' },
                },
                {
                    url: 'https://shop.example.com/products/t-shirt_blue',
                    expected: { name: 't shirt blue', path: '/products/t-shirt_blue' },
                },
            ];
            testCases.forEach(({ url, expected }) => {
                (0, bun_test_1.expect)((0, urls_1.inferPageFromUrl)(url)).toEqual(expected);
            });
        });
    });
});
//# sourceMappingURL=urls.test.js.map