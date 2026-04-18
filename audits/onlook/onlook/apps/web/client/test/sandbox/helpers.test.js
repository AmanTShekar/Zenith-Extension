"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const path_1 = __importDefault(require("path"));
const helpers_1 = require("../../src/components/store/editor/sandbox/helpers");
// Store original path functions
const originalIsAbsolute = path_1.default.isAbsolute;
const originalJoin = path_1.default.join;
const originalRelative = path_1.default.relative;
(0, bun_test_1.describe)('normalizePath', () => {
    (0, bun_test_1.test)('should convert relative path to normalized form', () => {
        (0, bun_test_1.expect)((0, helpers_1.normalizePath)('./file.txt')).toBe('file.txt');
    });
    (0, bun_test_1.test)('should handle subdirectories in relative paths', () => {
        (0, bun_test_1.expect)((0, helpers_1.normalizePath)('./dir/file.txt')).toBe('dir/file.txt');
    });
    (0, bun_test_1.test)('should normalize absolute paths within sandbox', () => {
        (0, bun_test_1.expect)((0, helpers_1.normalizePath)('/project/sandbox/file.txt')).toBe('file.txt');
    });
    (0, bun_test_1.test)('should normalize absolute paths within sandbox subdirectories', () => {
        (0, bun_test_1.expect)((0, helpers_1.normalizePath)('/project/sandbox/dir/file.txt')).toBe('dir/file.txt');
    });
    (0, bun_test_1.test)('should handle absolute paths outside sandbox', () => {
        (0, bun_test_1.expect)((0, helpers_1.normalizePath)('/other/path/file.txt')).toBe('../../other/path/file.txt');
    });
    (0, bun_test_1.test)('should always use forward slashes for paths', () => {
        // Test that Windows-style backslashes are converted to forward slashes
        // Mock path functions
        path_1.default.isAbsolute = (0, bun_test_1.mock)(() => false);
        path_1.default.join = (0, bun_test_1.mock)(() => '/project/sandbox/dir\\file.txt');
        path_1.default.relative = (0, bun_test_1.mock)(() => 'dir\\file.txt');
        (0, bun_test_1.expect)((0, helpers_1.normalizePath)('dir\\file.txt')).toBe('dir/file.txt');
        // Restore original functions
        path_1.default.isAbsolute = originalIsAbsolute;
        path_1.default.join = originalJoin;
        path_1.default.relative = originalRelative;
    });
});
//# sourceMappingURL=helpers.test.js.map