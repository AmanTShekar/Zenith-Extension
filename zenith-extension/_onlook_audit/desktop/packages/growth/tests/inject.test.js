"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const src_1 = require("../src");
(0, bun_test_1.describe)('Built with Onlook Script', () => {
    const tempDir = path_1.default.join(process.cwd(), 'temp-test-project');
    const appDir = path_1.default.join(tempDir, 'app');
    const publicDir = path_1.default.join(tempDir, 'public');
    const layoutPath = path_1.default.join(appDir, 'layout.tsx');
    const scriptPath = path_1.default.join(publicDir, 'builtwith.js');
    // Set up a temporary Next.js project structure
    (0, bun_test_1.beforeEach)(() => {
        // Create directories
        fs_1.default.mkdirSync(tempDir, { recursive: true });
        fs_1.default.mkdirSync(appDir, { recursive: true });
        fs_1.default.mkdirSync(publicDir, { recursive: true });
        // Create a basic layout.tsx file
        const layoutContent = `export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (<html lang="en">
        <body className={inter.className}>
            {children}
        </body>
    </html>
    );
}`;
        fs_1.default.writeFileSync(layoutPath, layoutContent, 'utf8');
    });
    // Clean up after each test
    (0, bun_test_1.afterEach)(() => {
        fs_1.default.rmSync(tempDir, { recursive: true, force: true });
    });
    (0, bun_test_1.test)('injectBuiltWithScript adds Script component to layout.tsx', async () => {
        // Inject the script
        const result = await (0, src_1.injectBuiltWithScript)(tempDir);
        (0, bun_test_1.expect)(result).toBe(true);
        // Read the modified layout file
        const layoutContent = fs_1.default.readFileSync(layoutPath, 'utf8');
        // Verify Script import was added
        (0, bun_test_1.expect)(layoutContent).toContain('import Script from "next/script";');
        // Verify Script component was added
        (0, bun_test_1.expect)(layoutContent).toContain('<Script src=\"/builtwith.js\" strategy=\"afterInteractive\" />');
    });
    (0, bun_test_1.test)('addBuiltWithScript copies script to public folder', async () => {
        // Add the script
        const result = await (0, src_1.addBuiltWithScript)(tempDir);
        (0, bun_test_1.expect)(result).toBe(true);
        // Verify the script file exists
        (0, bun_test_1.expect)(fs_1.default.existsSync(scriptPath)).toBe(true);
        // Verify the content of the script
        const scriptContent = fs_1.default.readFileSync(scriptPath, 'utf8');
        (0, bun_test_1.expect)(scriptContent).toContain('class BuiltWithOnlook extends HTMLElement');
    });
    (0, bun_test_1.test)('removeBuiltWithScriptFromLayout removes Script component from layout.tsx', async () => {
        // First inject the script
        await (0, src_1.injectBuiltWithScript)(tempDir);
        // Then remove it
        const result = await (0, src_1.removeBuiltWithScriptFromLayout)(tempDir);
        (0, bun_test_1.expect)(result).toBe(true);
        // Read the modified layout file
        const layoutContent = fs_1.default.readFileSync(layoutPath, 'utf8');
        // Verify Script import was removed
        (0, bun_test_1.expect)(layoutContent).not.toContain('import Script from "next/script";');
        // Verify Script component was removed
        (0, bun_test_1.expect)(layoutContent).not.toContain('<Script src=\"/builtwith.js\" strategy=\"afterInteractive\" />');
    });
    (0, bun_test_1.test)('removeBuiltWithScript removes script from public folder', async () => {
        // First add the script
        await (0, src_1.addBuiltWithScript)(tempDir);
        // Then remove it
        const result = await (0, src_1.removeBuiltWithScript)(tempDir);
        (0, bun_test_1.expect)(result).toBe(true);
        // Verify the script file no longer exists
        (0, bun_test_1.expect)(fs_1.default.existsSync(scriptPath)).toBe(false);
    });
    (0, bun_test_1.test)('injectBuiltWithScript handles missing layout file', async () => {
        // Remove the layout file
        fs_1.default.unlinkSync(layoutPath);
        // Try to inject the script
        const result = await (0, src_1.injectBuiltWithScript)(tempDir);
        (0, bun_test_1.expect)(result).toBe(false);
    });
    (0, bun_test_1.test)('removeBuiltWithScript handles missing script file', async () => {
        // Try to remove a non-existent script
        const result = await (0, src_1.removeBuiltWithScript)(tempDir);
        (0, bun_test_1.expect)(result).toBe(false);
    });
    (0, bun_test_1.test)('removeBuiltWithScriptFromLayout handles missing layout file', async () => {
        // Remove the layout file
        fs_1.default.unlinkSync(layoutPath);
        // Try to remove the script from layout
        const result = await (0, src_1.removeBuiltWithScriptFromLayout)(tempDir);
        (0, bun_test_1.expect)(result).toBe(false);
    });
    (0, bun_test_1.test)('full workflow: inject, add, remove from layout, remove script', async () => {
        // Inject the script into layout
        const injectResult = await (0, src_1.injectBuiltWithScript)(tempDir);
        (0, bun_test_1.expect)(injectResult).toBe(true);
        // Add the script to public folder
        const addResult = await (0, src_1.addBuiltWithScript)(tempDir);
        (0, bun_test_1.expect)(addResult).toBe(true);
        // Verify both operations were successful
        (0, bun_test_1.expect)(fs_1.default.existsSync(scriptPath)).toBe(true);
        let layoutContent = fs_1.default.readFileSync(layoutPath, 'utf8');
        (0, bun_test_1.expect)(layoutContent).toContain('<Script src=\"/builtwith.js\" strategy=\"afterInteractive\" />');
        // Remove the script from layout
        const removeLayoutResult = await (0, src_1.removeBuiltWithScriptFromLayout)(tempDir);
        (0, bun_test_1.expect)(removeLayoutResult).toBe(true);
        // Remove the script from public folder
        const removeScriptResult = await (0, src_1.removeBuiltWithScript)(tempDir);
        (0, bun_test_1.expect)(removeScriptResult).toBe(true);
        // Verify both removal operations were successful
        (0, bun_test_1.expect)(fs_1.default.existsSync(scriptPath)).toBe(false);
        layoutContent = fs_1.default.readFileSync(layoutPath, 'utf8');
        (0, bun_test_1.expect)(layoutContent).not.toContain('<Script src=\"/builtwith.js\" strategy=\"afterInteractive\" />');
    });
});
//# sourceMappingURL=inject.test.js.map