"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCodeBlocks = extractCodeBlocks;
const marked_1 = require("marked");
/**
 * Extracts code from markdown code blocks. If no code blocks are found, returns the original text.
 * @param text The markdown text containing code blocks
 * @returns The extracted code or original text if no code blocks found
 */
function extractCodeBlocks(text) {
    const tokens = marked_1.marked.lexer(text);
    const codeBlocks = tokens
        .filter((token) => token.type === 'code')
        .map((token) => token.text);
    return codeBlocks.length ? codeBlocks.join('\n\n') : text;
}
//# sourceMappingURL=helpers.js.map