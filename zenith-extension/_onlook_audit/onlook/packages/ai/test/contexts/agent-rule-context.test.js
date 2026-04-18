"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("@onlook/models");
const bun_test_1 = require("bun:test");
const agent_rule_1 = require("../../src/contexts/classes/agent-rule");
(0, bun_test_1.describe)('AgentRuleContext', () => {
    const createMockAgentRuleContext = (overrides = {}) => ({
        type: models_1.MessageContextType.AGENT_RULE,
        content: `## Project Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint rules strictly
- Use Prettier for formatting

### Architecture
- Follow MVC pattern
- Use dependency injection
- Keep components small and focused`,
        displayName: 'CLAUDE.md',
        path: '/project/CLAUDE.md',
        ...overrides,
    });
    (0, bun_test_1.describe)('static properties', () => {
        (0, bun_test_1.test)('should have correct context type', () => {
            (0, bun_test_1.expect)(agent_rule_1.AgentRuleContext.contextType).toBe(models_1.MessageContextType.AGENT_RULE);
        });
        (0, bun_test_1.test)('should have correct display name', () => {
            (0, bun_test_1.expect)(agent_rule_1.AgentRuleContext.displayName).toBe('Agent Rule');
        });
        (0, bun_test_1.test)('should have an icon', () => {
            (0, bun_test_1.expect)(agent_rule_1.AgentRuleContext.icon).toBeDefined();
        });
    });
    (0, bun_test_1.describe)('getPrompt', () => {
        (0, bun_test_1.test)('should generate correct prompt format', () => {
            const context = createMockAgentRuleContext();
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('/project/CLAUDE.md');
            (0, bun_test_1.expect)(prompt).toContain('## Project Guidelines');
            (0, bun_test_1.expect)(prompt).toContain('### Code Style');
            (0, bun_test_1.expect)(prompt).toContain('- Use TypeScript for all new code');
            (0, bun_test_1.expect)(prompt).toContain('### Architecture');
        });
        (0, bun_test_1.test)('should handle simple rule file', () => {
            const context = createMockAgentRuleContext({
                path: 'rules.txt',
                content: 'Always use semicolons in JavaScript',
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('rules.txt\nAlways use semicolons in JavaScript');
        });
        (0, bun_test_1.test)('should handle empty content', () => {
            const context = createMockAgentRuleContext({
                content: '',
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('/project/CLAUDE.md');
            (0, bun_test_1.expect)(prompt).toContain('\n');
        });
        (0, bun_test_1.test)('should handle multiline markdown content', () => {
            const context = createMockAgentRuleContext({
                content: `# Agent Rules

## General Guidelines
1. Always validate inputs
2. Use proper error handling
3. Write comprehensive tests

## Specific Rules
- No console.log statements in production
- Use environment variables for configuration
- Follow the existing naming conventions

### Testing Requirements
- Unit tests for all functions
- Integration tests for API endpoints
- E2E tests for critical user flows`,
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('# Agent Rules');
            (0, bun_test_1.expect)(prompt).toContain('## General Guidelines');
            (0, bun_test_1.expect)(prompt).toContain('1. Always validate inputs');
            (0, bun_test_1.expect)(prompt).toContain('### Testing Requirements');
        });
        (0, bun_test_1.test)('should handle path with special characters', () => {
            const context = createMockAgentRuleContext({
                path: '/project/rules & guidelines.md',
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('/project/rules & guidelines.md');
        });
        (0, bun_test_1.test)('should handle very long file paths', () => {
            const longPath = '/very/deep/nested/folder/structure/with/many/levels/agent-rules-and-guidelines.md';
            const context = createMockAgentRuleContext({
                path: longPath,
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain(longPath);
        });
        (0, bun_test_1.test)('should handle content with code blocks', () => {
            const context = createMockAgentRuleContext({
                content: `# Code Examples

## TypeScript Interface
\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}
\`\`\`

## React Component
\`\`\`jsx
const UserCard = ({ user }) => (
  <div className="user-card">
    <h2>{user.name}</h2>
    <p>{user.email}</p>
  </div>
);
\`\`\``,
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('```typescript');
            (0, bun_test_1.expect)(prompt).toContain('interface User {');
            (0, bun_test_1.expect)(prompt).toContain('```jsx');
            (0, bun_test_1.expect)(prompt).toContain('const UserCard');
        });
        (0, bun_test_1.test)('should handle content with XML/HTML', () => {
            const context = createMockAgentRuleContext({
                content: 'Use <component> tags for React components and <div> for containers',
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('<component>');
            (0, bun_test_1.expect)(prompt).toContain('<div>');
        });
    });
    (0, bun_test_1.describe)('getLabel', () => {
        (0, bun_test_1.test)('should use displayName when available', () => {
            const context = createMockAgentRuleContext({
                displayName: 'Project Rules',
            });
            const label = agent_rule_1.AgentRuleContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Project Rules');
        });
        (0, bun_test_1.test)('should fallback to path when no displayName', () => {
            const context = createMockAgentRuleContext({
                displayName: '',
                path: '/project/guidelines.md',
            });
            const label = agent_rule_1.AgentRuleContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('/project/guidelines.md');
        });
        (0, bun_test_1.test)('should fallback to path when displayName is undefined', () => {
            const context = createMockAgentRuleContext();
            delete context.displayName;
            const label = agent_rule_1.AgentRuleContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('/project/CLAUDE.md');
        });
        (0, bun_test_1.test)('should handle path as filename only', () => {
            const context = createMockAgentRuleContext({
                displayName: '',
                path: 'README.md',
            });
            const label = agent_rule_1.AgentRuleContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('README.md');
        });
        (0, bun_test_1.test)('should handle path with extension', () => {
            const context = createMockAgentRuleContext({
                displayName: '',
                path: '/docs/agent-instructions.txt',
            });
            const label = agent_rule_1.AgentRuleContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('/docs/agent-instructions.txt');
        });
        (0, bun_test_1.test)('should handle empty path and displayName', () => {
            const context = createMockAgentRuleContext({
                displayName: '',
                path: '',
            });
            const label = agent_rule_1.AgentRuleContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('');
        });
        (0, bun_test_1.test)('should handle whitespace-only displayName', () => {
            const context = createMockAgentRuleContext({
                displayName: '   \t\n   ',
            });
            const label = agent_rule_1.AgentRuleContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('   \t\n   ');
        });
    });
    (0, bun_test_1.describe)('getAgentRulesContent', () => {
        (0, bun_test_1.test)('should generate content for single rule', () => {
            const rules = [createMockAgentRuleContext()];
            const content = agent_rule_1.AgentRuleContext.getAgentRulesContent(rules);
            (0, bun_test_1.expect)(content).toContain('These are user provided rules for the project');
            (0, bun_test_1.expect)(content).toContain('<agent-rules>');
            (0, bun_test_1.expect)(content).toContain('/project/CLAUDE.md');
            (0, bun_test_1.expect)(content).toContain('## Project Guidelines');
            (0, bun_test_1.expect)(content).toContain('</agent-rules>');
        });
        (0, bun_test_1.test)('should generate content for multiple rules', () => {
            const rules = [
                createMockAgentRuleContext({
                    path: 'CLAUDE.md',
                    content: 'Use TypeScript exclusively',
                }),
                createMockAgentRuleContext({
                    path: 'STYLE.md',
                    content: 'Follow Prettier formatting',
                }),
                createMockAgentRuleContext({
                    path: 'TESTING.md',
                    content: 'Write comprehensive unit tests',
                }),
            ];
            const content = agent_rule_1.AgentRuleContext.getAgentRulesContent(rules);
            (0, bun_test_1.expect)(content).toContain('CLAUDE.md');
            (0, bun_test_1.expect)(content).toContain('Use TypeScript exclusively');
            (0, bun_test_1.expect)(content).toContain('STYLE.md');
            (0, bun_test_1.expect)(content).toContain('Follow Prettier formatting');
            (0, bun_test_1.expect)(content).toContain('TESTING.md');
            (0, bun_test_1.expect)(content).toContain('Write comprehensive unit tests');
        });
        (0, bun_test_1.test)('should handle empty rules array', () => {
            const content = agent_rule_1.AgentRuleContext.getAgentRulesContent([]);
            (0, bun_test_1.expect)(content).toContain('These are user provided rules for the project');
            (0, bun_test_1.expect)(content).toContain('<agent-rules>');
            (0, bun_test_1.expect)(content).toContain('</agent-rules>');
        });
        (0, bun_test_1.test)('should preserve rule order', () => {
            const rules = [
                createMockAgentRuleContext({
                    path: 'first.md',
                    content: 'First rule',
                }),
                createMockAgentRuleContext({
                    path: 'second.md',
                    content: 'Second rule',
                }),
                createMockAgentRuleContext({
                    path: 'third.md',
                    content: 'Third rule',
                }),
            ];
            const content = agent_rule_1.AgentRuleContext.getAgentRulesContent(rules);
            const firstIndex = content.indexOf('First rule');
            const secondIndex = content.indexOf('Second rule');
            const thirdIndex = content.indexOf('Third rule');
            (0, bun_test_1.expect)(firstIndex).toBeLessThan(secondIndex);
            (0, bun_test_1.expect)(secondIndex).toBeLessThan(thirdIndex);
        });
        (0, bun_test_1.test)('should handle rules with empty content', () => {
            const rules = [
                createMockAgentRuleContext({
                    path: 'empty.md',
                    content: '',
                }),
                createMockAgentRuleContext({
                    path: 'filled.md',
                    content: 'Some content',
                }),
            ];
            const content = agent_rule_1.AgentRuleContext.getAgentRulesContent(rules);
            (0, bun_test_1.expect)(content).toContain('empty.md');
            (0, bun_test_1.expect)(content).toContain('filled.md');
            (0, bun_test_1.expect)(content).toContain('Some content');
        });
        (0, bun_test_1.test)('should handle rules with very long content', () => {
            const longContent = 'This is a very long rule content. '.repeat(100);
            const rules = [
                createMockAgentRuleContext({
                    content: longContent,
                }),
            ];
            const content = agent_rule_1.AgentRuleContext.getAgentRulesContent(rules);
            (0, bun_test_1.expect)(content).toContain(longContent);
        });
        (0, bun_test_1.test)('should include prefix for context', () => {
            const rules = [createMockAgentRuleContext()];
            const content = agent_rule_1.AgentRuleContext.getAgentRulesContent(rules);
            (0, bun_test_1.expect)(content).toContain('These are user provided rules for the project');
        });
        (0, bun_test_1.test)('should properly wrap content in XML tags', () => {
            const rules = [createMockAgentRuleContext()];
            const content = agent_rule_1.AgentRuleContext.getAgentRulesContent(rules);
            (0, bun_test_1.expect)(content).toMatch(/<agent-rules>[\s\S]*<\/agent-rules>$/);
        });
    });
    (0, bun_test_1.describe)('edge cases', () => {
        (0, bun_test_1.test)('should handle null or undefined properties gracefully', () => {
            const context = {
                type: models_1.MessageContextType.AGENT_RULE,
                content: 'Basic rule',
                displayName: null,
                path: undefined,
            };
            (0, bun_test_1.expect)(() => agent_rule_1.AgentRuleContext.getPrompt(context)).not.toThrow();
            (0, bun_test_1.expect)(() => agent_rule_1.AgentRuleContext.getLabel(context)).not.toThrow();
        });
        (0, bun_test_1.test)('should handle unicode characters in content and path', () => {
            const context = createMockAgentRuleContext({
                path: '/项目/规则.md',
                content: '使用 TypeScript 编写代码 🚀',
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('/项目/规则.md');
            (0, bun_test_1.expect)(prompt).toContain('使用 TypeScript 编写代码 🚀');
        });
        (0, bun_test_1.test)('should handle very deep file paths', () => {
            const deepPath = Array(20).fill('level').join('/') + '/rules.md';
            const context = createMockAgentRuleContext({
                path: deepPath,
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain(deepPath);
        });
        (0, bun_test_1.test)('should handle content with special markdown characters', () => {
            const context = createMockAgentRuleContext({
                content: `# Title with * and _
                
**Bold text** and *italic text*

- List item with [link](http://example.com)
- Another item with \`inline code\`

> Blockquote with **formatting**

1. Ordered list
2. Second item`,
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('**Bold text**');
            (0, bun_test_1.expect)(prompt).toContain('*italic text*');
            (0, bun_test_1.expect)(prompt).toContain('[link](http://example.com)');
            (0, bun_test_1.expect)(prompt).toContain('`inline code`');
            (0, bun_test_1.expect)(prompt).toContain('> Blockquote');
        });
        (0, bun_test_1.test)('should handle YAML frontmatter in content', () => {
            const context = createMockAgentRuleContext({
                content: `---
title: "Agent Rules"
version: 1.0
tags: ["rules", "guidelines"]
---

# Actual Content
These are the rules.`,
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('---');
            (0, bun_test_1.expect)(prompt).toContain('title: "Agent Rules"');
            (0, bun_test_1.expect)(prompt).toContain('# Actual Content');
        });
        (0, bun_test_1.test)('should handle Windows-style file paths', () => {
            const context = createMockAgentRuleContext({
                path: 'C:\\Projects\\MyApp\\rules.md',
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('C:\\Projects\\MyApp\\rules.md');
        });
        (0, bun_test_1.test)('should handle content with tables', () => {
            const context = createMockAgentRuleContext({
                content: `| Rule | Priority | Status |
|------|----------|--------|
| Use TypeScript | High | ✅ |
| Write tests | Medium | ⚠️ |
| Document code | Low | ❌ |`,
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('| Rule | Priority | Status |');
            (0, bun_test_1.expect)(prompt).toContain('| Use TypeScript | High | ✅ |');
        });
        (0, bun_test_1.test)('should handle content with line breaks and whitespace', () => {
            const context = createMockAgentRuleContext({
                content: `

# Title with spaces around



- List item 1

- List item 2


`,
            });
            const prompt = agent_rule_1.AgentRuleContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toContain('# Title with spaces around');
            (0, bun_test_1.expect)(prompt).toContain('- List item 1');
            (0, bun_test_1.expect)(prompt).toContain('- List item 2');
        });
    });
});
//# sourceMappingURL=agent-rule-context.test.js.map