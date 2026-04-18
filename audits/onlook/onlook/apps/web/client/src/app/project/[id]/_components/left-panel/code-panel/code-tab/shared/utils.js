"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDirty = isDirty;
const sync_engine_1 = require("@/services/sync-engine/sync-engine");
// Check if file content differs from original
async function isDirty(file) {
    if (file.type === 'binary') {
        return false; // Binary files are never considered dirty
    }
    if (file.type === 'text') {
        const textFile = file;
        const currentHash = await (0, sync_engine_1.hashContent)(textFile.content);
        return currentHash !== textFile.originalHash;
    }
    return false;
}
//# sourceMappingURL=utils.js.map