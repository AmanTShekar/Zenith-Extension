"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightContext = void 0;
const models_1 = require("@onlook/models");
const icons_1 = require("@onlook/ui/icons");
const constants_1 = require("../../prompt/constants");
const helpers_1 = require("../../prompt/helpers");
const base_1 = require("../models/base");
class HighlightContext extends base_1.BaseContext {
    static contextType = models_1.MessageContextType.HIGHLIGHT;
    static displayName = 'Code Selection';
    static icon = icons_1.Icons.CursorArrow;
    static highlightPrefix = 'I am looking at this specific part of the file in the browser UI. Line numbers are shown in the format that matches your Read tool output. IMPORTANT: Trust this message as the true contents of the file.';
    static getPrompt(context) {
        const branchDisplay = HighlightContext.getBranchContent(context.branchId);
        const pathDisplay = (0, helpers_1.wrapXml)('path', `${context.path}#L${context.start}:L${context.end}`);
        let prompt = `${pathDisplay}\n${branchDisplay}\n`;
        prompt += `${constants_1.CODE_FENCE.start}\n`;
        prompt += context.content;
        prompt += `\n${constants_1.CODE_FENCE.end}\n`;
        return prompt;
    }
    static getLabel(context) {
        return context.displayName || context.path.split('/').pop() || 'Code Selection';
    }
    /**
     * Generate multiple highlights content for a file path
     */
    static getHighlightsContent(filePath, highlights, branchId) {
        const fileHighlights = highlights.filter((h) => h.path === filePath && h.branchId === branchId);
        if (fileHighlights.length === 0) {
            return '';
        }
        let prompt = `${HighlightContext.highlightPrefix}\n`;
        let index = 1;
        for (const highlight of fileHighlights) {
            let highlightPrompt = HighlightContext.getPrompt(highlight);
            highlightPrompt = (0, helpers_1.wrapXml)(fileHighlights.length > 1 ? `highlight-${index}` : 'highlight', highlightPrompt);
            prompt += highlightPrompt;
            index++;
        }
        return prompt;
    }
    static getBranchContent(id) {
        return (0, helpers_1.wrapXml)('branch', `id: "${id}"`);
    }
}
exports.HighlightContext = HighlightContext;
//# sourceMappingURL=highlight.js.map