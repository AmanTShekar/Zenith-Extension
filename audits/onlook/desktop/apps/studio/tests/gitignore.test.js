"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@onlook/models/constants");
const bun_test_1 = require("bun:test");
const fs_1 = require("fs");
const path_1 = require("path");
const helpers_1 = require("../electron/main/hosting/helpers");
(0, bun_test_1.describe)('updateGitignore', () => {
    const testDir = (0, path_1.join)(process.cwd(), 'test-project');
    const gitignorePath = (0, path_1.join)(testDir, '.gitignore');
    (0, bun_test_1.beforeEach)(() => {
        // Create test directory if it doesn't exist
        if (!(0, fs_1.existsSync)(testDir)) {
            (0, fs_1.mkdirSync)(testDir);
        }
    });
    (0, bun_test_1.afterEach)(() => {
        // Clean up test files
        if ((0, fs_1.existsSync)(gitignorePath)) {
            (0, fs_1.unlinkSync)(gitignorePath);
        }
        if ((0, fs_1.existsSync)(testDir)) {
            (0, fs_1.rmdirSync)(testDir);
        }
    });
    (0, bun_test_1.test)('creates .gitignore with custom output dir when file does not exist', () => {
        (0, helpers_1.updateGitignore)(testDir, constants_1.CUSTOM_OUTPUT_DIR);
        (0, bun_test_1.expect)((0, fs_1.existsSync)(gitignorePath)).toBe(true);
        const content = (0, fs_1.readFileSync)(gitignorePath, 'utf-8');
        (0, bun_test_1.expect)(content).toBe(constants_1.CUSTOM_OUTPUT_DIR + '\n');
    });
    (0, bun_test_1.test)('adds custom output dir when .gitignore exists but does not contain it', () => {
        (0, fs_1.writeFileSync)(gitignorePath, 'node_modules\n');
        (0, helpers_1.updateGitignore)(testDir, constants_1.CUSTOM_OUTPUT_DIR);
        const content = (0, fs_1.readFileSync)(gitignorePath, 'utf-8');
        (0, bun_test_1.expect)(content).toBe('node_modules\n' + constants_1.CUSTOM_OUTPUT_DIR + '\n');
    });
    (0, bun_test_1.test)('does not add custom output dir when it already exists in .gitignore', () => {
        (0, fs_1.writeFileSync)(gitignorePath, 'node_modules\n' + constants_1.CUSTOM_OUTPUT_DIR + '\n');
        (0, helpers_1.updateGitignore)(testDir, constants_1.CUSTOM_OUTPUT_DIR);
        const content = (0, fs_1.readFileSync)(gitignorePath, 'utf-8');
        (0, bun_test_1.expect)(content).toBe('node_modules\n' + constants_1.CUSTOM_OUTPUT_DIR + '\n');
    });
    (0, bun_test_1.test)('handles custom output dir with surrounding whitespace', () => {
        (0, fs_1.writeFileSync)(gitignorePath, 'node_modules\n  ' + constants_1.CUSTOM_OUTPUT_DIR + '  \n');
        (0, helpers_1.updateGitignore)(testDir, constants_1.CUSTOM_OUTPUT_DIR);
        const content = (0, fs_1.readFileSync)(gitignorePath, 'utf-8');
        (0, bun_test_1.expect)(content).toBe('node_modules\n  ' + constants_1.CUSTOM_OUTPUT_DIR + '  \n');
    });
    (0, bun_test_1.test)('adds custom output dir with proper newline when file does not end with newline', () => {
        (0, fs_1.writeFileSync)(gitignorePath, 'node_modules');
        (0, helpers_1.updateGitignore)(testDir, constants_1.CUSTOM_OUTPUT_DIR);
        const content = (0, fs_1.readFileSync)(gitignorePath, 'utf-8');
        (0, bun_test_1.expect)(content).toBe('node_modules\n' + constants_1.CUSTOM_OUTPUT_DIR + '\n');
    });
});
//# sourceMappingURL=gitignore.test.js.map