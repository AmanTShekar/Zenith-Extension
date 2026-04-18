"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("@onlook/models");
const bun_test_1 = require("bun:test");
const error_1 = require("../../src/contexts/classes/error");
(0, bun_test_1.describe)('ErrorContext', () => {
    const createMockErrorContext = (overrides = {}) => ({
        type: models_1.MessageContextType.ERROR,
        content: 'TypeError: Cannot read property "length" of undefined\n    at Button.tsx:15:20\n    at render',
        displayName: 'Runtime Error',
        branchId: 'main-branch-123',
        ...overrides,
    });
    (0, bun_test_1.describe)('static properties', () => {
        (0, bun_test_1.test)('should have correct context type', () => {
            (0, bun_test_1.expect)(error_1.ErrorContext.contextType).toBe(models_1.MessageContextType.ERROR);
        });
        (0, bun_test_1.test)('should have correct display name', () => {
            (0, bun_test_1.expect)(error_1.ErrorContext.displayName).toBe('Error');
        });
        (0, bun_test_1.test)('should have an icon', () => {
            (0, bun_test_1.expect)(error_1.ErrorContext.icon).toBeDefined();
        });
    });
    (0, bun_test_1.describe)('getPrompt', () => {
        (0, bun_test_1.test)('should generate correct prompt format', () => {
            const context = createMockErrorContext();
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: "main-branch-123"</branch>');
            (0, bun_test_1.expect)(prompt).toContain('<error>');
            (0, bun_test_1.expect)(prompt).toContain('TypeError: Cannot read property "length" of undefined');
            (0, bun_test_1.expect)(prompt).toContain('at Button.tsx:15:20');
            (0, bun_test_1.expect)(prompt).toContain('</error>');
        });
        (0, bun_test_1.test)('should handle single line error', () => {
            const context = createMockErrorContext({
                content: 'SyntaxError: Unexpected token',
            });
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<error>SyntaxError: Unexpected token</error>');
        });
        (0, bun_test_1.test)('should handle empty error content', () => {
            const context = createMockErrorContext({
                content: '',
            });
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: "main-branch-123"</branch>');
            (0, bun_test_1.expect)(prompt).toContain('<error></error>');
        });
        (0, bun_test_1.test)('should handle error with special characters', () => {
            const context = createMockErrorContext({
                content: 'Error: Invalid character "&" in component <Button>',
            });
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Invalid character "&" in component <Button>');
        });
        (0, bun_test_1.test)('should handle multiline stack trace', () => {
            const context = createMockErrorContext({
                content: `Error: Network request failed
    at fetch (http://localhost:3000/api/data:1:1)
    at async getData (/src/utils/api.ts:25:5)
    at async Component (/src/components/DataDisplay.tsx:12:3)`,
            });
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Network request failed');
            (0, bun_test_1.expect)(prompt).toContain('at fetch (http://localhost:3000/api/data:1:1)');
            (0, bun_test_1.expect)(prompt).toContain('at async getData');
        });
        (0, bun_test_1.test)('should handle empty branch ID', () => {
            const context = createMockErrorContext({
                branchId: '',
            });
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: ""</branch>');
        });
        (0, bun_test_1.test)('should handle branch ID with special characters', () => {
            const context = createMockErrorContext({
                branchId: 'feature/fix-bug-&-improve',
            });
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<branch>id: "feature/fix-bug-&-improve"</branch>');
        });
        (0, bun_test_1.test)('should handle very long error messages', () => {
            const longError = 'Error: ' + 'Very long error message. '.repeat(100);
            const context = createMockErrorContext({
                content: longError,
            });
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain(longError);
        });
    });
    (0, bun_test_1.describe)('getLabel', () => {
        (0, bun_test_1.test)('should use displayName when available', () => {
            const context = createMockErrorContext({
                displayName: 'Build Error',
            });
            const label = error_1.ErrorContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Build Error');
        });
        (0, bun_test_1.test)('should fallback to "Error" when no displayName', () => {
            const context = createMockErrorContext({
                displayName: '',
            });
            const label = error_1.ErrorContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Error');
        });
        (0, bun_test_1.test)('should fallback to "Error" when displayName is undefined', () => {
            const context = createMockErrorContext();
            delete context.displayName;
            const label = error_1.ErrorContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Error');
        });
        (0, bun_test_1.test)('should handle whitespace-only displayName', () => {
            const context = createMockErrorContext({
                displayName: '   \t\n   ',
            });
            const label = error_1.ErrorContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('   \t\n   ');
        });
        (0, bun_test_1.test)('should handle displayName with special characters', () => {
            const context = createMockErrorContext({
                displayName: 'Error: Build & Deploy Failed',
            });
            const label = error_1.ErrorContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Error: Build & Deploy Failed');
        });
    });
    (0, bun_test_1.describe)('getErrorsContent', () => {
        (0, bun_test_1.test)('should generate content for single error', () => {
            const errors = [createMockErrorContext()];
            const content = error_1.ErrorContext.getErrorsContent(errors);
            (0, bun_test_1.expect)(content).toContain('You are helping debug a Next.js React app');
            (0, bun_test_1.expect)(content).toContain('This project uses Bun as the package manager');
            (0, bun_test_1.expect)(content).toContain('<errors>');
            (0, bun_test_1.expect)(content).toContain('<branch>id: "main-branch-123"</branch>');
            (0, bun_test_1.expect)(content).toContain('TypeError: Cannot read property "length"');
            (0, bun_test_1.expect)(content).toContain('</errors>');
        });
        (0, bun_test_1.test)('should generate content for multiple errors', () => {
            const errors = [
                createMockErrorContext({
                    content: 'Error 1: Component not found',
                    branchId: 'branch-1',
                }),
                createMockErrorContext({
                    content: 'Error 2: Missing dependency',
                    branchId: 'branch-2',
                }),
            ];
            const content = error_1.ErrorContext.getErrorsContent(errors);
            (0, bun_test_1.expect)(content).toContain('Error 1: Component not found');
            (0, bun_test_1.expect)(content).toContain('Error 2: Missing dependency');
            (0, bun_test_1.expect)(content).toContain('<branch>id: "branch-1"</branch>');
            (0, bun_test_1.expect)(content).toContain('<branch>id: "branch-2"</branch>');
        });
        (0, bun_test_1.test)('should return empty string for empty errors array', () => {
            const content = error_1.ErrorContext.getErrorsContent([]);
            (0, bun_test_1.expect)(content).toBe('');
        });
        (0, bun_test_1.test)('should include Bun-specific instructions', () => {
            const errors = [createMockErrorContext()];
            const content = error_1.ErrorContext.getErrorsContent(errors);
            (0, bun_test_1.expect)(content).toContain('Use "bun install" instead of "npm install"');
            (0, bun_test_1.expect)(content).toContain('Use "bun add" instead of "npm install <package>"');
            (0, bun_test_1.expect)(content).toContain('Use "bun run" instead of "npm run"');
            (0, bun_test_1.expect)(content).toContain('Use "bunx" instead of "npx"');
        });
        (0, bun_test_1.test)('should include Next.js debugging guidance', () => {
            const errors = [createMockErrorContext()];
            const content = error_1.ErrorContext.getErrorsContent(errors);
            (0, bun_test_1.expect)(content).toContain('Missing dependencies');
            (0, bun_test_1.expect)(content).toContain('Missing closing tags in JSX/TSX files');
            (0, bun_test_1.expect)(content).toContain('Analyze all the messages before suggesting solutions');
        });
        (0, bun_test_1.test)('should warn against suggesting dev command', () => {
            const errors = [createMockErrorContext()];
            const content = error_1.ErrorContext.getErrorsContent(errors);
            (0, bun_test_1.expect)(content).toContain('NEVER SUGGEST THE "bun run dev" command');
        });
        (0, bun_test_1.test)('should handle errors with empty content', () => {
            const errors = [
                createMockErrorContext({ content: '' }),
                createMockErrorContext({ content: 'Valid error message' }),
            ];
            const content = error_1.ErrorContext.getErrorsContent(errors);
            (0, bun_test_1.expect)(content).toContain('<error></error>');
            (0, bun_test_1.expect)(content).toContain('<error>Valid error message</error>');
        });
        (0, bun_test_1.test)('should preserve error order', () => {
            const errors = [
                createMockErrorContext({ content: 'First error' }),
                createMockErrorContext({ content: 'Second error' }),
                createMockErrorContext({ content: 'Third error' }),
            ];
            const content = error_1.ErrorContext.getErrorsContent(errors);
            const firstIndex = content.indexOf('First error');
            const secondIndex = content.indexOf('Second error');
            const thirdIndex = content.indexOf('Third error');
            (0, bun_test_1.expect)(firstIndex).toBeLessThan(secondIndex);
            (0, bun_test_1.expect)(secondIndex).toBeLessThan(thirdIndex);
        });
    });
    (0, bun_test_1.describe)('edge cases', () => {
        (0, bun_test_1.test)('should handle unicode characters in error content', () => {
            const context = createMockErrorContext({
                content: 'Error: Invalid character "🚫" in filename',
            });
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Invalid character "🚫" in filename');
        });
        (0, bun_test_1.test)('should handle XML/HTML in error content', () => {
            const context = createMockErrorContext({
                content: 'Error: Unclosed tag <div> found at line 10',
            });
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Unclosed tag <div> found at line 10');
        });
        (0, bun_test_1.test)('should handle null or undefined properties gracefully', () => {
            const context = {
                type: models_1.MessageContextType.ERROR,
                content: 'Basic error',
                displayName: null,
                branchId: undefined,
            };
            (0, bun_test_1.expect)(() => error_1.ErrorContext.getPrompt(context)).not.toThrow();
            (0, bun_test_1.expect)(() => error_1.ErrorContext.getLabel(context)).not.toThrow();
        });
        (0, bun_test_1.test)('should handle very deep stack traces', () => {
            const deepTrace = Array(50).fill(0).map((_, i) => `    at function${i} (/path/to/file${i}.ts:${i + 1}:5)`).join('\n');
            const context = createMockErrorContext({
                content: `Error: Deep stack\n${deepTrace}`,
            });
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('Error: Deep stack');
            (0, bun_test_1.expect)(prompt).toContain('at function0');
            (0, bun_test_1.expect)(prompt).toContain('at function49');
        });
        (0, bun_test_1.test)('should handle errors with ANSI color codes', () => {
            const context = createMockErrorContext({
                content: '\x1b[31mError: Build failed\x1b[0m\n\x1b[33mWarning: Deprecated\x1b[0m',
            });
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('\x1b[31mError: Build failed\x1b[0m');
            (0, bun_test_1.expect)(prompt).toContain('\x1b[33mWarning: Deprecated\x1b[0m');
        });
        (0, bun_test_1.test)('should handle errors with file paths containing spaces', () => {
            const context = createMockErrorContext({
                content: 'Error at "/path with spaces/My File.tsx":10:5',
            });
            const prompt = error_1.ErrorContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('"/path with spaces/My File.tsx":10:5');
        });
    });
});
//# sourceMappingURL=error-context.test.js.map