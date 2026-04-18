"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const index_1 = require("../../src/app/projects/import/local/_context/index");
const types_1 = require("../../src/app/projects/types");
(0, bun_test_1.describe)('detectPortFromPackageJson', () => {
    let originalConsoleError;
    (0, bun_test_1.beforeEach)(() => {
        originalConsoleError = console.error;
        // Suppress all console errors for this test suite since they test error conditions
        console.error = () => { };
    });
    (0, bun_test_1.afterEach)(() => {
        console.error = originalConsoleError;
    });
    const createMockFile = (content) => ({
        path: 'package.json',
        content,
        type: types_1.ProcessedFileType.TEXT,
    });
    (0, bun_test_1.it)('returns default port (3000) when packageJsonFile is undefined', () => {
        const result = (0, index_1.detectPortFromPackageJson)(undefined);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
    (0, bun_test_1.it)('returns default port when file content is not a string', () => {
        const mockFile = {
            path: 'package.json',
            content: new ArrayBuffer(8),
            type: types_1.ProcessedFileType.BINARY,
        };
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
    (0, bun_test_1.it)('returns default port when file type is not TEXT', () => {
        const mockFile = {
            path: 'package.json',
            content: new ArrayBuffer(8),
            type: types_1.ProcessedFileType.BINARY,
        };
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
    (0, bun_test_1.it)('returns default port when JSON is invalid', () => {
        const mockFile = createMockFile('invalid json {');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
    (0, bun_test_1.it)('returns default port when scripts section is missing', () => {
        const mockFile = createMockFile('{"name": "test-project"}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
    (0, bun_test_1.it)('returns default port when dev script is missing', () => {
        const mockFile = createMockFile('{"scripts": {"build": "next build"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
    (0, bun_test_1.it)('returns default port when dev script is not a string', () => {
        const mockFile = createMockFile('{"scripts": {"dev": null}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
    (0, bun_test_1.it)('detects port from PORT= environment variable format', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "PORT=4000 next dev"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(4000);
    });
    (0, bun_test_1.it)('detects port from --port= flag format', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "next dev --port=5000"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(5000);
    });
    (0, bun_test_1.it)('detects port from --port flag with space format', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "next dev --port 6000"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(6000);
    });
    (0, bun_test_1.it)('detects port from -p flag format', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "next dev -p 7000"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(7000);
    });
    (0, bun_test_1.it)('detects port from -p flag with multiple spaces', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "next dev -p  8000"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(8000);
    });
    (0, bun_test_1.it)('returns default port for invalid port number (negative)', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "next dev --port -1"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
    (0, bun_test_1.it)('returns default port for invalid port number (too large)', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "next dev --port 99999"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
    (0, bun_test_1.it)('returns default port for invalid port number (zero)', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "next dev --port 0"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
    (0, bun_test_1.it)('returns default port when no port is specified in dev script', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "next dev"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
    (0, bun_test_1.it)('detects valid port at maximum range (65535)', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "next dev --port 65535"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(65535);
    });
    (0, bun_test_1.it)('detects valid port at minimum range (1)', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "next dev --port 1"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(1);
    });
    (0, bun_test_1.it)('handles complex dev script with multiple options', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "cross-env NODE_ENV=development next dev --port 4500 --turbo"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(4500);
    });
    (0, bun_test_1.it)('uses first port match when multiple port specifications exist', () => {
        const mockFile = createMockFile('{"scripts": {"dev": "PORT=3500 next dev --port 4500"}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3500);
    });
    (0, bun_test_1.it)('handles scripts object that is not an object', () => {
        const mockFile = createMockFile('{"scripts": "not an object"}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
    (0, bun_test_1.it)('handles malformed JSON that parses but has unexpected structure', () => {
        const mockFile = createMockFile('{"scripts": {"dev": {"nested": "object"}}}');
        const result = (0, index_1.detectPortFromPackageJson)(mockFile);
        (0, bun_test_1.expect)(result).toBe(3000);
    });
});
//# sourceMappingURL=port.test.js.map