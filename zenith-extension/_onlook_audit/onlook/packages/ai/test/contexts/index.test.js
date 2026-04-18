"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("@onlook/models");
const bun_test_1 = require("bun:test");
const uuid_1 = require("uuid");
const contexts_1 = require("../../src/contexts");
(0, bun_test_1.describe)('Context Index', () => {
    const createMockBranch = () => ({
        id: 'test-branch-id',
        projectId: 'test-project-id',
        name: 'test-branch',
        description: 'Test branch description',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: false,
        git: null,
        sandbox: { id: 'test-sandbox' },
    });
    const createMockContexts = () => ({
        file: {
            type: models_1.MessageContextType.FILE,
            path: 'src/test.ts',
            content: 'console.log("test");',
            displayName: 'test.ts',
            branchId: 'branch-123',
        },
        highlight: {
            type: models_1.MessageContextType.HIGHLIGHT,
            path: 'src/test.ts',
            start: 1,
            end: 5,
            content: 'console.log("test");',
            displayName: 'test.ts',
            branchId: 'branch-123',
        },
        error: {
            type: models_1.MessageContextType.ERROR,
            content: 'TypeError: Cannot read property',
            displayName: 'Runtime Error',
            branchId: 'branch-123',
        },
        branch: {
            type: models_1.MessageContextType.BRANCH,
            content: 'Working on feature implementation',
            displayName: 'Feature Branch',
            branch: createMockBranch(),
        },
        image: {
            type: models_1.MessageContextType.IMAGE,
            content: 'data:image/png;base64,test-data',
            displayName: 'screenshot.png',
            mimeType: 'image/png',
            id: (0, uuid_1.v4)(),
        },
        agentRule: {
            type: models_1.MessageContextType.AGENT_RULE,
            content: '# Project Rules\nUse TypeScript',
            displayName: 'CLAUDE.md',
            path: '/project/CLAUDE.md',
        },
    });
    (0, bun_test_1.describe)('getContextPrompt', () => {
        (0, bun_test_1.test)('should route to correct context class for FILE type', () => {
            const contexts = createMockContexts();
            const prompt = (0, contexts_1.getContextPrompt)(contexts.file);
            (0, bun_test_1.expect)(prompt).toContain('<path>src/test.ts</path>');
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: "branch-123"</branch>');
            (0, bun_test_1.expect)(prompt).toContain('```ts');
            (0, bun_test_1.expect)(prompt).toContain('console.log("test");');
        });
        (0, bun_test_1.test)('should route to correct context class for HIGHLIGHT type', () => {
            const contexts = createMockContexts();
            const prompt = (0, contexts_1.getContextPrompt)(contexts.highlight);
            (0, bun_test_1.expect)(prompt).toContain('<path>src/test.ts#L1:L5</path>');
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: "branch-123"</branch>');
            (0, bun_test_1.expect)(prompt).toContain('```');
            (0, bun_test_1.expect)(prompt).toContain('console.log("test");');
        });
        (0, bun_test_1.test)('should route to correct context class for ERROR type', () => {
            const contexts = createMockContexts();
            const prompt = (0, contexts_1.getContextPrompt)(contexts.error);
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: "branch-123"</branch>');
            (0, bun_test_1.expect)(prompt).toContain('<error>TypeError: Cannot read property</error>');
        });
        (0, bun_test_1.test)('should route to correct context class for BRANCH type', () => {
            const contexts = createMockContexts();
            const prompt = (0, contexts_1.getContextPrompt)(contexts.branch);
            (0, bun_test_1.expect)(prompt).toContain('Branch: test-branch (test-branch-id)');
            (0, bun_test_1.expect)(prompt).toContain('Description: Working on feature implementation');
        });
        (0, bun_test_1.test)('should route to correct context class for IMAGE type', () => {
            const contexts = createMockContexts();
            const prompt = (0, contexts_1.getContextPrompt)(contexts.image);
            (0, bun_test_1.expect)(prompt).toBe('[Image: image/png]');
        });
        (0, bun_test_1.test)('should route to correct context class for AGENT_RULE type', () => {
            const contexts = createMockContexts();
            const prompt = (0, contexts_1.getContextPrompt)(contexts.agentRule);
            (0, bun_test_1.expect)(prompt).toContain('/project/CLAUDE.md');
            (0, bun_test_1.expect)(prompt).toContain('# Project Rules');
            (0, bun_test_1.expect)(prompt).toContain('Use TypeScript');
        });
        (0, bun_test_1.test)('should handle mixed context types in sequence', () => {
            const contexts = createMockContexts();
            const filePrompt = (0, contexts_1.getContextPrompt)(contexts.file);
            const highlightPrompt = (0, contexts_1.getContextPrompt)(contexts.highlight);
            const errorPrompt = (0, contexts_1.getContextPrompt)(contexts.error);
            (0, bun_test_1.expect)(filePrompt).toContain('```ts');
            (0, bun_test_1.expect)(highlightPrompt).toContain('#L1:L5');
            (0, bun_test_1.expect)(errorPrompt).toContain('<error>');
        });
        (0, bun_test_1.test)('should produce same result as direct context class usage', () => {
            const contexts = createMockContexts();
            // Compare generic function with direct class usage
            (0, bun_test_1.expect)((0, contexts_1.getContextPrompt)(contexts.file))
                .toBe(contexts_1.FileContext.getPrompt(contexts.file));
            (0, bun_test_1.expect)((0, contexts_1.getContextPrompt)(contexts.highlight))
                .toBe(contexts_1.HighlightContext.getPrompt(contexts.highlight));
            (0, bun_test_1.expect)((0, contexts_1.getContextPrompt)(contexts.error))
                .toBe(contexts_1.ErrorContext.getPrompt(contexts.error));
            (0, bun_test_1.expect)((0, contexts_1.getContextPrompt)(contexts.branch))
                .toBe(contexts_1.BranchContext.getPrompt(contexts.branch));
            (0, bun_test_1.expect)((0, contexts_1.getContextPrompt)(contexts.image))
                .toBe(contexts_1.ImageContext.getPrompt(contexts.image));
            (0, bun_test_1.expect)((0, contexts_1.getContextPrompt)(contexts.agentRule))
                .toBe(contexts_1.AgentRuleContext.getPrompt(contexts.agentRule));
        });
    });
    (0, bun_test_1.describe)('getContextLabel', () => {
        (0, bun_test_1.test)('should route to correct context class for FILE type', () => {
            const contexts = createMockContexts();
            const label = (0, contexts_1.getContextLabel)(contexts.file);
            (0, bun_test_1.expect)(label).toBe('test.ts');
        });
        (0, bun_test_1.test)('should route to correct context class for HIGHLIGHT type', () => {
            const contexts = createMockContexts();
            const label = (0, contexts_1.getContextLabel)(contexts.highlight);
            (0, bun_test_1.expect)(label).toBe('test.ts');
        });
        (0, bun_test_1.test)('should route to correct context class for ERROR type', () => {
            const contexts = createMockContexts();
            const label = (0, contexts_1.getContextLabel)(contexts.error);
            (0, bun_test_1.expect)(label).toBe('Runtime Error');
        });
        (0, bun_test_1.test)('should route to correct context class for BRANCH type', () => {
            const contexts = createMockContexts();
            const label = (0, contexts_1.getContextLabel)(contexts.branch);
            (0, bun_test_1.expect)(label).toBe('Feature Branch');
        });
        (0, bun_test_1.test)('should route to correct context class for IMAGE type', () => {
            const contexts = createMockContexts();
            const label = (0, contexts_1.getContextLabel)(contexts.image);
            (0, bun_test_1.expect)(label).toBe('screenshot.png');
        });
        (0, bun_test_1.test)('should route to correct context class for AGENT_RULE type', () => {
            const contexts = createMockContexts();
            const label = (0, contexts_1.getContextLabel)(contexts.agentRule);
            (0, bun_test_1.expect)(label).toBe('CLAUDE.md');
        });
        (0, bun_test_1.test)('should produce same result as direct context class usage', () => {
            const contexts = createMockContexts();
            // Compare generic function with direct class usage
            (0, bun_test_1.expect)((0, contexts_1.getContextLabel)(contexts.file))
                .toBe(contexts_1.FileContext.getLabel(contexts.file));
            (0, bun_test_1.expect)((0, contexts_1.getContextLabel)(contexts.highlight))
                .toBe(contexts_1.HighlightContext.getLabel(contexts.highlight));
            (0, bun_test_1.expect)((0, contexts_1.getContextLabel)(contexts.error))
                .toBe(contexts_1.ErrorContext.getLabel(contexts.error));
            (0, bun_test_1.expect)((0, contexts_1.getContextLabel)(contexts.branch))
                .toBe(contexts_1.BranchContext.getLabel(contexts.branch));
            (0, bun_test_1.expect)((0, contexts_1.getContextLabel)(contexts.image))
                .toBe(contexts_1.ImageContext.getLabel(contexts.image));
            (0, bun_test_1.expect)((0, contexts_1.getContextLabel)(contexts.agentRule))
                .toBe(contexts_1.AgentRuleContext.getLabel(contexts.agentRule));
        });
        (0, bun_test_1.test)('should handle fallback scenarios', () => {
            const contexts = createMockContexts();
            // Test with empty displayNames
            const fileWithoutLabel = { ...contexts.file, displayName: '' };
            const errorWithoutLabel = { ...contexts.error, displayName: '' };
            const imageWithoutLabel = { ...contexts.image, displayName: '' };
            (0, bun_test_1.expect)((0, contexts_1.getContextLabel)(fileWithoutLabel)).toBe('test.ts');
            (0, bun_test_1.expect)((0, contexts_1.getContextLabel)(errorWithoutLabel)).toBe('Error');
            (0, bun_test_1.expect)((0, contexts_1.getContextLabel)(imageWithoutLabel)).toBe('Image');
        });
    });
    (0, bun_test_1.describe)('getContextClass', () => {
        (0, bun_test_1.test)('should return FileContext for FILE type', () => {
            const contextClass = (0, contexts_1.getContextClass)(models_1.MessageContextType.FILE);
            (0, bun_test_1.expect)(contextClass).toBe(contexts_1.FileContext);
        });
        (0, bun_test_1.test)('should return HighlightContext for HIGHLIGHT type', () => {
            const contextClass = (0, contexts_1.getContextClass)(models_1.MessageContextType.HIGHLIGHT);
            (0, bun_test_1.expect)(contextClass).toBe(contexts_1.HighlightContext);
        });
        (0, bun_test_1.test)('should return ErrorContext for ERROR type', () => {
            const contextClass = (0, contexts_1.getContextClass)(models_1.MessageContextType.ERROR);
            (0, bun_test_1.expect)(contextClass).toBe(contexts_1.ErrorContext);
        });
        (0, bun_test_1.test)('should return BranchContext for BRANCH type', () => {
            const contextClass = (0, contexts_1.getContextClass)(models_1.MessageContextType.BRANCH);
            (0, bun_test_1.expect)(contextClass).toBe(contexts_1.BranchContext);
        });
        (0, bun_test_1.test)('should return ImageContext for IMAGE type', () => {
            const contextClass = (0, contexts_1.getContextClass)(models_1.MessageContextType.IMAGE);
            (0, bun_test_1.expect)(contextClass).toBe(contexts_1.ImageContext);
        });
        (0, bun_test_1.test)('should return AgentRuleContext for AGENT_RULE type', () => {
            const contextClass = (0, contexts_1.getContextClass)(models_1.MessageContextType.AGENT_RULE);
            (0, bun_test_1.expect)(contextClass).toBe(contexts_1.AgentRuleContext);
        });
        (0, bun_test_1.test)('should return classes with correct static properties', () => {
            const fileClass = (0, contexts_1.getContextClass)(models_1.MessageContextType.FILE);
            const highlightClass = (0, contexts_1.getContextClass)(models_1.MessageContextType.HIGHLIGHT);
            const errorClass = (0, contexts_1.getContextClass)(models_1.MessageContextType.ERROR);
            (0, bun_test_1.expect)(fileClass.contextType).toBe(models_1.MessageContextType.FILE);
            (0, bun_test_1.expect)(fileClass.displayName).toBe('File');
            (0, bun_test_1.expect)(fileClass.icon).toBeDefined();
            (0, bun_test_1.expect)(highlightClass.contextType).toBe(models_1.MessageContextType.HIGHLIGHT);
            (0, bun_test_1.expect)(highlightClass.displayName).toBe('Code Selection');
            (0, bun_test_1.expect)(highlightClass.icon).toBeDefined();
            (0, bun_test_1.expect)(errorClass.contextType).toBe(models_1.MessageContextType.ERROR);
            (0, bun_test_1.expect)(errorClass.displayName).toBe('Error');
            (0, bun_test_1.expect)(errorClass.icon).toBeDefined();
        });
    });
    (0, bun_test_1.describe)('context class exports', () => {
        (0, bun_test_1.test)('should export all context classes', () => {
            (0, bun_test_1.expect)(contexts_1.FileContext).toBeDefined();
            (0, bun_test_1.expect)(contexts_1.HighlightContext).toBeDefined();
            (0, bun_test_1.expect)(contexts_1.ErrorContext).toBeDefined();
            (0, bun_test_1.expect)(contexts_1.BranchContext).toBeDefined();
            (0, bun_test_1.expect)(contexts_1.ImageContext).toBeDefined();
            (0, bun_test_1.expect)(contexts_1.AgentRuleContext).toBeDefined();
        });
        (0, bun_test_1.test)('should have correct context types on exported classes', () => {
            (0, bun_test_1.expect)(contexts_1.FileContext.contextType).toBe(models_1.MessageContextType.FILE);
            (0, bun_test_1.expect)(contexts_1.HighlightContext.contextType).toBe(models_1.MessageContextType.HIGHLIGHT);
            (0, bun_test_1.expect)(contexts_1.ErrorContext.contextType).toBe(models_1.MessageContextType.ERROR);
            (0, bun_test_1.expect)(contexts_1.BranchContext.contextType).toBe(models_1.MessageContextType.BRANCH);
            (0, bun_test_1.expect)(contexts_1.ImageContext.contextType).toBe(models_1.MessageContextType.IMAGE);
            (0, bun_test_1.expect)(contexts_1.AgentRuleContext.contextType).toBe(models_1.MessageContextType.AGENT_RULE);
        });
    });
    (0, bun_test_1.describe)('integration scenarios', () => {
        (0, bun_test_1.test)('should handle context type switching in loop', () => {
            const contexts = createMockContexts();
            const contextArray = [
                contexts.file,
                contexts.highlight,
                contexts.error,
                contexts.branch,
                contexts.image,
                contexts.agentRule,
            ];
            const prompts = contextArray.map(context => (0, contexts_1.getContextPrompt)(context));
            const labels = contextArray.map(context => (0, contexts_1.getContextLabel)(context));
            (0, bun_test_1.expect)(prompts).toHaveLength(6);
            (0, bun_test_1.expect)(labels).toHaveLength(6);
            (0, bun_test_1.expect)(prompts[0]).toContain('```ts');
            (0, bun_test_1.expect)(prompts[1]).toContain('#L1:L5');
            (0, bun_test_1.expect)(prompts[2]).toContain('<error>');
            (0, bun_test_1.expect)(prompts[3]).toContain('Branch: test-branch');
            (0, bun_test_1.expect)(prompts[4]).toBe('[Image: image/png]');
            (0, bun_test_1.expect)(prompts[5]).toContain('# Project Rules');
        });
        (0, bun_test_1.test)('should maintain context type consistency', () => {
            const contexts = createMockContexts();
            Object.entries(contexts).forEach(([key, context]) => {
                const contextClass = (0, contexts_1.getContextClass)(context.type);
                const genericPrompt = (0, contexts_1.getContextPrompt)(context);
                const directPrompt = contextClass.getPrompt(context);
                (0, bun_test_1.expect)(genericPrompt).toBe(directPrompt);
            });
        });
        (0, bun_test_1.test)('should handle malformed contexts gracefully', () => {
            // Test with minimal context objects
            const minimalFile = {
                type: models_1.MessageContextType.FILE,
                path: 'test.ts',
                content: '',
                displayName: 'test.ts',
                branchId: '',
            };
            (0, bun_test_1.expect)(() => (0, contexts_1.getContextPrompt)(minimalFile)).not.toThrow();
            (0, bun_test_1.expect)(() => (0, contexts_1.getContextLabel)(minimalFile)).not.toThrow();
            (0, bun_test_1.expect)(() => (0, contexts_1.getContextClass)(minimalFile.type)).not.toThrow();
        });
        (0, bun_test_1.test)('should work with actual message context union type', () => {
            const contexts = createMockContexts();
            // Test that the functions work with the union type
            const messageContexts = [
                contexts.file,
                contexts.highlight,
                contexts.error,
                contexts.branch,
                contexts.image,
                contexts.agentRule,
            ];
            messageContexts.forEach(context => {
                (0, bun_test_1.expect)(() => (0, contexts_1.getContextPrompt)(context)).not.toThrow();
                (0, bun_test_1.expect)(() => (0, contexts_1.getContextLabel)(context)).not.toThrow();
                (0, bun_test_1.expect)(() => (0, contexts_1.getContextClass)(context.type)).not.toThrow();
            });
        });
    });
    (0, bun_test_1.describe)('edge cases', () => {
        (0, bun_test_1.test)('should handle context with missing optional properties', () => {
            const minimalContexts = {
                file: {
                    type: models_1.MessageContextType.FILE,
                    path: 'test.js',
                    content: 'test',
                    displayName: '',
                    branchId: '',
                },
                error: {
                    type: models_1.MessageContextType.ERROR,
                    content: 'Error message',
                    displayName: '',
                    branchId: '',
                },
            };
            (0, bun_test_1.expect)((0, contexts_1.getContextPrompt)(minimalContexts.file)).toContain('test.js');
            (0, bun_test_1.expect)((0, contexts_1.getContextLabel)(minimalContexts.file)).toBe('test.js');
            (0, bun_test_1.expect)((0, contexts_1.getContextPrompt)(minimalContexts.error)).toContain('Error message');
            (0, bun_test_1.expect)((0, contexts_1.getContextLabel)(minimalContexts.error)).toBe('Error');
        });
        (0, bun_test_1.test)('should handle context switching performance', () => {
            const contexts = createMockContexts();
            const contextTypes = Object.values(models_1.MessageContextType);
            // Test multiple rapid context type switches
            const start = Date.now();
            for (let i = 0; i < 100; i++) {
                contextTypes.forEach(type => {
                    (0, contexts_1.getContextClass)(type);
                });
            }
            const end = Date.now();
            // Should complete quickly (arbitrary threshold)
            (0, bun_test_1.expect)(end - start).toBeLessThan(100);
        });
    });
});
//# sourceMappingURL=index.test.js.map