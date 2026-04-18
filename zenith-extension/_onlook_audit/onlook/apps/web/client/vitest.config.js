"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_url_1 = require("node:url");
const config_1 = require("vitest/config");
const vitest_plugin_1 = require("@storybook/addon-vitest/vitest-plugin");
const browser_playwright_1 = require("@vitest/browser-playwright");
const dirname = typeof __dirname !== 'undefined' ? __dirname : node_path_1.default.dirname((0, node_url_1.fileURLToPath)(import.meta.url));
// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
exports.default = (0, config_1.defineConfig)({
    test: {
        projects: [
            {
                extends: true,
                plugins: [
                    // The plugin will run tests for the stories defined in your Storybook config
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    (0, vitest_plugin_1.storybookTest)({ configDir: node_path_1.default.join(dirname, '.storybook') }),
                ],
                test: {
                    name: 'storybook',
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: (0, browser_playwright_1.playwright)({}),
                        instances: [{ browser: 'chromium' }],
                    },
                    setupFiles: ['.storybook/vitest.setup.ts'],
                },
            },
        ],
    },
});
//# sourceMappingURL=vitest.config.js.map