"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("@onlook/models");
const bun_test_1 = require("bun:test");
const helper_1 = require("../../src/components/store/editor/pages/helper");
(0, bun_test_1.describe)('scanAppDirectory', () => {
    (0, bun_test_1.test)('should scan simple page structure', async () => {
        const mockSandboxManager = {
            readDir: (0, bun_test_1.mock)((dir) => {
                if (dir === 'app') {
                    return Promise.resolve([
                        { name: 'page.tsx', type: 'file', isSymlink: false }
                    ]);
                }
                return Promise.resolve([]);
            }),
            readFile: (0, bun_test_1.mock)((path) => {
                console.log('readFile called with:', path);
                return Promise.resolve('export default function Page() { return <div>Test</div>; }');
            }),
            routerConfig: { type: models_1.RouterType.APP, basePath: 'app' }
        };
        const result = await (0, helper_1.scanAppDirectory)(mockSandboxManager, 'app');
        (0, bun_test_1.expect)(result).toHaveLength(1);
        (0, bun_test_1.expect)(result[0].name).toBe('Home'); // Root page is named "Home"
        (0, bun_test_1.expect)(result[0].path).toBe('/'); // Root page has path "/"
    });
    (0, bun_test_1.test)('should handle directory with only page file', async () => {
        const mockSandboxManager = {
            readDir: (0, bun_test_1.mock)(() => Promise.resolve([
                { name: 'page.tsx', type: 'file', isSymlink: false }
            ])),
            readFile: (0, bun_test_1.mock)((path) => {
                return Promise.resolve('export default function Page() { return <div>Test</div>; }');
            }),
            routerConfig: { type: models_1.RouterType.APP, basePath: 'app' }
        };
        const result = await (0, helper_1.scanAppDirectory)(mockSandboxManager, 'app');
        (0, bun_test_1.expect)(result).toHaveLength(1);
        (0, bun_test_1.expect)(result[0].name).toBe('Home');
        (0, bun_test_1.expect)(result[0].path).toBe('/');
    });
    (0, bun_test_1.test)('should handle directories without page files', async () => {
        const mockSandboxManager = {
            readDir: (0, bun_test_1.mock)(() => Promise.resolve([
                { name: 'components', type: 'directory', isSymlink: false },
                { name: 'utils', type: 'directory', isSymlink: false }
            ])),
            readFile: (0, bun_test_1.mock)((path) => {
                return Promise.resolve('export default function Page() { return <div>Test</div>; }');
            }),
            routerConfig: { type: models_1.RouterType.APP, basePath: 'app' }
        };
        const result = await (0, helper_1.scanAppDirectory)(mockSandboxManager, 'app');
        // Should return empty array when no page files found
        (0, bun_test_1.expect)(result).toEqual([]);
    });
    (0, bun_test_1.test)('should handle empty directories', async () => {
        const mockSandboxManager = {
            readDir: (0, bun_test_1.mock)(() => Promise.resolve([])),
            readFile: (0, bun_test_1.mock)((path) => {
                console.log('readFile called with:', path);
                return Promise.resolve('export default function Page() { return <div>Test</div>; }');
            }),
            routerConfig: { type: models_1.RouterType.APP, basePath: 'app' }
        };
        const result = await (0, helper_1.scanAppDirectory)(mockSandboxManager, 'app');
        (0, bun_test_1.expect)(result).toEqual([]);
    });
    (0, bun_test_1.test)('should handle file read errors gracefully', async () => {
        const mockSandboxManager = {
            readDir: (0, bun_test_1.mock)(() => Promise.resolve([
                { name: 'page.tsx', type: 'file', isSymlink: false }
            ])),
            readFile: (0, bun_test_1.mock)(() => {
                throw new Error('File read error');
            }),
            routerConfig: { type: models_1.RouterType.APP, basePath: 'app' }
        };
        const result = await (0, helper_1.scanAppDirectory)(mockSandboxManager, 'app');
        // Should still return page structure even if file reading fails
        (0, bun_test_1.expect)(result).toHaveLength(1);
        (0, bun_test_1.expect)(result[0].name).toBe('Home'); // Root page is named "Home"
        (0, bun_test_1.expect)(result[0].path).toBe('/'); // Root page path
    });
    (0, bun_test_1.test)('should handle directory read errors', async () => {
        const mockSandboxManager = {
            readDir: (0, bun_test_1.mock)(() => {
                throw new Error('Directory not found');
            }),
            readFile: (0, bun_test_1.mock)((path) => {
                console.log('readFile called with:', path);
                return Promise.resolve('export default function Page() { return <div>Test</div>; }');
            }),
            routerConfig: { type: models_1.RouterType.APP, basePath: 'app' }
        };
        const result = await (0, helper_1.scanAppDirectory)(mockSandboxManager, 'nonexistent');
        (0, bun_test_1.expect)(result).toEqual([]);
    });
});
//# sourceMappingURL=helper.test.js.map