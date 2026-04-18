"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const id_1 = require("../src/id");
(0, bun_test_1.describe)('shortenUuid', () => {
    (0, bun_test_1.it)('should produce consistent output for same input', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const first = (0, id_1.shortenUuid)(uuid, 32);
        const second = (0, id_1.shortenUuid)(uuid, 32);
        (0, bun_test_1.expect)(first).toBe(second);
    });
    (0, bun_test_1.it)('should produce different outputs for different inputs', () => {
        const uuid1 = '123e4567-e89b-12d3-a456-426614174000';
        const uuid2 = '123e4567-e89b-12d3-a456-426614174001';
        const first = (0, id_1.shortenUuid)(uuid1, 32);
        const second = (0, id_1.shortenUuid)(uuid2, 32);
        (0, bun_test_1.expect)(first).not.toBe(second);
    });
    (0, bun_test_1.it)('should respect maxLength parameter', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const shortened = (0, id_1.shortenUuid)(uuid, 10);
        (0, bun_test_1.expect)(shortened.length).toBe(10);
        // Should be padded with zeros if needed
        (0, bun_test_1.expect)(shortened).toMatch(/^[0-9a-z]+$/);
    });
    (0, bun_test_1.it)('should handle empty string', () => {
        const uuid = '';
        const shortened = (0, id_1.shortenUuid)(uuid, 32);
        // Empty string should hash to all zeros
        (0, bun_test_1.expect)(shortened).toBe('0'.repeat(32));
    });
    (0, bun_test_1.it)('should produce alphanumeric output', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const shortened = (0, id_1.shortenUuid)(uuid, 32);
        (0, bun_test_1.expect)(shortened).toMatch(/^[0-9a-z]+$/);
        (0, bun_test_1.expect)(shortened.length).toBe(32);
    });
    (0, bun_test_1.it)('should handle very long input strings', () => {
        const longUuid = '123e4567-e89b-12d3-a456-426614174000'.repeat(10);
        const shortened = (0, id_1.shortenUuid)(longUuid, 32);
        (0, bun_test_1.expect)(shortened.length).toBe(32);
        (0, bun_test_1.expect)(shortened).toMatch(/^[0-9a-z]+$/);
    });
    (0, bun_test_1.it)('should handle special characters in input', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000!@#$%^&*()';
        const shortened = (0, id_1.shortenUuid)(uuid, 32);
        (0, bun_test_1.expect)(shortened.length).toBe(32);
        (0, bun_test_1.expect)(shortened).toMatch(/^[0-9a-z]+$/);
    });
});
//# sourceMappingURL=id.test.js.map