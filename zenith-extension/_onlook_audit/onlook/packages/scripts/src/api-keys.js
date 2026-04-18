"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptAndWriteApiKeys = void 0;
const chalk_1 = __importDefault(require("chalk"));
const node_fs_1 = __importDefault(require("node:fs"));
const prompts_1 = __importDefault(require("prompts"));
const API_KEYS = {
    CSB_API_KEY: {
        name: 'CSB_API_KEY',
        message: 'Enter your Codesandbox API key:',
        required: true,
    },
    OPENROUTER_API_KEY: {
        name: 'OPENROUTER_API_KEY',
        message: 'Enter your OpenRouter API key:',
        required: true,
    },
};
/**
 * Reads existing API keys from the environment file
 * @param clientEnvPath - Path to the client .env file
 * @returns Object containing existing API key values
 */
const readExistingApiKeys = (clientEnvPath) => {
    const existingKeys = {};
    if (!node_fs_1.default.existsSync(clientEnvPath)) {
        return existingKeys;
    }
    try {
        const content = node_fs_1.default.readFileSync(clientEnvPath, 'utf-8');
        const lines = content.split('\n');
        const validApiKeys = new Set(Object.keys(API_KEYS));
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.includes('=') &&
                !trimmedLine.startsWith('#') &&
                trimmedLine.indexOf('=') > 0) {
                const [key, ...valueParts] = trimmedLine.split('=');
                const cleanKey = key?.trim();
                if (cleanKey && validApiKeys.has(cleanKey)) {
                    existingKeys[cleanKey] = valueParts.join('=');
                }
            }
        }
    }
    catch (err) {
        console.warn(chalk_1.default.yellow(`Warning: Could not read existing .env file: ${err}`));
    }
    return existingKeys;
};
const promptAndWriteApiKeys = async (clientEnvPath) => {
    const existingKeys = readExistingApiKeys(clientEnvPath);
    const responses = await promptForApiKeys(existingKeys);
    const envContent = generateEnvContent(responses);
    // Since we already handled existing key conflicts in promptForApiKeys,
    // we need to manually update the file to avoid duplicate prompting
    await writeApiKeysToFile(clientEnvPath, envContent);
};
exports.promptAndWriteApiKeys = promptAndWriteApiKeys;
/**
 * Writes API keys to file, removing old API key sections
 * @param filePath - Path to the .env file
 * @param newContent - New API key content to write
 */
const writeApiKeysToFile = async (filePath, newContent) => {
    try {
        const existingContent = node_fs_1.default.existsSync(filePath) ? node_fs_1.default.readFileSync(filePath, 'utf-8') : '';
        const filteredContent = removeOldApiKeyEntries(existingContent);
        ensureDirectoryExists(filePath);
        // Only add newline separator if filtered content exists and doesn't end with newline
        const separator = filteredContent && !filteredContent.endsWith('\n') ? '\n' : '';
        const finalContent = filteredContent + separator + newContent;
        node_fs_1.default.writeFileSync(filePath, finalContent);
        console.log(chalk_1.default.green('✅ API keys updated successfully!'));
    }
    catch (err) {
        console.error(chalk_1.default.red('Failed to write API keys:'), err);
        throw err;
    }
};
/**
 * Removes old API key entries from existing content
 * @param content - Existing file content
 * @returns Filtered content without old API keys
 */
const removeOldApiKeyEntries = (content) => {
    const lines = content.split('\n');
    const filteredLines = [];
    const apiKeyNames = new Set(Object.keys(API_KEYS));
    let skipNextLine = false;
    for (const line of lines) {
        const trimmedLine = line.trim();
        // Skip API key variable lines
        const keyName = extractKeyName(trimmedLine);
        if (trimmedLine.includes('=') && keyName && apiKeyNames.has(keyName)) {
            skipNextLine = false;
            continue;
        }
        // Skip empty lines after API key comments
        if (skipNextLine && trimmedLine === '') {
            skipNextLine = false;
            continue;
        }
        filteredLines.push(line);
        skipNextLine = false;
    }
    return filteredLines.join('\n').trim();
};
/**
 * Extracts description from a comment line
 * @param commentLine - Comment line starting with #
 * @returns Description text or undefined
 */
