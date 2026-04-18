"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("@onlook/models");
const bun_test_1 = require("bun:test");
const highlight_1 = require("../../src/contexts/classes/highlight");
(0, bun_test_1.describe)('HighlightContext', () => {
    const createMockHighlightContext = (overrides = {}) => ({
        type: models_1.MessageContextType.HIGHLIGHT,
        path: 'src/components/Button.tsx',
        start: 5,
        end: 10,
        content: 'const handleClick = () => {\n  console.log("clicked");\n};',
        displayName: 'Button.tsx',
        branchId: 'feature-branch-456',
        ...overrides,
    });
    (0, bun_test_1.describe)('static properties', () => {
        (0, bun_test_1.test)('should have correct context type', () => {
            (0, bun_test_1.expect)(highlight_1.HighlightContext.contextType).toBe(models_1.MessageContextType.HIGHLIGHT);
        });
        (0, bun_test_1.test)('should have correct display name', () => {
            (0, bun_test_1.expect)(highlight_1.HighlightContext.displayName).toBe('Code Selection');
        });
        (0, bun_test_1.test)('should have an icon', () => {
            (0, bun_test_1.expect)(highlight_1.HighlightContext.icon).toBeDefined();
        });
    });
    (0, bun_test_1.describe)('getPrompt', () => {
        (0, bun_test_1.test)('should generate correct prompt format', () => {
            const context = createMockHighlightContext();
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<path>src/components/Button.tsx#L5:L10</path>');
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: "feature-branch-456"</branch>');
            (0, bun_test_1.expect)(prompt).toContain('```');
            (0, bun_test_1.expect)(prompt).toContain('const handleClick = () => {');
            (0, bun_test_1.expect)(prompt).toContain('console.log("clicked");');
        });
        (0, bun_test_1.test)('should handle single line highlight', () => {
            const context = createMockHighlightContext({
                start: 3,
                end: 3,
                content: 'export const Button = () => <button>Click</button>;',
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('#L3:L3');
            (0, bun_test_1.expect)(prompt).toContain('export const Button = () => <button>Click</button>;');
        });
        (0, bun_test_1.test)('should handle large line numbers', () => {
            const context = createMockHighlightContext({
                start: 1000,
                end: 1005,
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('#L1000:L1005');
        });
        (0, bun_test_1.test)('should handle empty content', () => {
            const context = createMockHighlightContext({
                content: '',
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<path>src/components/Button.tsx#L5:L10</path>');
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: "feature-branch-456"</branch>');
            (0, bun_test_1.expect)(prompt).toContain('```');
        });
        (0, bun_test_1.test)('should handle content with special characters', () => {
            const context = createMockHighlightContext({
                content: 'const regex = /[a-z]+/g;\nconst html = "<div>Hello & goodbye</div>";',
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('/[a-z]+/g');
            (0, bun_test_1.expect)(prompt).toContain('<div>Hello & goodbye</div>');
        });
        (0, bun_test_1.test)('should handle path with special characters', () => {
            const context = createMockHighlightContext({
                path: 'src/components/Button & Icon.tsx',
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<path>src/components/Button & Icon.tsx#L5:L10</path>');
        });
        (0, bun_test_1.test)('should handle branch ID with special characters', () => {
            const context = createMockHighlightContext({
                branchId: 'feature/user-auth-&-validation',
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: "feature/user-auth-&-validation"</branch>');
        });
        (0, bun_test_1.test)('should handle zero line numbers', () => {
            const context = createMockHighlightContext({
                start: 0,
                end: 0,
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('#L0:L0');
        });
    });
    (0, bun_test_1.describe)('getLabel', () => {
        (0, bun_test_1.test)('should use displayName when available', () => {
            const context = createMockHighlightContext({
                displayName: 'Custom Button Component',
            });
            const label = highlight_1.HighlightContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Custom Button Component');
        });
        (0, bun_test_1.test)('should extract filename from path when no displayName', () => {
            const context = createMockHighlightContext({
                displayName: '',
                path: 'src/utils/helpers.ts',
            });
            const label = highlight_1.HighlightContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('helpers.ts');
        });
        (0, bun_test_1.test)('should fallback to "Code Selection" for empty path', () => {
            const context = createMockHighlightContext({
                displayName: '',
                path: '',
            });
            const label = highlight_1.HighlightContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Code Selection');
        });
        (0, bun_test_1.test)('should fallback to "Code Selection" for path ending with slash', () => {
            const context = createMockHighlightContext({
                displayName: '',
                path: 'src/components/',
            });
            const label = highlight_1.HighlightContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Code Selection');
        });
        (0, bun_test_1.test)('should handle undefined displayName', () => {
            const context = createMockHighlightContext();
            delete context.displayName;
            const label = highlight_1.HighlightContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Button.tsx');
        });
    });
    (0, bun_test_1.describe)('getHighlightsContent', () => {
        (0, bun_test_1.test)('should generate content for single highlight', () => {
            const highlights = [createMockHighlightContext()];
            const content = highlight_1.HighlightContext.getHighlightsContent('src/components/Button.tsx', highlights, 'feature-branch-456');
            (0, bun_test_1.expect)(content).toContain('I am looking at this specific part of the file');
            (0, bun_test_1.expect)(content).toContain('<highlight>');
            (0, bun_test_1.expect)(content).toContain('<path>src/components/Button.tsx#L5:L10</path>');
            (0, bun_test_1.expect)(content).toContain('const handleClick = () => {');
        });
        (0, bun_test_1.test)('should generate content for multiple highlights', () => {
            const highlights = [
                createMockHighlightContext({
                    start: 1,
                    end: 3,
                    content: 'import React from "react";',
                }),
                createMockHighlightContext({
                    start: 10,
                    end: 15,
                    content: 'export default Button;',
                }),
            ];
            const content = highlight_1.HighlightContext.getHighlightsContent('src/components/Button.tsx', highlights, 'feature-branch-456');
            (0, bun_test_1.expect)(content).toContain('<highlight-1>');
            (0, bun_test_1.expect)(content).toContain('<highlight-2>');
            (0, bun_test_1.expect)(content).toContain('import React from "react"');
            (0, bun_test_1.expect)(content).toContain('export default Button');
        });
        (0, bun_test_1.test)('should filter highlights by file path', () => {
            const highlights = [
                createMockHighlightContext({
                    path: 'src/components/Button.tsx',
                    content: 'button content',
                }),
                createMockHighlightContext({
                    path: 'src/utils/helpers.ts',
                    content: 'helper content',
                }),
            ];
            const content = highlight_1.HighlightContext.getHighlightsContent('src/components/Button.tsx', highlights, 'feature-branch-456');
            (0, bun_test_1.expect)(content).toContain('button content');
            (0, bun_test_1.expect)(content).not.toContain('helper content');
        });
        (0, bun_test_1.test)('should return empty string for no matching highlights', () => {
            const highlights = [
                createMockHighlightContext({
                    path: 'src/other/file.ts',
                }),
            ];
            const content = highlight_1.HighlightContext.getHighlightsContent('src/components/Button.tsx', highlights, 'feature-branch-456');
            (0, bun_test_1.expect)(content).toBe('');
        });
        (0, bun_test_1.test)('should return empty string for empty highlights array', () => {
            const content = highlight_1.HighlightContext.getHighlightsContent('src/components/Button.tsx', [], 'feature-branch-456');
            (0, bun_test_1.expect)(content).toBe('');
        });
        (0, bun_test_1.test)('should handle highlights with same path but different cases', () => {
            const highlights = [
                createMockHighlightContext({
                    path: 'src/Components/Button.tsx',
                }),
            ];
            const content = highlight_1.HighlightContext.getHighlightsContent('src/components/Button.tsx', highlights, 'feature-branch-456');
            (0, bun_test_1.expect)(content).toBe('');
        });
        (0, bun_test_1.test)('should handle very long file paths', () => {
            const longPath = 'src/very/deep/nested/folder/structure/Component.tsx';
            const highlights = [
                createMockHighlightContext({
                    path: longPath,
                }),
            ];
            const content = highlight_1.HighlightContext.getHighlightsContent(longPath, highlights, 'feature-branch-456');
            (0, bun_test_1.expect)(content).toContain('I am looking at this specific part');
            (0, bun_test_1.expect)(content).toContain(longPath);
        });
    });
    (0, bun_test_1.describe)('edge cases', () => {
        (0, bun_test_1.test)('should handle negative line numbers', () => {
            const context = createMockHighlightContext({
                start: -1,
                end: -5,
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('#L-1:L-5');
        });
        (0, bun_test_1.test)('should handle start > end line numbers', () => {
            const context = createMockHighlightContext({
                start: 10,
                end: 5,
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('#L10:L5');
        });
        (0, bun_test_1.test)('should handle unicode characters in content', () => {
            const context = createMockHighlightContext({
                content: 'const greeting = "Hello 世界! 🌍";',
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Hello 世界! 🌍');
        });
        (0, bun_test_1.test)('should handle very long content', () => {
            const longContent = 'a'.repeat(10000);
            const context = createMockHighlightContext({
                content: longContent,
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain(longContent);
        });
        (0, bun_test_1.test)('should handle empty branch ID', () => {
            const context = createMockHighlightContext({
                branchId: '',
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: ""</branch>');
        });
        (0, bun_test_1.test)('should handle whitespace-only content', () => {
            const context = createMockHighlightContext({
                content: '   \n\t  \n   ',
            });
            const prompt = highlight_1.HighlightContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('   \n\t  \n   ');
        });
    });
});
//# sourceMappingURL=highlight-context.test.js.map