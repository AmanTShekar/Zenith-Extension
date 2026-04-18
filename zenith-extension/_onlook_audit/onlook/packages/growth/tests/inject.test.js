"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const src_1 = require("../src");
const fileOps = {
    readFile: async (filePath) => {
        return fs_1.default.readFileSync(filePath, 'utf8');
    },
    writeFile: async (filePath, content) => {
        fs_1.default.writeFileSync(filePath, content, 'utf8');
        return true;
    },
    fileExists: async (filePath) => {
        return fs_1.default.existsSync(filePath);
    },
    delete: async (filePath) => {
        fs_1.default.unlinkSync(filePath);
        return true;
    },
    copy: async (source, destination) => {
        fs_1.default.copyFileSync(source, destination);
        return true;
    },
};
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
        const result = await (0, src_1.injectBuiltWithScript)(tempDir, fileOps);
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
        const result = await (0, src_1.addBuiltWithScript)(tempDir, fileOps);
        (0, bun_test_1.expect)(result).toBe(true);
        // Verify the script file exists
        (0, bun_test_1.expect)(fs_1.default.existsSync(scriptPath)).toBe(true);
        // Verify the content of the script
        const scriptContent = fs_1.default.readFileSync(scriptPath, 'utf8');
        (0, bun_test_1.expect)(scriptContent).toContain('class BuiltWithOnlook extends HTMLElement');
    });
    (0, bun_test_1.test)('removeBuiltWithScriptFromLayout removes Script component from layout.tsx', async () => {
        // First inject the script
        await (0, src_1.injectBuiltWithScript)(tempDir, fileOps);
        // Then remove it
        const result = await (0, src_1.removeBuiltWithScriptFromLayout)(tempDir, fileOps);
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
        await (0, src_1.addBuiltWithScript)(tempDir, fileOps);
        // Then remove it
        const result = await (0, src_1.removeBuiltWithScript)(tempDir, fileOps);
        (0, bun_test_1.expect)(result).toBe(true);
        // Verify the script file no longer exists
        (0, bun_test_1.expect)(fs_1.default.existsSync(scriptPath)).toBe(false);
    });
    (0, bun_test_1.test)('removeBuiltWithScriptFromLayout works with src/app directory structure', async () => {
        // Remove the original app/layout.tsx
        fs_1.default.unlinkSync(layoutPath);
        // Create src/app directory structure
        const srcAppDir = path_1.default.join(tempDir, 'src', 'app');
        const srcLayoutPath = path_1.default.join(srcAppDir, 'layout.tsx');
        fs_1.default.mkdirSync(srcAppDir, { recursive: true });
        // Create a layout.tsx file with Script already injected
        const layoutWithScript = `import Script from "next/script";

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (<html lang="en">
        <body className={inter.className}>
            {children}
            <Script src="/builtwith.js" strategy="afterInteractive" />
        </body>
    </html>
    );
}`;
        fs_1.default.writeFileSync(srcLayoutPath, layoutWithScript, 'utf8');
        // Remove the script from layout
        const result = await (0, src_1.removeBuiltWithScriptFromLayout)(tempDir, fileOps);
        (0, bun_test_1.expect)(result).toBe(true);
        // Read the modified layout file
        const modifiedLayoutContent = fs_1.default.readFileSync(srcLayoutPath, 'utf8');
        // Verify Script component was removed
        (0, bun_test_1.expect)(modifiedLayoutContent).not.toContain('<Script src="/builtwith.js" strategy="afterInteractive" />');
        // Verify Script import was removed
        (0, bun_test_1.expect)(modifiedLayoutContent).not.toContain('import Script from "next/script";');
    });
    (0, bun_test_1.test)('injectBuiltWithScript handles missing layout file', async () => {
        // Remove the layout file
        fs_1.default.unlinkSync(layoutPath);
        // Try to inject the script
        const result = await (0, src_1.injectBuiltWithScript)(tempDir, fileOps);
        (0, bun_test_1.expect)(result).toBe(false);
    });
    (0, bun_test_1.test)('injectBuiltWithScript works with src/app directory structure', async () => {
        // Remove the original app/layout.tsx
        fs_1.default.unlinkSync(layoutPath);
        // Create src/app directory structure
        const srcAppDir = path_1.default.join(tempDir, 'src', 'app');
        const srcLayoutPath = path_1.default.join(srcAppDir, 'layout.tsx');
        fs_1.default.mkdirSync(srcAppDir, { recursive: true });
        // Create a basic layout.tsx file in src/app
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
        fs_1.default.writeFileSync(srcLayoutPath, layoutContent, 'utf8');
        // Inject the script
        const result = await (0, src_1.injectBuiltWithScript)(tempDir, fileOps);
        (0, bun_test_1.expect)(result).toBe(true);
        // Read the modified layout file
        const modifiedLayoutContent = fs_1.default.readFileSync(srcLayoutPath, 'utf8');
        // Verify Script import was added
        (0, bun_test_1.expect)(modifiedLayoutContent).toContain('import Script from "next/script";');
        // Verify Script component was added
        (0, bun_test_1.expect)(modifiedLayoutContent).toContain('<Script src="/builtwith.js" strategy="afterInteractive" />');
    });
    (0, bun_test_1.test)('removeBuiltWithScript handles missing script file', async () => {
        // Try to remove a non-existent script
        const result = await (0, src_1.removeBuiltWithScript)(tempDir, fileOps);
        (0, bun_test_1.expect)(result).toBe(false);
    });
    (0, bun_test_1.test)('removeBuiltWithScriptFromLayout handles missing layout file', async () => {
        // Remove the layout file
        fs_1.default.unlinkSync(layoutPath);
        // Try to remove the script from layout
        const result = await (0, src_1.removeBuiltWithScriptFromLayout)(tempDir, fileOps);
        (0, bun_test_1.expect)(result).toBe(false);
    });
    (0, bun_test_1.test)('full workflow: inject, add, remove from layout, remove script', async () => {
        // Inject the script into layout
        const injectResult = await (0, src_1.injectBuiltWithScript)(tempDir, fileOps);
        (0, bun_test_1.expect)(injectResult).toBe(true);
        // Add the script to public folder
        const addResult = await (0, src_1.addBuiltWithScript)(tempDir, fileOps);
        (0, bun_test_1.expect)(addResult).toBe(true);
        // Verify both operations were successful
        (0, bun_test_1.expect)(fs_1.default.existsSync(scriptPath)).toBe(true);
        let layoutContent = fs_1.default.readFileSync(layoutPath, 'utf8');
        (0, bun_test_1.expect)(layoutContent).toContain('<Script src=\"/builtwith.js\" strategy=\"afterInteractive\" />');
        // Remove the script from layout
        const removeLayoutResult = await (0, src_1.removeBuiltWithScriptFromLayout)(tempDir, fileOps);
        (0, bun_test_1.expect)(removeLayoutResult).toBe(true);
        // Remove the script from public folder
        const removeScriptResult = await (0, src_1.removeBuiltWithScript)(tempDir, fileOps);
        (0, bun_test_1.expect)(removeScriptResult).toBe(true);
        // Verify both removal operations were successful
        (0, bun_test_1.expect)(fs_1.default.existsSync(scriptPath)).toBe(false);
        layoutContent = fs_1.default.readFileSync(layoutPath, 'utf8');
        (0, bun_test_1.expect)(layoutContent).not.toContain('<Script src=\"/builtwith.js\" strategy=\"afterInteractive\" />');
    });
    (0, bun_test_1.test)('removeBuiltWithScriptFromLayout does not remove Script import if other Script elements exist', async () => {
        // Write a layout file with two Script elements: one for builtwith.js and one for something else
        const layoutContent = `import Script from "next/script";
export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (<html lang="en">
        <body className={inter.className}>
            <Script src="/builtwith.js" strategy="afterInteractive" />
            <Script src="/analytics.js" strategy="afterInteractive" />
            {children}
        </body>
    </html>
    );
}`;
        fs_1.default.writeFileSync(layoutPath, layoutContent, 'utf8');
        // Remove the builtwith.js script
        const result = await (0, src_1.removeBuiltWithScriptFromLayout)(tempDir, fileOps);
        (0, bun_test_1.expect)(result).toBe(true);
        // Read the modified layout file
        const modifiedContent = fs_1.default.readFileSync(layoutPath, 'utf8');
        // The builtwith.js Script should be removed
        (0, bun_test_1.expect)(modifiedContent).not.toContain('<Script src="/builtwith.js" strategy="afterInteractive" />');
        // The analytics.js Script should remain
        (0, bun_test_1.expect)(modifiedContent).toContain('<Script src="/analytics.js" strategy="afterInteractive" />');
        // The Script import should still be present
        (0, bun_test_1.expect)(modifiedContent).toContain('import Script from "next/script";');
    });
    (0, bun_test_1.test)('removeBuiltWithScriptFromLayout does not remove Script import if Script is in head', async () => {
        const layoutContent = `import Script from "next/script";
export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (<html lang="en">
        <head>
            <Script src=\"/analytics.js\" strategy=\"afterInteractive\" />
        </head>
        <body className={inter.className}>
            <Script src=\"/builtwith.js\" strategy=\"afterInteractive\" />
            {children}
        </body>
    </html>
    );
}`;
        fs_1.default.writeFileSync(layoutPath, layoutContent, 'utf8');
        const result = await (0, src_1.removeBuiltWithScriptFromLayout)(tempDir, fileOps);
        (0, bun_test_1.expect)(result).toBe(true);
        const modifiedContent = fs_1.default.readFileSync(layoutPath, 'utf8');
        (0, bun_test_1.expect)(modifiedContent).not.toContain('<Script src="/builtwith.js" strategy="afterInteractive" />');
        (0, bun_test_1.expect)(modifiedContent).toContain('<Script src="/analytics.js" strategy="afterInteractive" />');
        (0, bun_test_1.expect)(modifiedContent).toContain('import Script from "next/script";');
    });
    (0, bun_test_1.test)('removeBuiltWithScriptFromLayout does not remove Script import if Script is a sibling to html', async () => {
        const layoutContent = `import Script from \"next/script\";
export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Script src=\"/analytics.js\" strategy=\"afterInteractive\" />
            <html lang=\"en\">
                <body className={inter.className}>
                    <Script src=\"/builtwith.js\" strategy=\"afterInteractive\" />
                    {children}
                </body>
            </html>
        </>
    );
}`;
        fs_1.default.writeFileSync(layoutPath, layoutContent, 'utf8');
        const result = await (0, src_1.removeBuiltWithScriptFromLayout)(tempDir, fileOps);
        (0, bun_test_1.expect)(result).toBe(true);
        const modifiedContent = fs_1.default.readFileSync(layoutPath, 'utf8');
        (0, bun_test_1.expect)(modifiedContent).not.toContain('<Script src="/builtwith.js" strategy="afterInteractive" />');
        (0, bun_test_1.expect)(modifiedContent).toContain('<Script src="/analytics.js" strategy="afterInteractive" />');
        (0, bun_test_1.expect)(modifiedContent).toContain('import Script from "next/script";');
    });
    (0, bun_test_1.test)('removeBuiltWithScriptFromLayout does not remove Script import if Script is in a fragment', async () => {
        const layoutContent = `import Script from \"next/script\";
export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <html lang=\"en\">
                <body className={inter.className}>
                    <Script src=\"/builtwith.js\" strategy=\"afterInteractive\" />
                    {children}
                </body>
            </html>
            <Script src=\"/analytics.js\" strategy=\"afterInteractive\" />
        </>
    );
}`;
        fs_1.default.writeFileSync(layoutPath, layoutContent, 'utf8');
        const result = await (0, src_1.removeBuiltWithScriptFromLayout)(tempDir, fileOps);
        (0, bun_test_1.expect)(result).toBe(true);
        const modifiedContent = fs_1.default.readFileSync(layoutPath, 'utf8');
        (0, bun_test_1.expect)(modifiedContent).not.toContain('<Script src="/builtwith.js" strategy="afterInteractive" />');
        (0, bun_test_1.expect)(modifiedContent).toContain('<Script src="/analytics.js" strategy="afterInteractive" />');
        (0, bun_test_1.expect)(modifiedContent).toContain('import Script from "next/script";');
    });
});
//# sourceMappingURL=inject.test.js.map