"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_DATA_ATTR_CHARS = void 0;
exports.createDomId = createDomId;
exports.createOid = createOid;
exports.shortenUuid = shortenUuid;
const nanoid_1 = require("nanoid");
exports.VALID_DATA_ATTR_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-._:';
const generateCustomId = (0, nanoid_1.customAlphabet)(exports.VALID_DATA_ATTR_CHARS, 7);
function createDomId() {
    return `odid-${generateCustomId()}`;
}
function createOid() {
    return `${generateCustomId()}`;
}
/**
 * Shortens a UUID; maintains uniqueness probabilistically (collisions are possible).
 */
function shortenUuid(uuid, maxLength) {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        const char = uuid.charCodeAt(i);
        hash = (hash << 5) - hash + char;
    }
    // Convert to base36 (alphanumeric) for compact representation
    const base36 = Math.abs(hash).toString(36);
    // Pad with leading zeros if needed
    const padded = base36.padStart(maxLength, '0');
    // Truncate if longer than maxLength
    return padded.slice(-maxLength);
}
//# sourceMappingURL=id.js.map