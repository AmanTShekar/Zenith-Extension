"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@onlook/constants");
const bun_test_1 = require("bun:test");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const src_1 = require("../src");
const next_config_1 = require("../src/code-edit/next-config");
const __dirname = import.meta.dir;
(0, bun_test_1.describe)('Build Config Tests', () => {
    // Mock FileOperations for testing
    const createMockFileOps = (configFiles) => {
        let files = { ...configFiles };
        return {
            readFile: async (filePath) => {
                return files[filePath] || null;
            },
            writeFile: async (filePath, content) => {
                files[filePath] = content;
                return true;
            },
            fileExists: async (filePath) => {
                return filePath in files;
            },
            delete: async (filePath) => {
                delete files[filePath];
                return true;
            },
            copy: async () => true,
        };
    };
    (0, bun_test_1.describe)('addNextBuildConfig', () => {
        const SHOULD_UPDATE_EXPECTED = false;
        const casesDir = path_1.default.resolve(__dirname, 'data/next-config');
        const testCases = fs_1.default.readdirSync(casesDir);
        for (const testCase of testCases) {
            (0, bun_test_1.test)(`should handle case: ${testCase}`, async () => {
                const caseDir = path_1.default.resolve(casesDir, testCase);
                const files = fs_1.default.readdirSync(caseDir);
                const inputFile = files.find((f) => f.startsWith('input.'));
                const expectedFile = files.find((f) => f.startsWith('expected.'));
                if (!inputFile || !expectedFile) {
                    throw new Error(`Test case ${testCase} is missing input or expected file.`);
                }
                const inputPath = path_1.default.resolve(caseDir, inputFile);
                const expectedPath = path_1.default.resolve(caseDir, expectedFile);
                const extension = path_1.default.extname(inputFile);
                const configFilename = `next.config${extension}`;
                const configContent = await Bun.file(inputPath).text();
                const fileOps = createMockFileOps({ [configFilename]: configContent });
                const result = await (0, next_config_1.addNextBuildConfig)(fileOps);
                (0, bun_test_1.expect)(result).toBe(true);
                const modifiedContent = await fileOps.readFile(configFilename);
                if (SHOULD_UPDATE_EXPECTED) {
                    await Bun.write(expectedPath, modifiedContent);
                }
                const expectedContent = await Bun.file(expectedPath).text();
                (0, bun_test_1.expect)(modifiedContent).toBe(expectedContent);
            });
        }
        (0, bun_test_1.test)('should return false when no config file exists', async () => {
            const fileOps = createMockFileOps({});
            const result = await (0, next_config_1.addNextBuildConfig)(fileOps);
            (0, bun_test_1.expect)(result).toBe(false);
        });
        (0, bun_test_1.test)('should return false when config file is empty', async () => {
            const fileOps = createMockFileOps({
                'next.config.js': '',
            });
            const result = await (0, next_config_1.addNextBuildConfig)(fileOps);
            (0, bun_test_1.expect)(result).toBe(false);
        });
        (0, bun_test_1.test)('should return false when readFile returns null', async () => {
            const fileOps = {
                readFile: async () => null,
                writeFile: async () => true,
                fileExists: async () => true,
                delete: async () => true,
                copy: async () => true,
            };
            const result = await (0, next_config_1.addNextBuildConfig)(fileOps);
            (0, bun_test_1.expect)(result).toBe(false);
        });
        (0, bun_test_1.test)('should return false when writeFile fails', async () => {
            const fileOps = {
                readFile: async () => 'const nextConfig = {}; module.exports = nextConfig;',
                writeFile: async () => false,
                fileExists: async () => true,
                delete: async () => true,
                copy: async () => true,
            };
            const result = await (0, next_config_1.addNextBuildConfig)(fileOps);
            (0, bun_test_1.expect)(result).toBe(false);
        });
        (0, bun_test_1.test)('should handle malformed config files gracefully', async () => {
            const fileOps = createMockFileOps({
                'next.config.js': 'this is not valid javascript {',
            });
            const result = await (0, next_config_1.addNextBuildConfig)(fileOps);
            (0, bun_test_1.expect)(result).toBe(false);
        });
        (0, bun_test_1.test)('should prioritize files by extension order', async () => {
            // Create multiple config files
            const fileOps = createMockFileOps({
                'next.config.js': 'const nextConfig = {existing: "js"}; module.exports = nextConfig;',
                'next.config.ts': 'const nextConfig = {existing: "ts"}; export default nextConfig;',
                'next.config.mjs': 'const nextConfig = {existing: "mjs"}; export default nextConfig;',
                'next.config.cjs': 'const nextConfig = {existing: "cjs"}; module.exports = nextConfig;',
            });
            const result = await (0, next_config_1.addNextBuildConfig)(fileOps);
            (0, bun_test_1.expect)(result).toBe(true);
            // Should pick the first one found based on JS_FILE_EXTENSIONS order
            const firstExtension = constants_1.JS_FILE_EXTENSIONS[0];
            const expectedFile = `next.config${firstExtension}`;
            const modifiedContent = await fileOps.readFile(expectedFile);
            (0, bun_test_1.expect)(modifiedContent).toContain('output: "standalone"');
        });
    });
    (0, bun_test_1.describe)('Config Property Addition Logic', () => {
        (0, bun_test_1.test)('should correctly parse and modify config AST', async () => {
            const simpleConfig = `const nextConfig = { reactStrictMode: true }; module.exports = nextConfig;`;
            const ast = (0, src_1.getAstFromContent)(simpleConfig);
            (0, bun_test_1.expect)(ast).toBeDefined();
            if (!ast) {
                throw new Error('Failed to get ast');
            }
            // Test that we can serialize it back
            const serialized = await (0, src_1.getContentFromAst)(ast, simpleConfig);
            (0, bun_test_1.expect)(serialized).toContain('reactStrictMode: true');
        });
    });
});
//# sourceMappingURL=next-config.test.js.map