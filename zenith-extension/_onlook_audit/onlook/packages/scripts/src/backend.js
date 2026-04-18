"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbEnvContent = exports.generateBackendEnvContent = exports.CLIENT_BACKEND_KEYS = exports.promptAndWriteBackendKeys = void 0;
const chalk_1 = __importDefault(require("chalk"));
const node_child_process_1 = require("node:child_process");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const ora_1 = __importDefault(require("ora"));
const zod_1 = require("zod");
const helpers_1 = require("./helpers");
/**
 * Finds the repository root directory by walking up from the current module's directory
 * looking for .git directory (preferred) or package.json with .git somewhere above it
 * @returns The absolute path to the repository root
 */
const findRepositoryRoot = () => {
    let currentDir = node_path_1.default.resolve(__dirname);
    const fsRoot = node_path_1.default.parse(currentDir).root;
    let firstPackageJsonDir = null;
    while (currentDir !== fsRoot) {
        const packageJsonPath = node_path_1.default.join(currentDir, 'package.json');
        const gitDirPath = node_path_1.default.join(currentDir, '.git');
        // Prioritize .git directory as the definitive repository root
        if (node_fs_1.default.existsSync(gitDirPath)) {
            return currentDir;
        }
        // Remember first package.json found as fallback
        if (node_fs_1.default.existsSync(packageJsonPath) && !firstPackageJsonDir) {
            firstPackageJsonDir = currentDir;
        }
        // Move up one directory
        const parentDir = node_path_1.default.dirname(currentDir);
        if (parentDir === currentDir) {
            // Reached filesystem root without finding markers
            break;
        }
        currentDir = parentDir;
    }
    // If we found a .git directory, it would have been returned above
    // If we found a package.json, use that as repository root
    if (firstPackageJsonDir) {
        return firstPackageJsonDir;
    }
    // Final fallback: assume we're in packages/scripts and go up two levels
    const fallbackDir = node_path_1.default.resolve(__dirname, '..', '..');
    // Verify fallback has expected markers
    if (node_fs_1.default.existsSync(node_path_1.default.join(fallbackDir, 'package.json')) ||
        node_fs_1.default.existsSync(node_path_1.default.join(fallbackDir, '.git'))) {
        return fallbackDir;
    }
    throw new Error(`Unable to find repository root. Searched from ${__dirname} up to ${fsRoot}. ` +
        `Expected to find .git directory or package.json file.`);
};
// Determine root directory
const rootDir = findRepositoryRoot();
const SupabaseStatusSchema = zod_1.z
    .object({
    ANON_KEY: zod_1.z.string(),
    API_URL: zod_1.z.string(),
    DB_URL: zod_1.z.string(),
    GRAPHQL_URL: zod_1.z.string(),
    INBUCKET_URL: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string(),
    MAILPIT_URL: zod_1.z.string(),
    PUBLISHABLE_KEY: zod_1.z.string(),
    S3_PROTOCOL_ACCESS_KEY_ID: zod_1.z.string(),
    S3_PROTOCOL_ACCESS_KEY_SECRET: zod_1.z.string(),
    S3_PROTOCOL_REGION: zod_1.z.string(),
    SECRET_KEY: zod_1.z.string(),
    SERVICE_ROLE_KEY: zod_1.z.string(),
    STORAGE_S3_URL: zod_1.z.string(),
    STUDIO_URL: zod_1.z.string(),
})
    .transform((raw) => ({
    anonKey: raw.ANON_KEY,
    apiUrl: raw.API_URL,
    dbUrl: raw.DB_URL,
    graphqlUrl: raw.GRAPHQL_URL,
    inbucketUrl: raw.INBUCKET_URL,
    jwtSecret: raw.JWT_SECRET,
    mailpitUrl: raw.MAILPIT_URL,
    publishableKey: raw.PUBLISHABLE_KEY,
    s3ProtocolAccessKeyId: raw.S3_PROTOCOL_ACCESS_KEY_ID,
    s3ProtocolAccessKeySecret: raw.S3_PROTOCOL_ACCESS_KEY_SECRET,
    s3ProtocolRegion: raw.S3_PROTOCOL_REGION,
    secretKey: raw.SECRET_KEY,
    serviceRoleKey: raw.SERVICE_ROLE_KEY,
    storageS3Url: raw.STORAGE_S3_URL,
    studioUrl: raw.STUDIO_URL,
}));
const promptAndWriteBackendKeys = async (clientEnvPath, dbEnvPath) => {
    await checkDockerRunning();
    const backendKeys = await startBackendAndExtractKeys();
    await (0, helpers_1.writeEnvFile)(clientEnvPath, getClientEnvContent(backendKeys), 'web client');
    await (0, helpers_1.writeEnvFile)(dbEnvPath, (0, exports.getDbEnvContent)(backendKeys), 'db package');
};
exports.promptAndWriteBackendKeys = promptAndWriteBackendKeys;
exports.CLIENT_BACKEND_KEYS = [
    {
        key: 'NEXT_PUBLIC_SUPABASE_URL',
        value: 'http://127.0.0.1:54321',
    },
    {
        key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        value: '', // Will be filled with actual key
    },
    {
        key: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
        value: '', // Will be filled with actual key
    },
    {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        value: '', // Will be filled with actual key
    },
    {
        key: 'SUPABASE_DATABASE_URL',
        value: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
    },
];
const DB_BACKEND_KEYS = [
    {
        key: 'SUPABASE_URL',
        value: 'http://127.0.0.1:54321',
    },
    {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        value: '', // Will be filled with actual key
    },
    {
        key: 'SUPABASE_SECRET_KEY',
        value: '', // Will be filled with actual key
    },
    {
        key: 'SUPABASE_DATABASE_URL',
        value: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
    },
];
/**
 * Generates environment content from configuration
 * @param config - Array of environment variable configurations
 * @param keys - Backend keys to substitute
 * @returns Formatted environment content
 */
