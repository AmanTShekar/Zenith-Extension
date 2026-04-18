"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileContext = void 0;
const models_1 = require("@onlook/models");
const icons_1 = require("@onlook/ui/icons");
const constants_1 = require("../../prompt/constants");
const helpers_1 = require("../../prompt/helpers");
const base_1 = require("../models/base");
const highlight_1 = require("./highlight");
class FileContext extends base_1.BaseContext {
    static contextType = models_1.MessageContextType.FILE;
    static displayName = 'File';
    static icon = icons_1.Icons.File;
    static filesContentPrefix = `I have added these files to the chat so you can go ahead and edit them`;
    static truncatedFilesContentPrefix = `This context originally included the content of files listed below and has been truncated to save space.
If relevant, feel free to retrieve their content.`;
    static getPrompt(context) {
        const pathDisplay = (0, helpers_1.wrapXml)('path', context.path);
        const branchDisplay = (0, helpers_1.wrapXml)('branch', `id: "${context.branchId}"`);
        let prompt = `${pathDisplay}\n${branchDisplay}\n`;
        prompt += `${constants_1.CODE_FENCE.start}${FileContext.getLanguageFromFilePath(context.path)}\n`;
        prompt += context.content;
        prompt += `\n${constants_1.CODE_FENCE.end}\n`;
        return prompt;
    }
    static getLabel(context) {
        return context.path.split('/').pop() || 'File';
    }
    /**
     * Generate multiple files content with highlights
     */
    static getFilesContent(files, highlights) {
        if (files.length === 0) {
            return '';
        }
        let prompt = '';
        prompt += `${FileContext.filesContentPrefix}\n`;
        let index = 1;
        for (const file of files) {
            let filePrompt = FileContext.getPrompt(file);
            // Add highlights for this file
            const highlightContent = FileContext.getHighlightsForFile(file.path, highlights, file.branchId);
            if (highlightContent) {
                filePrompt += highlightContent;
            }
            filePrompt = (0, helpers_1.wrapXml)(files.length > 1 ? `file-${index}` : 'file', filePrompt);
            prompt += filePrompt;
            index++;
        }
        return prompt;
    }
    /**
     * Generate truncated files content
     */
    static getTruncatedFilesContent(files) {
        if (files.length === 0) {
            return '';
        }
        let prompt = '';
        prompt += `${FileContext.truncatedFilesContentPrefix}\n`;
        let index = 1;
        for (const file of files) {
            const branchDisplay = FileContext.getBranchContent(file.branchId);
            const pathDisplay = (0, helpers_1.wrapXml)('path', file.path);
            let filePrompt = `${pathDisplay}\n${branchDisplay}\n`;
            filePrompt = (0, helpers_1.wrapXml)(files.length > 1 ? `file-${index}` : 'file', filePrompt);
            prompt += filePrompt;
            index++;
        }
        return prompt;
    }
    static getBranchContent(id) {
        return (0, helpers_1.wrapXml)('branch', `id: "${id}"`);
    }
    static getHighlightsForFile(filePath, highlights, branchId) {
        // Import HighlightContext dynamically to avoid circular imports
        return highlight_1.HighlightContext.getHighlightsContent(filePath, highlights, branchId);
    }
    static getLanguageFromFilePath(filePath) {
        return filePath.split('.').pop() ?? '';
    }
}
exports.FileContext = FileContext;
//# sourceMappingURL=file.js.map