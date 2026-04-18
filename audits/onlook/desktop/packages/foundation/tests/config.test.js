"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@onlook/models/constants");
const bun_test_1 = require("bun:test");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const next_1 = require("../src/frameworks/next");
(0, bun_test_1.describe)('Next.js Config Modifications', () => {
    const configFiles = ['next.config.js', 'next.config.ts', 'next.config.mjs', 'next.config.cjs'];
    // Clean up all possible config files after each test
    (0, bun_test_1.afterEach)(() => {
        configFiles.forEach((file) => {
            const filePath = path_1.default.resolve(process.cwd(), file);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        });
    });
    (0, bun_test_1.test)('addStandaloneConfig works with different config file types', async () => {
        // Test each config file type
        for (const configFile of configFiles) {
            const configPath = path_1.default.resolve(process.cwd(), configFile);
            // Create a basic config file using CommonJS syntax
            const initialConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true
};

module.exports = nextConfig;
            `.trim();
            fs_1.default.writeFileSync(configPath, initialConfig, 'utf8');
            // Apply the config modifications
            (0, next_1.addNextBuildConfig)(process.cwd());
            // Wait a bit for the file operation to complete
            await new Promise((resolve) => setTimeout(resolve, 100));
            // Read the modified config
            const modifiedConfig = fs_1.default.readFileSync(configPath, 'utf8');
            // Verify both configurations were added
            (0, bun_test_1.expect)(modifiedConfig).toContain('output: "standalone"');
            (0, bun_test_1.expect)(modifiedConfig).toContain('typescript: {');
            (0, bun_test_1.expect)(modifiedConfig).toContain('ignoreBuildErrors: true');
            (0, bun_test_1.expect)(modifiedConfig).toContain('reactStrictMode: true');
            (0, bun_test_1.expect)(modifiedConfig).toContain(`distDir: process.env.NODE_ENV === "production" ? "${constants_1.CUSTOM_OUTPUT_DIR}" : ".next"`);
            // Clean up this config file
            fs_1.default.unlinkSync(configPath);
        }
    });
    (0, bun_test_1.test)('addStandaloneConfig does not duplicate properties', async () => {
        const configPath = path_1.default.resolve(process.cwd(), 'next.config.js');
        // Create config with existing properties using CommonJS syntax
        const configWithExisting = `
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: "standalone",
    distDir: process.env.NODE_ENV === "production" ? ".next-custom" : ".next",
    typescript: {
        ignoreBuildErrors: true
    }
};

module.exports = nextConfig;
        `.trim();
        fs_1.default.writeFileSync(configPath, configWithExisting, 'utf8');
        // Apply the config modifications
        (0, next_1.addNextBuildConfig)(process.cwd());
        // Wait a bit for the file operation to complete
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Read the modified config
        const modifiedConfig = fs_1.default.readFileSync(configPath, 'utf8');
        // Count occurrences of properties
        const outputCount = (modifiedConfig.match(/output:/g) || []).length;
        const typescriptCount = (modifiedConfig.match(/typescript:/g) || []).length;
        const distDirCount = (modifiedConfig.match(/distDir:/g) || []).length;
        // Verify there's only one instance of each property
        (0, bun_test_1.expect)(outputCount).toBe(1);
        (0, bun_test_1.expect)(typescriptCount).toBe(1);
        (0, bun_test_1.expect)(distDirCount).toBe(1);
        (0, bun_test_1.expect)(modifiedConfig).toContain('output: "standalone"');
        (0, bun_test_1.expect)(modifiedConfig).toContain('typescript: {');
        (0, bun_test_1.expect)(modifiedConfig).toContain('ignoreBuildErrors: true');
        (0, bun_test_1.expect)(modifiedConfig).toContain(`distDir: process.env.NODE_ENV === "production" ? "${constants_1.CUSTOM_OUTPUT_DIR}" : ".next"`);
    });
    (0, bun_test_1.test)('addStandaloneConfig preserves existing typescript attributes', async () => {
        const configPath = path_1.default.resolve(process.cwd(), 'next.config.js');
        // Create config with existing typescript properties
        const configWithExisting = `
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    typescript: {
        tsconfigPath: "./custom-tsconfig.json",
        ignoreBuildErrors: false
    }
};

module.exports = nextConfig;
        `.trim();
        fs_1.default.writeFileSync(configPath, configWithExisting, 'utf8');
        // Apply the config modifications
        (0, next_1.addNextBuildConfig)(process.cwd());
        // Wait a bit for the file operation to complete
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Read the modified config
        const modifiedConfig = fs_1.default.readFileSync(configPath, 'utf8');
        // Verify typescript configuration
        (0, bun_test_1.expect)(modifiedConfig).toContain('typescript: {');
        (0, bun_test_1.expect)(modifiedConfig).toContain('ignoreBuildErrors: true'); // Should be updated to true
        (0, bun_test_1.expect)(modifiedConfig).toContain('tsconfigPath: "./custom-tsconfig.json"'); // Should be preserved
        (0, bun_test_1.expect)((modifiedConfig.match(/typescript:/g) || []).length).toBe(1); // Should still only have one typescript block
    });
});
//# sourceMappingURL=config.test.js.map