const generateBackendEnvContent = (config, keys) => {
    const lines = [];
    for (const item of config) {
        // Substitute actual keys where needed
        let value = item.value;
        if (item.key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
            value = keys.anonKey;
        }
        else if (item.key === 'SUPABASE_SERVICE_ROLE_KEY') {
            value = keys.serviceRoleKey;
        }
        else if (item.key === 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') {
            value = keys.publishableKey;
        }
        else if (item.key === 'SUPABASE_SECRET_KEY') {
            value = keys.secretKey;
        }
        lines.push(`${item.key}=${value}`);
    }
    return lines.join('\n');
};
exports.generateBackendEnvContent = generateBackendEnvContent;
/**
 * Generates client environment configuration content
 * @param keys - Backend keys containing anon and service role keys
 * @returns Formatted environment content for client
 */
const getClientEnvContent = (keys) => {
    return (0, exports.generateBackendEnvContent)(exports.CLIENT_BACKEND_KEYS, keys);
};
/**
 * Generates database environment configuration content
 * @param keys - Backend keys containing anon and service role keys
 * @returns Formatted environment content for database
 */
const getDbEnvContent = (keys) => {
    return (0, exports.generateBackendEnvContent)(DB_BACKEND_KEYS, keys);
};
exports.getDbEnvContent = getDbEnvContent;
/**
 * Verifies that Docker is running on the system
 * @throws Exits process if Docker is not running
 */
const checkDockerRunning = async () => {
    const spinner = (0, ora_1.default)('Checking if Docker is running...').start();
    try {
        const proc = (0, node_child_process_1.spawn)('docker', ['info'], { stdio: 'ignore' });
        const isRunning = await new Promise((resolve) => {
            proc.once('close', (code) => resolve(code === 0));
            proc.once('error', () => resolve(false)); // e.g., ENOENT
        });
        if (!isRunning) {
            throw new Error('Docker is not running');
        }
        spinner.succeed('Docker is running.');
    }
    catch (err) {
        spinner.fail(err.message);
        process.exit(1);
    }
};
/**
 * Extracts Supabase keys from supabase status -o json output
 * @param output - Raw JSON output from supabase status command
 * @returns Extracted keys or null if not found
 */
