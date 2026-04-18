"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeEnvFile = exports.buildEnvFileContent = exports.parseEnvContent = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const ora_1 = __importDefault(require("ora"));
const prompts_1 = __importDefault(require("prompts"));
const chalk_1 = __importDefault(require("chalk"));
/**
 * Parses environment file content into a structured map
 * @param content - The raw .env file content
 * @returns Map of environment variables with their metadata
 */
const parseEnvContent = (content) => {
    const envVars = new Map();
    const lines = content.split('\n');
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.includes('=') &&
            trimmedLine.indexOf('=') > 0 &&
            !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            const cleanKey = key?.trim();
            if (cleanKey) {
                const value = valueParts.join('=');
                envVars.set(cleanKey, {
                    key: cleanKey,
                    value,
                });
            }
        }
    }
    return envVars;
};
exports.parseEnvContent = parseEnvContent;
/**
 * Handles conflicts between existing and new environment variables
 * @param existingVars - Current environment variables
 * @param newVars - New environment variables to be added
 * @returns Resolved set of environment variables
 */
const resolveVariableConflicts = async (existingVars, newVars) => {
    const resolvedVars = new Map(existingVars);
    for (const [key, newVar] of newVars) {
        if (existingVars.has(key)) {
            const userChoice = await promptForVariableAction(key);
            if (userChoice === 'replace') {
                resolvedVars.set(key, newVar);
                console.log(chalk_1.default.green(`✓ Replaced ${key} with new value\n`));
            }
            else {
                console.log(chalk_1.default.blue(`✓ Keeping existing value for ${key}\n`));
            }
        }
        else {
            resolvedVars.set(key, newVar);
            console.log(chalk_1.default.green(`✓ Added new variable: ${key}`));
        }
    }
    return resolvedVars;
};
/**
 * Prompts user for action when a variable conflict is detected
 * @param key - The conflicting environment variable key
 * @returns User's choice: 'replace' or 'skip'
 */
const promptForVariableAction = async (key) => {
    process.stdout.write('\n');
    console.log(chalk_1.default.yellow(`⚠️  Variable ${chalk_1.default.bold(key)} already exists`));
    console.log('');
    const response = await (0, prompts_1.default)({
        type: 'select',
        name: 'action',
        message: `What would you like to do with ${key}?`,
        choices: [
            { title: 'Keep existing value', value: 'skip' },
            { title: 'Replace with new value', value: 'replace' },
        ],
        initial: 0,
    });
    return response.action || 'skip';
};
/**
 * Reconstructs environment file content from variable map
 * @param envVars - Map of environment variables
 * @returns Formatted .env file content
 */
const buildEnvFileContent = (envVars) => {
    const lines = [];
    const envArray = Array.from(envVars.values());
    for (const envVar of envArray) {
        lines.push(`${envVar.key}=${envVar.value}`);
    }
    return lines.join('\n');
};
exports.buildEnvFileContent = buildEnvFileContent;
const writeEnvFile = async (filePath, content, label) => {
    const spinner = (0, ora_1.default)(`Processing ${label} .env file`).start();
    try {
        let existingContent = '';
        let fileExists = false;
        // Check if file exists and read existing content
        if (node_fs_1.default.existsSync(filePath)) {
            fileExists = true;
            existingContent = node_fs_1.default.readFileSync(filePath, 'utf-8');
        }
        const existingVars = (0, exports.parseEnvContent)(existingContent);
        const newVars = (0, exports.parseEnvContent)(content);
        spinner.stop();
        // Give the terminal a moment to clear the spinner
        await new Promise((resolve) => setTimeout(resolve, 10));
        if (fileExists && existingVars.size > 0) {
            console.log(chalk_1.default.blue(`\n📄 Found existing .env file at ${filePath}`));
            const resolvedVars = await resolveVariableConflicts(existingVars, newVars);
            const finalContent = (0, exports.buildEnvFileContent)(resolvedVars);
            const writeSpinner = (0, ora_1.default)(`Writing updated ${label} .env to ${filePath}`).start();
            try {
                // Ensure directory exists using cross-platform path handling
                const dir = node_path_1.default.dirname(filePath);
                await node_fs_1.default.promises.mkdir(dir, { recursive: true });
                // Write file with restrictive permissions (readable/writable only by owner)
                await node_fs_1.default.promises.writeFile(filePath, finalContent, { mode: 0o600 });
                writeSpinner.succeed(`${label} .env updated at ${filePath}`);
            }
            catch (error) {
                writeSpinner.fail(`Failed to update ${label} .env at ${filePath}`);
                throw error;
            }
        }
        else {
            const writeSpinner = (0, ora_1.default)(`Writing new ${label} .env to ${filePath}`).start();
            try {
                // Ensure directory exists using cross-platform path handling
                const dir = node_path_1.default.dirname(filePath);
                await node_fs_1.default.promises.mkdir(dir, { recursive: true });
                // Write file with restrictive permissions (readable/writable only by owner)
                await node_fs_1.default.promises.writeFile(filePath, content, { mode: 0o600 });
                writeSpinner.succeed(`${label} .env written to ${filePath}`);
            }
            catch (error) {
                writeSpinner.fail(`Failed to write ${label} .env to ${filePath}`);
                throw error;
            }
        }
    }
    catch (err) {
        spinner.fail(`Failed processing ${label} .env`);
        throw err;
    }
};
exports.writeEnvFile = writeEnvFile;
//# sourceMappingURL=helpers.js.map