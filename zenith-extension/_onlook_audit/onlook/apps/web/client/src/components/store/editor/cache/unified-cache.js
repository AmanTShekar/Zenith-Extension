"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedCacheManager = void 0;
const utility_1 = require("@onlook/utility");
const localforage_1 = __importDefault(require("localforage"));
const lru_cache_1 = require("lru-cache");
class UnifiedCacheManager {
    memoryCache;
    persistentStore;
    config;
    initialized = false;
    constructor(config) {
        this.config = config;
        this.memoryCache = new lru_cache_1.LRUCache({
            max: config.maxItems,
            maxSize: config.maxSizeBytes,
            sizeCalculation: (item) => item.size,
            ttl: config.ttlMs,
        });
        if (config.persistent && typeof window !== 'undefined') {
            this.persistentStore = localforage_1.default.createInstance({
                name: `onlook-cache-${config.name}`,
                storeName: 'cache',
                description: `Unified cache for ${config.name}`,
            });
        }
    }
    async init() {
        if (this.initialized)
            return;
        if (this.persistentStore && this.memoryCache.size === 0) {
            await this.loadFromPersistent();
        }
        this.initialized = true;
    }
    get(key) {
        const cached = this.memoryCache.get(key);
        return cached?.data;
    }
    set(key, data, contentHash) {
        const size = this.estimateSize(data);
        const item = {
            data,
            timestamp: Date.now(),
            contentHash,
            size,
        };
        this.memoryCache.set(key, item);
        // Trigger periodic persistence
        if (this.shouldPersist()) {
            this.saveToPersistent().catch(console.warn);
        }
    }
    has(key) {
        return this.memoryCache.has(key);
    }
    delete(key) {
        return this.memoryCache.delete(key);
    }
    clear() {
        this.memoryCache.clear();
    }
    get size() {
        return this.memoryCache.size;
    }
    entries() {
        const entries = [];
        for (const [key, cached] of this.memoryCache.entries()) {
            entries.push([key, cached.data]);
        }
        return entries[Symbol.iterator]();
    }
    keys() {
        return this.memoryCache.keys();
    }
    // Content-based cache checking
    getCached(key, currentContentHash) {
        const cached = this.memoryCache.get(key);
        if (!cached)
            return undefined;
        if (currentContentHash && cached.contentHash !== currentContentHash) {
            this.delete(key);
            return undefined;
        }
        return cached.data;
    }
    async loadFromPersistent() {
        if (!this.persistentStore)
            return;
        try {
            const data = await this.persistentStore.getItem('cache-data');
            if (!data)
                return;
            // Check if cache is too old (24 hours)
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                await this.persistentStore.removeItem('cache-data');
                return;
            }
            // Restore cache entries (jsonClone already handled serialization)
            for (const [key, item] of data.entries) {
                this.memoryCache.set(key, item);
            }
        }
        catch (error) {
            console.warn(`[UnifiedCache:${this.config.name}] Failed to load from persistent storage:`, error);
        }
    }
    async saveToPersistent() {
        if (!this.persistentStore || this.memoryCache.size === 0)
            return;
        try {
            const entries = [];
            for (const [key, item] of this.memoryCache.entries()) {
                try {
                    // Use jsonClone to strip MobX observables and create serializable data
                    const serializedItem = (0, utility_1.jsonClone)(item);
                    entries.push([key, serializedItem]);
                }
                catch (serializationError) {
                    console.warn(`[UnifiedCache:${this.config.name}] Skipping non-serializable item with key: ${key}`, serializationError);
                    continue;
                }
            }
            if (entries.length === 0) {
                return;
            }
            const data = {
                timestamp: Date.now(),
                version: 1,
                entries,
            };
            await this.persistentStore.setItem('cache-data', data);
        }
        catch (error) {
            console.warn(`[UnifiedCache:${this.config.name}] Failed to save to persistent storage:`, error);
        }
    }
    async clearPersistent() {
        if (!this.persistentStore)
            return;
        await this.persistentStore.clear();
    }
    shouldPersist() {
        if (!this.persistentStore)
            return false;
        return this.memoryCache.size % 10 === 0 || this.memoryCache.size <= 3;
    }
    estimateSize(data) {
        try {
            return new TextEncoder().encode(JSON.stringify(data)).length;
        }
        catch (error) {
            // If data is not serializable, estimate based on object properties
            if (typeof data === 'object' && data !== null) {
                let size = 0;
                try {
                    for (const [key, value] of Object.entries(data)) {
                        size += key.length * 2; // UTF-16 encoding
                        if (typeof value === 'string') {
                            size += value.length * 2;
                        }
                        else if (value instanceof Uint8Array) {
                            size += value.length;
                        }
                        else if (typeof value === 'number' || typeof value === 'boolean') {
                            size += 8; // Approximate
                        }
                        else {
                            size += 100; // Fallback for complex objects
                        }
                    }
                    return size;
                }
                catch {
                    return 1000; // Final fallback
                }
            }
            return 1000; // Fallback size
        }
    }
}
exports.UnifiedCacheManager = UnifiedCacheManager;
//# sourceMappingURL=unified-cache.js.map