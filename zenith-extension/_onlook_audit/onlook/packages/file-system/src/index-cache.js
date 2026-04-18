"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrLoadIndex = getOrLoadIndex;
exports.saveIndexToCache = saveIndexToCache;
exports.getIndexFromCache = getIndexFromCache;
exports.clearIndexCache = clearIndexCache;
// projectId/branchId -> oid -> metadata
const staticMemoryMap = new Map();
// guard against multiple loads race condition
const loadingPromises = new Map();
async function getOrLoadIndex(cacheKey, indexPath, readFile) {
    const cached = staticMemoryMap.get(cacheKey);
    if (cached !== undefined) {
        return cached;
    }
    const existingLoad = loadingPromises.get(cacheKey);
    if (existingLoad) {
        return existingLoad;
    }
    const loadPromise = (async () => {
        try {
            const content = await readFile(indexPath);
            if (typeof content !== 'string') {
                throw new Error('Invalid index file content');
            }
            const index = JSON.parse(content);
            // Only set if no value was written while we were loading
            const existing = staticMemoryMap.get(cacheKey);
            if (existing !== undefined) {
                return existing;
            }
            staticMemoryMap.set(cacheKey, index);
            return index;
        }
        catch (error) {
            console.warn(`[CodeEditorApi] Failed to load index from ${indexPath}, error: ${error}`);
            // Only set empty if no value was written while we were loading
            const existing = staticMemoryMap.get(cacheKey);
            if (existing !== undefined) {
                return existing;
            }
            const emptyIndex = {};
            staticMemoryMap.set(cacheKey, emptyIndex);
            return emptyIndex;
        }
        finally {
            loadingPromises.delete(cacheKey);
        }
    })();
    loadingPromises.set(cacheKey, loadPromise);
    return loadPromise;
}
function saveIndexToCache(cacheKey, index) {
    staticMemoryMap.set(cacheKey, { ...index });
}
function getIndexFromCache(cacheKey) {
    return staticMemoryMap.get(cacheKey);
}
function clearIndexCache(cacheKey) {
    staticMemoryMap.delete(cacheKey);
    loadingPromises.delete(cacheKey);
}
//# sourceMappingURL=index-cache.js.map