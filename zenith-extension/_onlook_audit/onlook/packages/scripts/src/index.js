"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootDir = void 0;
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = require("commander");
const node_path_1 = __importDefault(require("node:path"));
const api_keys_1 = require("./api-keys");
const backend_1 = require("./backend");
const program = new commander_1.Command();
// Determine root and .env paths
const cwd = process.cwd();
const isInPackagesScripts = cwd.includes('packages/scripts');
exports.rootDir = node_path_1.default.resolve(cwd, isInPackagesScripts ? '../..' : '.');
const clientEnvPath = node_path_1.default.join(exports.rootDir, 'apps', 'web', 'client', '.env');
const dbEnvPath = node_path_1.default.join(exports.rootDir, 'packages', 'db', '.env');
program
    .name('setup:env')
    .description('Automate environment setup for Onlook development')
    .version('0.0.1')
    .action(async () => {
    console.log(chalk_1.default.bold.blue('🔑 Onlook Environment Setup Script\n=================================='));
    try {
        // First handle backend keys and write to both client and db files
        await (0, backend_1.promptAndWriteBackendKeys)(clientEnvPath, dbEnvPath);
        // Then handle API keys and append to the existing client file
        await (0, api_keys_1.promptAndWriteApiKeys)(clientEnvPath);
        console.log(chalk_1.default.green('✅ Environment files created successfully!'));
        console.log(chalk_1.default.cyan('Next steps: https://docs.onlook.com'));
    }
    catch (err) {
        console.error(chalk_1.default.red('Error creating .env files:'), err);
        process.exit(1);
    }
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map