const extractSupabaseKeys = (output) => {
    try {
        const parsed = JSON.parse(output);
        const validationResult = SupabaseStatusSchema.safeParse(parsed);
        if (!validationResult.success) {
            console.error('Supabase status validation failed:', validationResult.error.issues);
            return null;
        }
        const status = validationResult.data;
        const anonKey = status.anonKey;
        const serviceRoleKey = status.serviceRoleKey;
        const publishableKey = status.publishableKey;
        const secretKey = status.secretKey;
        if (!anonKey || !serviceRoleKey) {
            console.warn('Missing required Supabase keys in status output');
            return null;
        }
        return { anonKey, serviceRoleKey, publishableKey, secretKey };
    }
    catch (error) {
        console.error('Failed to parse Supabase status JSON:', error);
        return null;
    }
};
const createProcessHandlers = (proc, spinner, timeout, resolve, reject) => {
    let resolved = false;
    let buffer = '';
    const cleanup = () => {
        proc.stdout?.off('data', onData);
        proc.stderr?.off('data', onData);
        proc.off('close', onClose);
        proc.off('error', onError);
    };
    const onData = (data) => {
        if (resolved)
            return;
        buffer += data.toString();
        try {
            const keys = extractSupabaseKeys(buffer);
            if (keys) {
                resolved = true;
                clearTimeout(timeout);
                proc.kill();
                cleanup();
                spinner.succeed('Successfully extracted Supabase keys.');
                resolve(keys);
            }
        }
        catch {
            // JSON might be incomplete, continue buffering
            console.debug('Incomplete JSON received, continuing to buffer...');
        }
    };
    const onClose = () => {
        if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            cleanup();
            spinner.fail('Failed to extract Supabase keys.');
            reject(new Error('Supabase keys not found'));
        }
    };
    const onError = (err) => {
        if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            cleanup();
            spinner.fail(`Backend error: ${err.message}`);
            reject(err);
        }
    };
    return { onData, onClose, onError };
};
const startBackendAndExtractKeys = async () => {
    console.log(chalk_1.default.yellow('🚀 Starting Supabase backend...'));
    const spinner = (0, ora_1.default)('Waiting for Supabase to initialize...').start();
    const startProc = (0, node_child_process_1.spawn)('bun run', ['backend:start'], { cwd: rootDir, shell: true });
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            startProc.kill();
            spinner.fail('Timed out waiting for Supabase keys.');
            reject(new Error('Supabase start timeout'));
        }, 120_000);
        startProc.on('close', (code) => {
            clearTimeout(timeout);
            if (code === 0) {
                resolve();
            }
            else {
                spinner.fail('Failed to start Supabase backend.');
                reject(new Error('Supabase start failed'));
            }
        });
        startProc.on('error', (err) => {
            clearTimeout(timeout);
            spinner.fail(`Backend error: ${err.message}`);
            reject(err);
        });
    });
    spinner.succeed('Supabase backend started.');
    // Now get all keys from status
    const keysSpinner = (0, ora_1.default)('Extracting Supabase keys...').start();
    const backendDir = node_path_1.default.join(rootDir, 'apps', 'backend');
    const statusProc = (0, node_child_process_1.spawn)('supabase', ['status', '-o', 'json'], {
        cwd: backendDir,
        shell: true,
    });
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            statusProc.kill();
            keysSpinner.fail('Timed out waiting for Supabase keys.');
            reject(new Error('Supabase status timeout'));
        }, 30_000);
        const { onData, onClose, onError } = createProcessHandlers(statusProc, keysSpinner, timeout, resolve, reject);
        statusProc.stdout?.on('data', onData);
        statusProc.on('close', onClose);
        statusProc.on('error', onError);
    });
};
//# sourceMappingURL=backend.js.map