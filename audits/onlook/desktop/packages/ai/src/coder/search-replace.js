"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelativeIndenter = void 0;
exports.searchAndReplace = searchAndReplace;
exports.dmpLinesApply = dmpLinesApply;
exports.flexibleSearchAndReplace = flexibleSearchAndReplace;
const diff_match_patch_1 = require("diff-match-patch");
// Unique marker for outdenting in relative indentation
const OUTDENT_MARKER = '\u0001';
/**
 * Handles indentation transformation for better text matching
 */
class RelativeIndenter {
    marker;
    constructor(marker = OUTDENT_MARKER) {
        this.marker = marker;
    }
    /**
     * Convert text to use relative indentation by replacing common indentation with markers
     */
    makeRelative(text) {
        if (!text)
            return text;
        const lines = text.split('\n');
        if (lines.length === 0)
            return text;
        // Process each line to convert spaces to markers
        return lines
            .map((line) => {
            if (line.trim().length === 0)
                return line;
            const indent = line.match(/^\s*/)?.[0] ?? '';
            return this.marker.repeat(indent.length) + line.slice(indent.length);
        })
            .join('\n');
    }
    /**
     * Convert text back to absolute indentation by replacing markers with spaces
     */
    makeAbsolute(text) {
        if (!text)
            return text;
        // Replace markers with spaces
        return text
            .split('\n')
            .map((line) => {
            const markerMatch = line.match(new RegExp(`^${this.marker}+`));
            if (!markerMatch)
                return line;
            return ' '.repeat(markerMatch[0].length) + line.slice(markerMatch[0].length);
        })
            .join('\n');
    }
}
exports.RelativeIndenter = RelativeIndenter;
/**
 * Helper function to strip blank lines from start and end of text
 */
function stripBlankLines(text) {
    const lines = text.split('\n');
    let start = 0;
    let end = lines.length - 1;
    while (start <= end && lines[start].trim() === '')
        start++;
    while (end >= start && lines[end].trim() === '')
        end--;
    return lines.slice(start, end + 1).join('\n');
}
/**
 * Helper function to reverse lines in text
 */
function reverseLines(text) {
    return text.split('\n').reverse().join('\n');
}
/**
 * Helper function to normalize spaces in text
 */
function normalizeSpaces(text) {
    return text.replace(/\s+/g, ' ').trim();
}
/**
 * Direct string replacement strategy
 */
function searchAndReplace(searchText, replaceText, originalText) {
    try {
        const occurrences = originalText.split(searchText).length - 1;
        if (occurrences === 0) {
            return { success: false, error: 'Search text not found' };
        }
        if (occurrences > 1) {
            return { success: false, error: 'Search text not unique' };
        }
        const newText = originalText.replace(searchText, replaceText);
        return { success: true, text: newText };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
/**
 * Diff-match-patch based line-by-line diffing strategy
 */
function dmpLinesApply(searchText, replaceText, originalText) {
    try {
        const dmp = new diff_match_patch_1.diff_match_patch();
        // Split texts into lines
        const searchLines = searchText.split('\n');
        const replaceLines = replaceText.split('\n');
        const originalLines = originalText.split('\n');
        // Find the search text in the original
        let startLine = -1;
        for (let i = 0; i <= originalLines.length - searchLines.length; i++) {
            let match = true;
            for (let j = 0; j < searchLines.length; j++) {
                if (originalLines[i + j] !== searchLines[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                if (startLine !== -1) {
                    return { success: false, error: 'Search text not unique' };
                }
                startLine = i;
            }
        }
        if (startLine === -1) {
            return { success: false, error: 'Search text not found' };
        }
        // Replace the lines
        const newLines = [
            ...originalLines.slice(0, startLine),
            ...replaceLines,
            ...originalLines.slice(startLine + searchLines.length),
        ];
        return { success: true, text: newLines.join('\n') };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
/**
 * Tries multiple strategies to perform search and replace
 */
async function flexibleSearchAndReplace(searchText, replaceText, originalText, options = {}) {
    const { stripBlankLines: useStripBlank = true, relativeIndent: useRelativeIndent = true, reverseLines: useReverse = true, normalizeSpaces: useNormalizeSpaces = true, } = options;
    // Initialize preprocessing tools
    const indenter = new RelativeIndenter();
    // Define preprocessing combinations
    const preprocessCombinations = [
        { stripBlank: false, relIndent: false, rev: false, normalize: false },
        { stripBlank: true, relIndent: false, rev: false, normalize: false },
        { stripBlank: false, relIndent: true, rev: false, normalize: false },
        { stripBlank: true, relIndent: true, rev: false, normalize: false },
        { stripBlank: false, relIndent: false, rev: true, normalize: false },
        { stripBlank: false, relIndent: false, rev: false, normalize: true },
    ].filter((combo) => (!combo.stripBlank || useStripBlank) &&
        (!combo.relIndent || useRelativeIndent) &&
        (!combo.rev || useReverse) &&
        (!combo.normalize || useNormalizeSpaces));
    // Try each preprocessing combination with each strategy
    for (const combo of preprocessCombinations) {
        let processedSearch = searchText;
        let processedReplace = replaceText;
        let processedOriginal = originalText;
        // Apply preprocessing
        if (combo.stripBlank) {
            processedSearch = stripBlankLines(processedSearch);
            processedReplace = stripBlankLines(processedReplace);
            processedOriginal = stripBlankLines(processedOriginal);
        }
        if (combo.relIndent) {
            processedSearch = indenter.makeRelative(processedSearch);
            processedReplace = indenter.makeRelative(processedReplace);
            processedOriginal = indenter.makeRelative(processedOriginal);
        }
        if (combo.rev) {
            processedSearch = reverseLines(processedSearch);
            processedReplace = reverseLines(processedReplace);
            processedOriginal = reverseLines(processedOriginal);
        }
        if (combo.normalize) {
            processedSearch = normalizeSpaces(processedSearch);
            processedReplace = normalizeSpaces(processedReplace);
            processedOriginal = normalizeSpaces(processedOriginal);
        }
        // Try each strategy
        const strategies = [searchAndReplace, dmpLinesApply];
        for (const strategy of strategies) {
            const result = await Promise.resolve(strategy(processedSearch, processedReplace, processedOriginal));
            if (result.success && result.text) {
                let finalText = result.text;
                // Reverse preprocessing
                if (combo.rev) {
                    finalText = reverseLines(finalText);
                }
                if (combo.relIndent) {
                    finalText = indenter.makeAbsolute(finalText);
                }
                return { success: true, text: finalText };
            }
        }
    }
    return { success: false, error: 'No strategy succeeded' };
}
//# sourceMappingURL=search-replace.js.map