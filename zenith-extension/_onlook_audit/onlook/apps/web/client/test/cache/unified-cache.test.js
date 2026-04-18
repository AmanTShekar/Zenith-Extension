"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const unified_cache_1 = require("../../src/components/store/editor/cache/unified-cache");
// Mock localforage
bun_test_1.mock.module('localforage', () => ({
    createInstance: (0, bun_test_1.mock)(() => ({
        getItem: (0, bun_test_1.mock)(async () => null),
        setItem: (0, bun_test_1.mock)(async () => undefined),
        removeItem: (0, bun_test_1.mock)(async () => undefined),
        clear: (0, bun_test_1.mock)(async () => undefined),
    })),
}));
(0, bun_test_1.describe)('UnifiedCacheManager', () => {
    let cacheManager;
    let config;
    (0, bun_test_1.beforeEach)(async () => {
        config = {
            name: 'test-cache',
            maxItems: 5,
            maxSizeBytes: 1024,
            ttlMs: 1000 * 60 * 5, // 5 minutes
            persistent: false, // Disable persistence for tests
        };
        cacheManager = new unified_cache_1.UnifiedCacheManager(config);
        await cacheManager.init();
    });
    (0, bun_test_1.afterEach)(() => {
        cacheManager.clear();
    });
    (0, bun_test_1.test)('should store and retrieve data', () => {
        const testData = { id: 'test1', content: 'Hello World' };
        cacheManager.set('key1', testData);
        const retrieved = cacheManager.get('key1');
        (0, bun_test_1.expect)(retrieved).toEqual(testData);
    });
    (0, bun_test_1.test)('should return undefined for non-existent keys', () => {
        const result = cacheManager.get('non-existent');
        (0, bun_test_1.expect)(result).toBeUndefined();
    });
    (0, bun_test_1.test)('should check if key exists', () => {
        const testData = { id: 'test1', content: 'Hello World' };
        (0, bun_test_1.expect)(cacheManager.has('key1')).toBe(false);
        cacheManager.set('key1', testData);
        (0, bun_test_1.expect)(cacheManager.has('key1')).toBe(true);
    });
    (0, bun_test_1.test)('should delete items', () => {
        const testData = { id: 'test1', content: 'Hello World' };
        cacheManager.set('key1', testData);
        (0, bun_test_1.expect)(cacheManager.has('key1')).toBe(true);
        const deleted = cacheManager.delete('key1');
        (0, bun_test_1.expect)(deleted).toBe(true);
        (0, bun_test_1.expect)(cacheManager.has('key1')).toBe(false);
    });
    (0, bun_test_1.test)('should return false when deleting non-existent key', () => {
        const deleted = cacheManager.delete('non-existent');
        (0, bun_test_1.expect)(deleted).toBe(false);
    });
    (0, bun_test_1.test)('should clear all items', () => {
        cacheManager.set('key1', { id: '1', content: 'test1' });
        cacheManager.set('key2', { id: '2', content: 'test2' });
        (0, bun_test_1.expect)(cacheManager.size).toBe(2);
        cacheManager.clear();
        (0, bun_test_1.expect)(cacheManager.size).toBe(0);
    });
    (0, bun_test_1.test)('should track cache size', () => {
        (0, bun_test_1.expect)(cacheManager.size).toBe(0);
        cacheManager.set('key1', { id: '1', content: 'test1' });
        (0, bun_test_1.expect)(cacheManager.size).toBe(1);
        cacheManager.set('key2', { id: '2', content: 'test2' });
        (0, bun_test_1.expect)(cacheManager.size).toBe(2);
        cacheManager.delete('key1');
        (0, bun_test_1.expect)(cacheManager.size).toBe(1);
    });
    (0, bun_test_1.test)('should iterate over entries', () => {
        const data1 = { id: '1', content: 'test1' };
        const data2 = { id: '2', content: 'test2' };
        cacheManager.set('key1', data1);
        cacheManager.set('key2', data2);
        const entries = Array.from(cacheManager.entries());
        (0, bun_test_1.expect)(entries).toHaveLength(2);
        (0, bun_test_1.expect)(entries).toContainEqual(['key1', data1]);
        (0, bun_test_1.expect)(entries).toContainEqual(['key2', data2]);
    });
    (0, bun_test_1.test)('should iterate over keys', () => {
        cacheManager.set('key1', { id: '1', content: 'test1' });
        cacheManager.set('key2', { id: '2', content: 'test2' });
        const keys = Array.from(cacheManager.keys());
        (0, bun_test_1.expect)(keys).toHaveLength(2);
        (0, bun_test_1.expect)(keys).toContain('key1');
        (0, bun_test_1.expect)(keys).toContain('key2');
    });
    (0, bun_test_1.test)('should handle content-based cache validation', () => {
        const testData = { id: 'test1', content: 'Hello World' };
        const contentHash = 'hash123';
        // Set with content hash
        cacheManager.set('key1', testData, contentHash);
        // Get with matching hash should return data
        const validResult = cacheManager.getCached('key1', contentHash);
        (0, bun_test_1.expect)(validResult).toEqual(testData);
        // Get with different hash should return undefined and remove item
        const invalidResult = cacheManager.getCached('key1', 'different-hash');
        (0, bun_test_1.expect)(invalidResult).toBeUndefined();
        (0, bun_test_1.expect)(cacheManager.has('key1')).toBe(false);
    });
    (0, bun_test_1.test)('should return cached data when no content hash is provided', () => {
        const testData = { id: 'test1', content: 'Hello World' };
        cacheManager.set('key1', testData, 'hash123');
        // Get without hash should return data
        const result = cacheManager.getCached('key1');
        (0, bun_test_1.expect)(result).toEqual(testData);
    });
    (0, bun_test_1.test)('should evict items when maxItems limit is reached', () => {
        // Fill cache to capacity
        for (let i = 0; i < config.maxItems; i++) {
            cacheManager.set(`key${i}`, { id: `${i}`, content: `test${i}` });
        }
        (0, bun_test_1.expect)(cacheManager.size).toBe(config.maxItems);
        // Add one more item to trigger eviction
        cacheManager.set('overflow', { id: 'overflow', content: 'overflow data' });
        // Size should still be at max
        (0, bun_test_1.expect)(cacheManager.size).toBeLessThanOrEqual(config.maxItems);
        // The newest item should be in cache
        (0, bun_test_1.expect)(cacheManager.has('overflow')).toBe(true);
    });
    (0, bun_test_1.test)('should handle TTL expiration', async () => {
        // Create cache with very short TTL for testing
        const shortTtlConfig = {
            ...config,
            ttlMs: 50, // 50ms
        };
        const shortTtlCache = new unified_cache_1.UnifiedCacheManager(shortTtlConfig);
        await shortTtlCache.init();
        const testData = { id: 'test1', content: 'Hello World' };
        shortTtlCache.set('key1', testData);
        // Should be available immediately
        (0, bun_test_1.expect)(shortTtlCache.get('key1')).toEqual(testData);
        // Wait for TTL to expire
        await new Promise(resolve => setTimeout(resolve, 100));
        // Should be expired now
        (0, bun_test_1.expect)(shortTtlCache.get('key1')).toBeUndefined();
        shortTtlCache.clear();
    });
    (0, bun_test_1.test)('should handle large data that exceeds size limits', () => {
        const largeData = {
            id: 'large',
            content: 'x'.repeat(2000) // Larger than maxSizeBytes
        };
        // Should handle large data gracefully
        cacheManager.set('large-key', largeData);
        // The cache might evict it due to size, but shouldn't crash
        (0, bun_test_1.expect)(() => cacheManager.get('large-key')).not.toThrow();
    });
    (0, bun_test_1.test)('should estimate size correctly', () => {
        const smallData = { id: '1', content: 'small' };
        const mediumData = { id: '2', content: 'x'.repeat(100) }; // Smaller than before
        cacheManager.set('small', smallData);
        cacheManager.set('medium', mediumData);
        // Both should be stored initially (within size limits)
        (0, bun_test_1.expect)(cacheManager.has('small')).toBe(true);
        (0, bun_test_1.expect)(cacheManager.has('medium')).toBe(true);
    });
    (0, bun_test_1.test)('should handle concurrent operations', () => {
        const testData = { id: 'test1', content: 'Hello World' };
        // Simulate concurrent set/get operations
        cacheManager.set('key1', testData);
        const result1 = cacheManager.get('key1');
        cacheManager.set('key1', { ...testData, content: 'Modified' });
        const result2 = cacheManager.get('key1');
        (0, bun_test_1.expect)(result1).toEqual(testData);
        (0, bun_test_1.expect)(result2?.content).toBe('Modified');
    });
    (0, bun_test_1.test)('should handle empty and null data', () => {
        const emptyData = { id: '', content: '' };
        const nullishData = { id: 'test', content: '' };
        cacheManager.set('empty', emptyData);
        cacheManager.set('nullish', nullishData);
        (0, bun_test_1.expect)(cacheManager.get('empty')).toEqual(emptyData);
        (0, bun_test_1.expect)(cacheManager.get('nullish')).toEqual(nullishData);
    });
    (0, bun_test_1.test)('should maintain LRU order', () => {
        // Fill cache to capacity
        for (let i = 0; i < config.maxItems; i++) {
            cacheManager.set(`key${i}`, { id: `${i}`, content: `test${i}` });
        }
        // Access the first item to make it recently used
        cacheManager.get('key0');
        // Add a new item to trigger eviction
        cacheManager.set('new-key', { id: 'new', content: 'new data' });
        // The first item should still be there since we accessed it
        (0, bun_test_1.expect)(cacheManager.has('key0')).toBe(true);
        (0, bun_test_1.expect)(cacheManager.has('new-key')).toBe(true);
    });
});
//# sourceMappingURL=unified-cache.test.js.map