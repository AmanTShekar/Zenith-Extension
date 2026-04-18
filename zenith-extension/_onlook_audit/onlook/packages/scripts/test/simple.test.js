"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// Test helper functions that don't require complex mocking
(0, bun_test_1.describe)('basic functionality tests', () => {
    const testDir = node_path_1.default.join(__dirname, 'temp-simple');
    (0, bun_test_1.it)('should be able to create and read files', () => {
        // Ensure test directory exists
        if (!node_fs_1.default.existsSync(testDir)) {
            node_fs_1.default.mkdirSync(testDir, { recursive: true });
        }
        const testFile = node_path_1.default.join(testDir, 'test.env');
        const content = 'TEST_KEY=test_value\n';
        node_fs_1.default.writeFileSync(testFile, content);
        const readContent = node_fs_1.default.readFileSync(testFile, 'utf-8');
        (0, bun_test_1.expect)(readContent).toBe(content);
        // Cleanup
        node_fs_1.default.rmSync(testDir, { recursive: true, force: true });
    });
    (0, bun_test_1.it)('should correctly parse environment variable lines', () => {
        const envContent = `# Comment
KEY1=value1
KEY2=value with spaces
KEY3=https://example.com?param=value&other=data
EMPTY_KEY=
`;
        const lines = envContent.split('\n');
        const parsedVars = {};
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.includes('=') && !trimmedLine.startsWith('#')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                if (key) {
                    parsedVars[key] = valueParts.join('=');
                }
            }
        }
        (0, bun_test_1.expect)(parsedVars.KEY1).toBe('value1');
        (0, bun_test_1.expect)(parsedVars.KEY2).toBe('value with spaces');
        (0, bun_test_1.expect)(parsedVars.KEY3).toBe('https://example.com?param=value&other=data');
        (0, bun_test_1.expect)(parsedVars.EMPTY_KEY).toBe('');
        (0, bun_test_1.expect)(parsedVars['# Comment']).toBeUndefined();
    });
    (0, bun_test_1.it)('should generate proper env content format without descriptions', () => {
        const API_KEYS = {
            TEST_KEY1: { required: true },
            TEST_KEY2: { required: false },
        };
        const responses = {
            TEST_KEY1: 'value1',
            TEST_KEY2: 'value2',
        };
        const envContent = Object.entries(API_KEYS)
            .map(([key]) => {
            const value = responses[key] || '';
            return `${key}=${value}`;
        })
            .join('\n');
        (0, bun_test_1.expect)(envContent).not.toContain('#'); // No comments
        (0, bun_test_1.expect)(envContent).toContain('TEST_KEY1=value1');
        (0, bun_test_1.expect)(envContent).toContain('TEST_KEY2=value2');
        (0, bun_test_1.expect)(envContent.split('\n')).toHaveLength(2); // No extra lines
        (0, bun_test_1.expect)(envContent).toBe('TEST_KEY1=value1\nTEST_KEY2=value2');
    });
    (0, bun_test_1.it)('should validate JWT token patterns', () => {
        const jwtPattern = /^ey[A-Za-z0-9_-]{3,}$/; // JWT tokens need to be longer than just "ey"
        (0, bun_test_1.expect)('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9').toMatch(jwtPattern);
        (0, bun_test_1.expect)('test_jwt_like_pattern_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9').not.toMatch(jwtPattern);
        (0, bun_test_1.expect)('invalid-token').not.toMatch(jwtPattern);
        (0, bun_test_1.expect)('ey').not.toMatch(jwtPattern); // Too short
        (0, bun_test_1.expect)('').not.toMatch(jwtPattern);
    });
    (0, bun_test_1.it)('should extract supabase keys from output', () => {
        const extractSupabaseKeys = (output) => {
            const anon = output.match(/anon key: (ey[A-Za-z0-9_-]+[^\r\n]*)/);
            const role = output.match(/service_role key: (ey[A-Za-z0-9_-]+[^\r\n]*)/);
            return anon?.[1] && role?.[1] ? { anonKey: anon[1], serviceRoleKey: role[1] } : null;
        };
        const validOutput = `
Started supabase local development setup.
anon key: eyTest_demo_anon_key_safe_placeholder_string
service_role key: eyTest_demo_service_role_key_safe_placeholder_string
        `;
        const keys = extractSupabaseKeys(validOutput);
        (0, bun_test_1.expect)(keys).not.toBeNull();
        (0, bun_test_1.expect)(keys?.anonKey).toBe('eyTest_demo_anon_key_safe_placeholder_string');
        (0, bun_test_1.expect)(keys?.serviceRoleKey).toBe('eyTest_demo_service_role_key_safe_placeholder_string');
        const invalidOutput = 'No keys here';
        (0, bun_test_1.expect)(extractSupabaseKeys(invalidOutput)).toBeNull();
    });
});
//# sourceMappingURL=simple.test.js.map