"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeBlockProcessor = void 0;
const format_1 = require("../prompt/format");
const search_replace_1 = require("./search-replace");
class CodeBlockProcessor {
    /**
     * Extracts search and replace content from a diff string using the defined fence markers
     */
    static parseDiff(diffText) {
        try {
            const results = [];
            let currentIndex = 0;
            while (true) {
                const startIndex = diffText.indexOf(format_1.FENCE.searchReplace.start, currentIndex);
                if (startIndex === -1)
                    break;
                const middleIndex = diffText.indexOf(format_1.FENCE.searchReplace.middle, startIndex);
                const endIndex = diffText.indexOf(format_1.FENCE.searchReplace.end, middleIndex);
                if (middleIndex === -1 || endIndex === -1) {
                    throw new Error('Incomplete fence markers');
                }
                const searchStart = startIndex + format_1.FENCE.searchReplace.start.length;
                const replaceStart = middleIndex + format_1.FENCE.searchReplace.middle.length;
                const search = diffText.substring(searchStart, middleIndex).trim();
                const replace = diffText.substring(replaceStart, endIndex).trim();
                results.push({ search, replace });
                currentIndex = endIndex + format_1.FENCE.searchReplace.end.length;
            }
            if (results.length === 0) {
                throw new Error('No valid fence blocks found');
            }
            return results;
        }
        catch (error) {
            console.warn('Invalid diff format', error);
            return [];
        }
    }
    /**
     * Applies a search/replace diff to the original text with advanced formatting handling
     * Uses multiple strategies and preprocessing options to handle complex replacements
     */
    async applyDiff(originalText, diffText) {
        const searchReplaces = CodeBlockProcessor.parseDiff(diffText);
        let text = originalText;
        const failures = [];
        for (const { search, replace } of searchReplaces) {
            const result = await (0, search_replace_1.flexibleSearchAndReplace)(search, replace, text);
            if (result.success && result.text) {
                text = result.text;
            }
            else {
                // Fallback to simple replacement if flexible strategies fail
                try {
                    const newText = text.replace(search, replace);
                    if (newText !== text) {
                        text = newText;
                    }
                    else {
                        failures.push({ search, error: 'No changes made' });
                    }
                }
                catch (error) {
                    failures.push({
                        search,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                    console.warn('Simple replacement failed:', error);
                }
            }
        }
        return {
            success: failures.length === 0,
            text,
            ...(failures.length > 0 && { failures }),
        };
    }
    /**
     * Creates a diff string using the defined fence markers
     */
    createDiff(search, replace) {
        return [
            format_1.FENCE.searchReplace.start,
            search,
            format_1.FENCE.searchReplace.middle,
            replace,
            format_1.FENCE.searchReplace.end,
        ].join('\n');
    }
    /**
     * Extracts multiple code blocks from a string, including optional file names and languages
     * @param text String containing zero or more code blocks
     * @returns Array of code blocks with metadata
     */
    extractCodeBlocks(text) {
        // Matches: optional filename on previous line, fence start with optional language, content, fence end
        const blockRegex = /(?:([^\n]+)\n)?```(\w+)?\n([\s\S]*?)```/g;
        const matches = text.matchAll(blockRegex);
        return Array.from(matches).map((match) => ({
            ...(match[1] && { fileName: match[1].trim() }),
            ...(match[2] && { language: match[2] }),
            content: match[3].trim(),
        }));
    }
}
exports.CodeBlockProcessor = CodeBlockProcessor;
//# sourceMappingURL=block.js.map