const extractDescription = (commentLine) => {
    const match = commentLine.match(/^#\s*(.+)/);
    return match?.[1]?.trim();
};
/**
 * Extracts key name from a variable line
 * @param variableLine - Variable line with key=value format
 * @returns Key name or undefined
 */
const extractKeyName = (variableLine) => {
    const equalIndex = variableLine.indexOf('=');
    if (equalIndex > 0) {
        return variableLine.substring(0, equalIndex).trim();
    }
    return undefined;
};
/**
 * Ensures the directory for a file path exists
 * @param filePath - Full path to the file
 */
const ensureDirectoryExists = (filePath) => {
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    if (!node_fs_1.default.existsSync(dir)) {
        node_fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
/**
 * Generates environment content for API keys
 * @param responses - User responses for API keys
 * @returns Formatted environment content
 */
const generateEnvContent = (responses) => {
    const lines = [];
    const entries = Object.entries(API_KEYS);
    for (const [key] of entries) {
        const value = responses[key] || '';
        lines.push(`${key}=${value}`);
    }
    return lines.join('\n');
};
const promptForApiKeys = async (existingKeys) => {
    const responses = {};
    console.log(chalk_1.default.blue('\n🔑 API Key Configuration'));
    console.log(chalk_1.default.gray('Configure your API keys for Onlook services\n'));
    for (const [keyName, config] of Object.entries(API_KEYS)) {
        const hasExisting = existingKeys[keyName];
        if (hasExisting) {
            console.log(chalk_1.default.yellow(`\n⚠️  ${keyName} API key already exists`));
            const action = await (0, prompts_1.default)({
                type: 'select',
                name: 'choice',
                message: `What would you like to do with ${keyName}?`,
                choices: [
                    { title: 'Keep existing key', value: 'keep' },
                    { title: 'Replace with new key', value: 'replace' },
                    ...(config.required ? [] : [{ title: 'Remove key', value: 'remove' }]),
                ],
                initial: 0,
            });
            if (action.choice === 'keep') {
                responses[keyName] = hasExisting;
                console.log(chalk_1.default.green(`✓ Keeping existing ${keyName} key`));
                continue;
            }
            else if (action.choice === 'remove') {
                responses[keyName] = '';
                console.log(chalk_1.default.blue(`✓ Removed ${keyName} key`));
                continue;
            }
            // If 'replace' is selected, continue to prompt for new key
        }
        const response = await (0, prompts_1.default)({
            type: 'password',
            name: 'value',
            message: hasExisting ? `Enter new ${keyName} API key:` : config.message,
            validate: config.required
                ? (value) => value.length > 0 || `${keyName} is required`
                : undefined,
        });
        if (response.value !== undefined) {
            responses[keyName] = response.value;
            if (response.value) {
                console.log(chalk_1.default.green(`✓ ${hasExisting ? 'Updated' : 'Set'} ${keyName} key`));
            }
        }
        else {
            // User cancelled, keep existing if available
            if (hasExisting) {
                responses[keyName] = hasExisting;
            }
            else if (config.required) {
                console.error(chalk_1.default.red(`${keyName} API key is required.`));
                process.exit(1);
            }
        }
    }
    validateResponses(responses);
    return responses;
};
const validateResponses = (responses) => {
    const missingKeys = Object.entries(API_KEYS)
        .filter(([key, config]) => config.required && !responses[key])
        .map(([key]) => key);
    if (missingKeys.length > 0) {
        missingKeys.forEach((key) => {
            console.error(chalk_1.default.red(`${key} API key is required.`));
        });
        process.exit(1);
    }
};
//# sourceMappingURL=api-keys.js.map