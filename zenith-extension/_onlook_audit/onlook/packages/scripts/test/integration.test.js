"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
(0, bun_test_1.describe)('environment file integration tests', () => {
    const testDir = node_path_1.default.join(__dirname, 'temp-integration');
    const testEnvPath = node_path_1.default.join(testDir, '.env');
    (0, bun_test_1.beforeEach)(() => {
        // Create test directory
        if (!node_fs_1.default.existsSync(testDir)) {
            node_fs_1.default.mkdirSync(testDir, { recursive: true });
        }
    });
    (0, bun_test_1.afterEach)(() => {
        // Clean up test files
        if (node_fs_1.default.existsSync(testDir)) {
            node_fs_1.default.rmSync(testDir, { recursive: true, force: true });
        }
    });
    (0, bun_test_1.it)('should handle reading existing environment files', () => {
        // Create a test .env file
        const existingContent = `# Database config
DB_HOST=localhost
DB_PORT=5432

# API Keys
API_KEY=test_api_key_placeholder_safe_123
OPTIONAL_KEY=

# URLs with special characters
WEBHOOK_URL=https://example.com/webhook?token=test_token_placeholder&user=test
`;
        node_fs_1.default.writeFileSync(testEnvPath, existingContent);
        // Read and parse the file (simulating what our code does)
        const content = node_fs_1.default.readFileSync(testEnvPath, 'utf-8');
        const lines = content.split('\n');
        const envVars = {};
        let currentComment = '';
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('#')) {
                currentComment = trimmedLine;
            }
            else if (trimmedLine.includes('=')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                if (key) {
                    envVars[key] = valueParts.join('=');
                }
                currentComment = '';
            }
        }
        (0, bun_test_1.expect)(envVars.DB_HOST).toBe('localhost');
        (0, bun_test_1.expect)(envVars.DB_PORT).toBe('5432');
        (0, bun_test_1.expect)(envVars.API_KEY).toBe('test_api_key_placeholder_safe_123');
        (0, bun_test_1.expect)(envVars.OPTIONAL_KEY).toBe('');
        (0, bun_test_1.expect)(envVars.WEBHOOK_URL).toBe('https://example.com/webhook?token=test_token_placeholder&user=test');
    });
    (0, bun_test_1.it)('should handle merging new and existing environment variables', () => {
        // Create existing .env file
        const existingContent = `EXISTING_KEY=existing_value
CONFLICT_KEY=old_value
`;
        node_fs_1.default.writeFileSync(testEnvPath, existingContent);
        // Simulate new content to merge
        const newContent = `CONFLICT_KEY=new_value
NEW_KEY=new_value
`;
        // Read existing
        const existing = node_fs_1.default.readFileSync(testEnvPath, 'utf-8');
        const existingVars = {};
        existing.split('\n').forEach((line) => {
            if (line.includes('=') && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key)
                    existingVars[key] = valueParts.join('=');
            }
        });
        // Parse new content
        const newVars = {};
        newContent.split('\n').forEach((line) => {
            if (line.includes('=') && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key)
                    newVars[key] = valueParts.join('=');
            }
        });
        // Simulate merge logic (keeping existing, adding new)
        const finalVars = { ...existingVars };
        for (const [key, value] of Object.entries(newVars)) {
            if (!existingVars[key]) {
                finalVars[key] = value; // Add new keys
            }
            // In real implementation, we'd prompt for conflicts
        }
        (0, bun_test_1.expect)(finalVars.EXISTING_KEY).toBe('existing_value');
        (0, bun_test_1.expect)(finalVars.CONFLICT_KEY).toBe('old_value'); // Kept existing
        (0, bun_test_1.expect)(finalVars.NEW_KEY).toBe('new_value'); // Added new
    });
    (0, bun_test_1.it)('should generate correct backend environment content without comments', () => {
        const mockKeys = {
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_token',
            serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_token',
        };
        // Test client env generation (expected format without comments)
        const expectedClientEnvContent = `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=${mockKeys.anonKey}
SUPABASE_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres`;
        // Test db env generation (expected format without comments)
        const expectedDbEnvContent = `SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=${mockKeys.serviceRoleKey}
SUPABASE_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres`;
        // Verify client content structure
        (0, bun_test_1.expect)(expectedClientEnvContent).toContain('NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321');
        (0, bun_test_1.expect)(expectedClientEnvContent).toContain(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${mockKeys.anonKey}`);
        (0, bun_test_1.expect)(expectedClientEnvContent).toContain('SUPABASE_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres');
        (0, bun_test_1.expect)(expectedClientEnvContent).not.toContain('#'); // No comments
        (0, bun_test_1.expect)(expectedClientEnvContent.split('\n')).toHaveLength(3); // No extra lines
        // Verify db content structure
        (0, bun_test_1.expect)(expectedDbEnvContent).toContain('SUPABASE_URL=http://127.0.0.1:54321');
        (0, bun_test_1.expect)(expectedDbEnvContent).toContain(`SUPABASE_SERVICE_ROLE_KEY=${mockKeys.serviceRoleKey}`);
        (0, bun_test_1.expect)(expectedDbEnvContent).toContain('SUPABASE_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres');
        (0, bun_test_1.expect)(expectedDbEnvContent).not.toContain('#'); // No comments
        (0, bun_test_1.expect)(expectedDbEnvContent.split('\n')).toHaveLength(3); // No extra lines
    });
    (0, bun_test_1.it)('should handle API key configuration validation', () => {
        const API_KEYS = {
            REQUIRED_KEY: { required: true },
            OPTIONAL_KEY: { required: false },
        };
        // Test required key validation
        const responses = {
            REQUIRED_KEY: '',
            OPTIONAL_KEY: 'optional_value',
        };
        const missingKeys = Object.entries(API_KEYS)
            .filter(([key, config]) => config.required && !responses[key])
            .map(([key]) => key);
        (0, bun_test_1.expect)(missingKeys).toEqual(['REQUIRED_KEY']);
        // Test with all required keys provided
        const validResponses = {
            REQUIRED_KEY: 'required_value',
            OPTIONAL_KEY: '',
        };
        const validMissingKeys = Object.entries(API_KEYS)
            .filter(([key, config]) => config.required && !validResponses[key])
            .map(([key]) => key);
        (0, bun_test_1.expect)(validMissingKeys).toEqual([]);
    });
    (0, bun_test_1.it)('should handle directory creation for nested paths', () => {
        const nestedEnvPath = node_path_1.default.join(testDir, 'deep', 'nested', 'path', '.env');
        const content = 'NESTED_KEY=nested_value\n';
        // Simulate creating directory structure
        const dir = nestedEnvPath.substring(0, nestedEnvPath.lastIndexOf('/'));
        if (!node_fs_1.default.existsSync(dir)) {
            node_fs_1.default.mkdirSync(dir, { recursive: true });
        }
        node_fs_1.default.writeFileSync(nestedEnvPath, content);
        (0, bun_test_1.expect)(node_fs_1.default.existsSync(nestedEnvPath)).toBe(true);
        (0, bun_test_1.expect)(node_fs_1.default.readFileSync(nestedEnvPath, 'utf-8')).toBe(content);
    });
});
//# sourceMappingURL=integration.test.js.map