"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptProvider = void 0;
const context_1 = require("./context");
const create_1 = require("./create");
const edit_1 = require("./edit");
const format_1 = require("./format");
const helpers_1 = require("./helpers");
const signatures_1 = require("./signatures");
const summary_1 = require("./summary");
class PromptProvider {
    shouldWrapXml;
    constructor(shouldWrapXml = true) {
        this.shouldWrapXml = shouldWrapXml;
    }
    getSystemPrompt(platform) {
        let prompt = '';
        if (this.shouldWrapXml) {
            prompt += (0, helpers_1.wrapXml)('role', edit_1.EDIT_PROMPTS.system);
            prompt += (0, helpers_1.wrapXml)('search-replace-rules', edit_1.EDIT_PROMPTS.searchReplaceRules);
            prompt += (0, helpers_1.wrapXml)('example-conversation', this.getExampleConversation(edit_1.SEARCH_REPLACE_EXAMPLE_CONVERSATION));
        }
        else {
            prompt += edit_1.EDIT_PROMPTS.system;
            prompt += edit_1.EDIT_PROMPTS.searchReplaceRules;
            prompt += this.getExampleConversation(edit_1.SEARCH_REPLACE_EXAMPLE_CONVERSATION);
        }
        prompt = prompt.replace(signatures_1.PLATFORM_SIGNATURE, platform);
        return prompt;
    }
    getCreatePageSystemPrompt() {
        let prompt = '';
        if (this.shouldWrapXml) {
            prompt += (0, helpers_1.wrapXml)('role', create_1.PAGE_SYSTEM_PROMPT.role);
            prompt += (0, helpers_1.wrapXml)('rules', create_1.PAGE_SYSTEM_PROMPT.rules);
            prompt += (0, helpers_1.wrapXml)('example-conversation', this.getExampleConversation(create_1.CREATE_PAGE_EXAMPLE_CONVERSATION));
        }
        else {
            prompt += create_1.PAGE_SYSTEM_PROMPT.role;
            prompt += create_1.PAGE_SYSTEM_PROMPT.rules;
            prompt += this.getExampleConversation(create_1.CREATE_PAGE_EXAMPLE_CONVERSATION);
        }
        return prompt;
    }
    getExampleConversation(conversation) {
        let prompt = '';
        for (const message of conversation) {
            prompt += `${message.role.toUpperCase()}: ${message.content}\n`;
        }
        return prompt;
    }
    getHydratedUserMessage(content, context) {
        if (content.length === 0) {
            throw new Error('Message is required');
        }
        const files = context.filter((c) => c.type === 'file').map((c) => c);
        const highlights = context.filter((c) => c.type === 'highlight').map((c) => c);
        const errors = context.filter((c) => c.type === 'error').map((c) => c);
        const project = context.filter((c) => c.type === 'project').map((c) => c);
        const images = context.filter((c) => c.type === 'image').map((c) => c);
        let prompt = '';
        let contextPrompt = this.getFilesContent(files, highlights);
        if (contextPrompt) {
            if (this.shouldWrapXml) {
                contextPrompt = (0, helpers_1.wrapXml)('context', contextPrompt);
            }
            prompt += contextPrompt;
        }
        if (errors.length > 0) {
            let errorPrompt = this.getErrorsContent(errors);
            prompt += errorPrompt;
        }
        if (project.length > 0) {
            prompt += this.getProjectContext(project[0]);
        }
        if (this.shouldWrapXml) {
            const textContent = typeof content === 'string'
                ? content
                : content
                    .filter((c) => c.type === 'text')
                    .map((c) => c.text)
                    .join('\n');
            prompt += (0, helpers_1.wrapXml)('instruction', textContent);
        }
        else {
            prompt += content;
        }
        const imageParts = images.map((i) => ({
            type: 'image',
            image: i.content,
            mimeType: i.mimeType,
        }));
        return {
            role: 'user',
            content: [
                ...imageParts,
                {
                    type: 'text',
                    text: prompt,
                },
            ],
        };
    }
    getFilesContent(files, highlights) {
        if (files.length === 0) {
            return '';
        }
        let prompt = '';
        prompt += `${context_1.CONTEXT_PROMPTS.filesContentPrefix}\n`;
        let index = 1;
        for (const file of files) {
            let filePrompt = `${file.path}\n`;
            filePrompt += `${format_1.FENCE.code.start}${this.getLanguageFromFilePath(file.path)}\n`;
            filePrompt += file.content;
            filePrompt += `\n${format_1.FENCE.code.end}\n`;
            filePrompt += this.getHighlightsContent(file.path, highlights);
            if (this.shouldWrapXml) {
                filePrompt = (0, helpers_1.wrapXml)(files.length > 1 ? `file-${index}` : 'file', filePrompt);
            }
            prompt += filePrompt;
            index++;
        }
        return prompt;
    }
    getErrorsContent(errors) {
        if (errors.length === 0) {
            return '';
        }
        let prompt = `${context_1.CONTEXT_PROMPTS.errorsContentPrefix}\n`;
        for (const error of errors) {
            prompt += `${error.content}\n`;
        }
        if (prompt.trim().length > 0 && this.shouldWrapXml) {
            prompt = (0, helpers_1.wrapXml)('errors', prompt);
        }
        return prompt;
    }
    getLanguageFromFilePath(filePath) {
        return filePath.split('.').pop() || '';
    }
    getHighlightsContent(filePath, highlights) {
        const fileHighlights = highlights.filter((h) => h.path === filePath);
        if (fileHighlights.length === 0) {
            return '';
        }
        let prompt = `${context_1.CONTEXT_PROMPTS.highlightPrefix}\n`;
        let index = 1;
        for (const highlight of fileHighlights) {
            let highlightPrompt = `${filePath}#L${highlight.start}:L${highlight.end}\n`;
            highlightPrompt += `${format_1.FENCE.code.start}\n`;
            highlightPrompt += highlight.content;
            highlightPrompt += `\n${format_1.FENCE.code.end}\n`;
            if (this.shouldWrapXml) {
                highlightPrompt = (0, helpers_1.wrapXml)(fileHighlights.length > 1 ? `highlight-${index}` : 'highlight', highlightPrompt);
            }
            prompt += highlightPrompt;
            index++;
        }
        return prompt;
    }
    getSummaryPrompt() {
        let prompt = '';
        if (this.shouldWrapXml) {
            prompt += (0, helpers_1.wrapXml)('summary-rules', summary_1.SUMMARY_PROMPTS.rules);
            prompt += (0, helpers_1.wrapXml)('summary-guidelines', summary_1.SUMMARY_PROMPTS.guidelines);
            prompt += (0, helpers_1.wrapXml)('summary-format', summary_1.SUMMARY_PROMPTS.format);
            prompt += (0, helpers_1.wrapXml)('summary-reminder', summary_1.SUMMARY_PROMPTS.reminder);
            prompt += (0, helpers_1.wrapXml)('example-conversation', this.getSummaryExampleConversation());
            prompt += (0, helpers_1.wrapXml)('example-summary-output', 'EXAMPLE SUMMARY:\n' + summary_1.SUMMARY_PROMPTS.summary);
        }
        else {
            prompt += summary_1.SUMMARY_PROMPTS.rules + '\n\n';
            prompt += summary_1.SUMMARY_PROMPTS.guidelines + '\n\n';
            prompt += summary_1.SUMMARY_PROMPTS.format + '\n\n';
            prompt += summary_1.SUMMARY_PROMPTS.reminder + '\n\n';
            prompt += this.getSummaryExampleConversation();
            prompt += 'EXAMPLE SUMMARY:\n' + summary_1.SUMMARY_PROMPTS.summary + '\n\n';
        }
        return prompt;
    }
    getSummaryExampleConversation() {
        let prompt = 'EXAMPLE CONVERSATION:\n';
        for (const message of edit_1.SEARCH_REPLACE_EXAMPLE_CONVERSATION) {
            prompt += `${message.role.toUpperCase()}: ${message.content}\n`;
        }
        return prompt;
    }
    getProjectContext(project) {
        const content = `${context_1.CONTEXT_PROMPTS.projectContextPrefix} ${project.path}`;
        if (this.shouldWrapXml) {
            return (0, helpers_1.wrapXml)('project-info', content);
        }
        return content;
    }
}
exports.PromptProvider = PromptProvider;
//# sourceMappingURL=provider.js.map