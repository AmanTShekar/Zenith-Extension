"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("@onlook/models");
const bun_test_1 = require("bun:test");
const branch_1 = require("../../src/contexts/classes/branch");
(0, bun_test_1.describe)('BranchContext', () => {
    const createMockBranch = (overrides = {}) => ({
        id: 'branch-123',
        projectId: 'project-456',
        name: 'feature/user-authentication',
        description: 'Implement user login and registration system',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        isDefault: false,
        git: {
            branch: 'feature/user-auth',
            commitSha: 'abc123def456',
            repoUrl: 'https://github.com/example/repo.git',
        },
        sandbox: {
            id: 'sandbox-789',
        },
        ...overrides,
    });
    const createMockBranchContext = (overrides = {}) => ({
        type: models_1.MessageContextType.BRANCH,
        content: 'Working on user authentication flow with OAuth integration',
        displayName: 'Authentication Branch',
        branch: createMockBranch(),
        ...overrides,
    });
    (0, bun_test_1.describe)('static properties', () => {
        (0, bun_test_1.test)('should have correct context type', () => {
            (0, bun_test_1.expect)(branch_1.BranchContext.contextType).toBe(models_1.MessageContextType.BRANCH);
        });
        (0, bun_test_1.test)('should have correct display name', () => {
            (0, bun_test_1.expect)(branch_1.BranchContext.displayName).toBe('Branch');
        });
        (0, bun_test_1.test)('should have an icon', () => {
            (0, bun_test_1.expect)(branch_1.BranchContext.icon).toBeDefined();
        });
    });
    (0, bun_test_1.describe)('getPrompt', () => {
        (0, bun_test_1.test)('should generate correct prompt format', () => {
            const context = createMockBranchContext();
            const prompt = branch_1.BranchContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Branch: feature/user-authentication (branch-123)');
            (0, bun_test_1.expect)(prompt).toContain('Description: Working on user authentication flow with OAuth integration');
        });
        (0, bun_test_1.test)('should handle branch with null description', () => {
            const context = createMockBranchContext({
                branch: createMockBranch({ description: null }),
                content: 'Main development branch',
            });
            const prompt = branch_1.BranchContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Branch: feature/user-authentication (branch-123)');
            (0, bun_test_1.expect)(prompt).toContain('Description: Main development branch');
        });
        (0, bun_test_1.test)('should handle empty content', () => {
            const context = createMockBranchContext({
                content: '',
            });
            const prompt = branch_1.BranchContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Branch: feature/user-authentication (branch-123)');
            (0, bun_test_1.expect)(prompt).toContain('Description: ');
        });
        (0, bun_test_1.test)('should handle branch with special characters in name', () => {
            const context = createMockBranchContext({
                branch: createMockBranch({
                    name: 'fix/bug-&-improvement-#123',
                    id: 'branch-special-456',
                }),
            });
            const prompt = branch_1.BranchContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Branch: fix/bug-&-improvement-#123 (branch-special-456)');
        });
        (0, bun_test_1.test)('should handle very long branch names', () => {
            const longName = 'feature/very-long-branch-name-that-describes-complex-functionality-in-great-detail';
            const context = createMockBranchContext({
                branch: createMockBranch({ name: longName }),
            });
            const prompt = branch_1.BranchContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain(`Branch: ${longName} (branch-123)`);
        });
        (0, bun_test_1.test)('should handle multiline content description', () => {
            const context = createMockBranchContext({
                content: 'Multi-line description:\n- Add login form\n- Implement OAuth\n- Add validation',
            });
            const prompt = branch_1.BranchContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Multi-line description:');
            (0, bun_test_1.expect)(prompt).toContain('- Add login form');
            (0, bun_test_1.expect)(prompt).toContain('- Implement OAuth');
            (0, bun_test_1.expect)(prompt).toContain('- Add validation');
        });
        (0, bun_test_1.test)('should handle unicode characters in branch name and content', () => {
            const context = createMockBranchContext({
                branch: createMockBranch({ name: 'feature/internationalization-🌍' }),
                content: 'Adding support for 中文 and العربية languages',
            });
            const prompt = branch_1.BranchContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('feature/internationalization-🌍');
            (0, bun_test_1.expect)(prompt).toContain('中文 and العربية');
        });
    });
    (0, bun_test_1.describe)('getLabel', () => {
        (0, bun_test_1.test)('should use displayName when available', () => {
            const context = createMockBranchContext({
                displayName: 'Custom Branch Label',
            });
            const label = branch_1.BranchContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Custom Branch Label');
        });
        (0, bun_test_1.test)('should fallback to branch name when no displayName', () => {
            const context = createMockBranchContext({
                displayName: '',
                branch: createMockBranch({ name: 'development' }),
            });
            const label = branch_1.BranchContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('development');
        });
        (0, bun_test_1.test)('should fallback to branch name when displayName is undefined', () => {
            const context = createMockBranchContext();
            delete context.displayName;
            const label = branch_1.BranchContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('feature/user-authentication');
        });
        (0, bun_test_1.test)('should handle empty branch name', () => {
            const context = createMockBranchContext({
                displayName: '',
                branch: createMockBranch({ name: '' }),
            });
            const label = branch_1.BranchContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('');
        });
        (0, bun_test_1.test)('should handle whitespace-only displayName', () => {
            const context = createMockBranchContext({
                displayName: '   \t\n   ',
            });
            const label = branch_1.BranchContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('   \t\n   ');
        });
    });
    (0, bun_test_1.describe)('getBranchesContent', () => {
        (0, bun_test_1.test)('should generate content for single branch', () => {
            const branches = [createMockBranchContext()];
            const content = branch_1.BranchContext.getBranchesContent(branches);
            (0, bun_test_1.expect)(content).toContain("I'm working on the following branches:");
            (0, bun_test_1.expect)(content).toContain('branch-123');
            (0, bun_test_1.expect)(content).toContain('<branches>');
            (0, bun_test_1.expect)(content).toContain('</branches>');
        });
        (0, bun_test_1.test)('should generate content for multiple branches', () => {
            const branches = [
                createMockBranchContext({
                    branch: createMockBranch({ id: 'branch-1', name: 'main' }),
                }),
                createMockBranchContext({
                    branch: createMockBranch({ id: 'branch-2', name: 'feature/auth' }),
                }),
                createMockBranchContext({
                    branch: createMockBranch({ id: 'branch-3', name: 'bugfix/layout' }),
                }),
            ];
            const content = branch_1.BranchContext.getBranchesContent(branches);
            (0, bun_test_1.expect)(content).toContain('branch-1, branch-2, branch-3');
            (0, bun_test_1.expect)(content).toContain('<branches>');
        });
        (0, bun_test_1.test)('should handle empty branches array', () => {
            const content = branch_1.BranchContext.getBranchesContent([]);
            (0, bun_test_1.expect)(content).toContain("I'm working on the following branches:");
            (0, bun_test_1.expect)(content).toContain('<branches>');
            (0, bun_test_1.expect)(content).toContain('</branches>');
        });
        (0, bun_test_1.test)('should handle branches with special characters in IDs', () => {
            const branches = [
                createMockBranchContext({
                    branch: createMockBranch({ id: 'branch-special-&-chars-123' }),
                }),
                createMockBranchContext({
                    branch: createMockBranch({ id: 'branch_with_underscores' }),
                }),
            ];
            const content = branch_1.BranchContext.getBranchesContent(branches);
            (0, bun_test_1.expect)(content).toContain('branch-special-&-chars-123, branch_with_underscores');
        });
        (0, bun_test_1.test)('should preserve branch order', () => {
            const branches = [
                createMockBranchContext({
                    branch: createMockBranch({ id: 'first' }),
                }),
                createMockBranchContext({
                    branch: createMockBranch({ id: 'second' }),
                }),
                createMockBranchContext({
                    branch: createMockBranch({ id: 'third' }),
                }),
            ];
            const content = branch_1.BranchContext.getBranchesContent(branches);
            (0, bun_test_1.expect)(content).toContain('first, second, third');
        });
        (0, bun_test_1.test)('should handle very long branch ID lists', () => {
            const branches = Array(20).fill(0).map((_, i) => createMockBranchContext({
                branch: createMockBranch({ id: `branch-${i}` }),
            }));
            const content = branch_1.BranchContext.getBranchesContent(branches);
            (0, bun_test_1.expect)(content).toContain('branch-0');
            (0, bun_test_1.expect)(content).toContain('branch-19');
            (0, bun_test_1.expect)(content.split(',').length).toBe(20);
        });
    });
    (0, bun_test_1.describe)('edge cases', () => {
        (0, bun_test_1.test)('should handle branch with minimal data', () => {
            const minimalBranch = createMockBranch({
                name: 'main',
                description: null,
                git: null,
            });
            const context = createMockBranchContext({
                branch: minimalBranch,
                content: 'Main branch',
            });
            const prompt = branch_1.BranchContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Branch: main (branch-123)');
            (0, bun_test_1.expect)(prompt).toContain('Description: Main branch');
        });
        (0, bun_test_1.test)('should handle branch with git information', () => {
            const context = createMockBranchContext();
            // Git info is included in the branch but not directly used in prompt
            (0, bun_test_1.expect)(context.branch.git?.branch).toBe('feature/user-auth');
            (0, bun_test_1.expect)(context.branch.git?.commitSha).toBe('abc123def456');
        });
        (0, bun_test_1.test)('should handle default branch', () => {
            const context = createMockBranchContext({
                branch: createMockBranch({
                    name: 'main',
                    isDefault: true,
                }),
            });
            const prompt = branch_1.BranchContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Branch: main (branch-123)');
        });
        (0, bun_test_1.test)('should handle branch with very long description', () => {
            const longDescription = 'This is a very long description. '.repeat(50);
            const context = createMockBranchContext({
                content: longDescription,
            });
            const prompt = branch_1.BranchContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain(longDescription);
        });
        (0, bun_test_1.test)('should handle branch with null or undefined properties gracefully', () => {
            const context = {
                type: models_1.MessageContextType.BRANCH,
                content: 'Test content',
                displayName: null,
                branch: {
                    id: 'test-id',
                    name: 'test-branch',
                },
            };
            (0, bun_test_1.expect)(() => branch_1.BranchContext.getPrompt(context)).not.toThrow();
            (0, bun_test_1.expect)(() => branch_1.BranchContext.getLabel(context)).not.toThrow();
        });
        (0, bun_test_1.test)('should handle branch with empty strings', () => {
            const context = createMockBranchContext({
                branch: createMockBranch({ name: '', id: '' }),
                content: '',
                displayName: '',
            });
            const prompt = branch_1.BranchContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Branch:  ()');
            (0, bun_test_1.expect)(prompt).toContain('Description: ');
        });
        (0, bun_test_1.test)('should handle complex branch names with slashes and hyphens', () => {
            const context = createMockBranchContext({
                branch: createMockBranch({
                    name: 'feature/user-management/add-roles-and-permissions',
                }),
            });
            const prompt = branch_1.BranchContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('feature/user-management/add-roles-and-permissions');
        });
    });
});
//# sourceMappingURL=branch-context.test.js.map