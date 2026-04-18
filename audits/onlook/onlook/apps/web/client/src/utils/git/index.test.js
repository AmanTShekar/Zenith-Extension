"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const index_1 = require("./index");
(0, bun_test_1.describe)('Git utilities', () => {
    (0, bun_test_1.describe)('sanitizeCommitMessage', () => {
        (0, bun_test_1.it)('should handle empty messages', () => {
            (0, bun_test_1.expect)((0, index_1.sanitizeCommitMessage)('')).toBe('Empty commit message');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (0, bun_test_1.expect)((0, index_1.sanitizeCommitMessage)(null)).toBe('Empty commit message');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (0, bun_test_1.expect)((0, index_1.sanitizeCommitMessage)(undefined)).toBe('Empty commit message');
        });
        (0, bun_test_1.it)('should truncate long messages', () => {
            const longMessage = 'A'.repeat(100);
            const result = (0, index_1.sanitizeCommitMessage)(longMessage);
            (0, bun_test_1.expect)(result.length).toBeLessThanOrEqual(75); // 72 + '...'
            (0, bun_test_1.expect)(result.endsWith('...')).toBe(true);
        });
        (0, bun_test_1.it)('should preserve short messages', () => {
            const shortMessage = 'Fix bug';
            (0, bun_test_1.expect)((0, index_1.sanitizeCommitMessage)(shortMessage)).toBe(shortMessage);
        });
        (0, bun_test_1.it)('should handle multiline messages', () => {
            const multilineMessage = 'Fix critical bug\n\nThis fixes a critical issue with user authentication';
            const result = (0, index_1.sanitizeCommitMessage)(multilineMessage);
            (0, bun_test_1.expect)(result).toContain('Fix critical bug');
            (0, bun_test_1.expect)(result).toContain('This fixes a critical issue');
        });
        (0, bun_test_1.it)('should remove control characters', () => {
            const messageWithControlChars = 'Fix bug\x00\x01\x08';
            const result = (0, index_1.sanitizeCommitMessage)(messageWithControlChars);
            (0, bun_test_1.expect)(result).toBe('Fix bug');
        });
        (0, bun_test_1.it)('should truncate at word boundaries', () => {
            const message = 'This is a very long commit message that should be truncated at word boundaries';
            const result = (0, index_1.sanitizeCommitMessage)(message);
            (0, bun_test_1.expect)(result.endsWith('...')).toBe(true);
            // Should not end with a partial word
            const withoutEllipsis = result.slice(0, -3);
            (0, bun_test_1.expect)(withoutEllipsis.endsWith(' ')).toBe(false);
        });
    });
    (0, bun_test_1.describe)('escapeShellString', () => {
        (0, bun_test_1.it)('should handle empty strings', () => {
            (0, bun_test_1.expect)((0, index_1.escapeShellString)('')).toBe('""');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (0, bun_test_1.expect)((0, index_1.escapeShellString)(null)).toBe('""');
        });
        (0, bun_test_1.it)('should not quote safe strings', () => {
            (0, bun_test_1.expect)((0, index_1.escapeShellString)('simple')).toBe('simple');
            (0, bun_test_1.expect)((0, index_1.escapeShellString)('file.txt')).toBe('file.txt');
            (0, bun_test_1.expect)((0, index_1.escapeShellString)('path/to/file')).toBe('path/to/file');
        });
        (0, bun_test_1.it)('should quote unsafe strings', () => {
            (0, bun_test_1.expect)((0, index_1.escapeShellString)('hello world')).toBe("'hello world'");
            (0, bun_test_1.expect)((0, index_1.escapeShellString)('hello "world"')).toBe("'hello \"world\"'");
        });
        (0, bun_test_1.it)('should handle single quotes correctly', () => {
            (0, bun_test_1.expect)((0, index_1.escapeShellString)("don't")).toBe("'don'\\''t'");
        });
    });
    (0, bun_test_1.describe)('prepareCommitMessage', () => {
        (0, bun_test_1.it)('should sanitize and escape messages', () => {
            const dangerousMessage = 'Fix bug; rm -rf /';
            const result = (0, index_1.prepareCommitMessage)(dangerousMessage);
            (0, bun_test_1.expect)(result).toContain("'Fix bug; rm -rf /'");
        });
        (0, bun_test_1.it)('should handle long messages with special characters', () => {
            const longMessage = 'Fix critical bug with "quotes" and special chars'.repeat(3);
            const result = (0, index_1.prepareCommitMessage)(longMessage);
            (0, bun_test_1.expect)(result.startsWith("'")).toBe(true);
            (0, bun_test_1.expect)(result.endsWith("'")).toBe(true);
        });
    });
});
//# sourceMappingURL=index.test.js.map