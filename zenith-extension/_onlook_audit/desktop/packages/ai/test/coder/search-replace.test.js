"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const block_1 = require("../../src/coder/block");
const search_replace_1 = require("../../src/coder/search-replace");
(0, bun_test_1.describe)('RelativeIndenter', () => {
    const indenter = new search_replace_1.RelativeIndenter();
    (0, bun_test_1.test)('should handle empty text', () => {
        const text = '';
        (0, bun_test_1.expect)(indenter.makeRelative(text)).toBe('');
        (0, bun_test_1.expect)(indenter.makeAbsolute(text)).toBe('');
    });
    (0, bun_test_1.test)('should preserve indentation structure', () => {
        const text = '    line1\n        line2\n    line3';
        const relative = indenter.makeRelative(text);
        const absolute = indenter.makeAbsolute(relative);
        (0, bun_test_1.expect)(absolute).toBe(text);
    });
    (0, bun_test_1.test)('should handle mixed indentation', () => {
        const text = 'line1\n    line2\n        line3\n    line4';
        const relative = indenter.makeRelative(text);
        (0, bun_test_1.expect)(relative).not.toContain('    ');
        const absolute = indenter.makeAbsolute(relative);
        (0, bun_test_1.expect)(absolute).toBe(text);
    });
});
(0, bun_test_1.describe)('Search and Replace Strategies', () => {
    (0, bun_test_1.test)('direct string replace - basic', () => {
        const result = (0, search_replace_1.searchAndReplace)('old', 'new', 'this is old text');
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(result.text).toBe('this is new text');
    });
    (0, bun_test_1.test)('direct string replace - not found', () => {
        const result = (0, search_replace_1.searchAndReplace)('missing', 'new', 'this is old text');
        (0, bun_test_1.expect)(result.success).toBe(false);
        (0, bun_test_1.expect)(result.error).toBe('Search text not found');
    });
    (0, bun_test_1.test)('direct string replace - not unique', () => {
        const result = (0, search_replace_1.searchAndReplace)('text', 'new', 'text with text');
        (0, bun_test_1.expect)(result.success).toBe(false);
        (0, bun_test_1.expect)(result.error).toBe('Search text not unique');
    });
    (0, bun_test_1.test)('dmp lines apply - basic', () => {
        const result = (0, search_replace_1.dmpLinesApply)('line1\nline2', 'line1\nmodified\nline2', 'prefix\nline1\nline2\nsuffix');
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(result.text).toBe('prefix\nline1\nmodified\nline2\nsuffix');
    });
});
(0, bun_test_1.describe)('Flexible Search and Replace', () => {
    (0, bun_test_1.test)('should handle basic replacement', async () => {
        const result = await (0, search_replace_1.flexibleSearchAndReplace)('old', 'new', 'this is old text');
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(result.text).toBe('this is new text');
    });
    (0, bun_test_1.test)('should handle indentation-sensitive replacement', async () => {
        const text = '    if (condition) {\n        oldCode();\n    }';
        const search = '    oldCode();';
        const replace = '    newCode();';
        const result = await (0, search_replace_1.flexibleSearchAndReplace)(search, replace, text, {
            relativeIndent: true,
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(result.text).toBe('    if (condition) {\n        newCode();\n    }');
    });
    (0, bun_test_1.test)('should handle blank line differences', async () => {
        const text = '\n\ncode\n\n';
        const search = 'code';
        const replace = 'newcode';
        const result = await (0, search_replace_1.flexibleSearchAndReplace)(search, replace, text, {
            stripBlankLines: true,
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(result.text).toBe('\n\nnewcode\n\n');
    });
});
(0, bun_test_1.describe)('CodeBlockProcessor Integration', () => {
    const processor = new block_1.CodeBlockProcessor();
    (0, bun_test_1.test)('should apply flexible diff correctly', async () => {
        const originalText = '    if (x) {\n        oldFunc();\n    }';
        const diffText = processor.createDiff('    oldFunc();', '    newFunc();');
        const result = await processor.applyDiff(originalText, diffText);
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(result.text).toBe('    if (x) {\n        newFunc();\n    }');
        (0, bun_test_1.expect)(result.failures).toBeUndefined();
    });
    (0, bun_test_1.test)('should fall back to simple replace if needed', async () => {
        const originalText = 'simple old text';
        const diffText = processor.createDiff('old', 'new');
        const result = await processor.applyDiff(originalText, diffText);
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(result.text).toBe('simple new text');
        (0, bun_test_1.expect)(result.failures).toBeUndefined();
    });
    (0, bun_test_1.test)('should mark as failed if any replacement fails', async () => {
        const originalText = 'simple old text';
        const diffText = processor.createDiff('old', 'new') +
            '\n' +
            processor.createDiff('missing', 'replacement');
        const result = await processor.applyDiff(originalText, diffText);
        (0, bun_test_1.expect)(result.success).toBe(false); // Should be false even though one replacement succeeded
        (0, bun_test_1.expect)(result.text).toBe('simple new text');
        (0, bun_test_1.expect)(result.failures).toHaveLength(1);
        (0, bun_test_1.expect)(result.failures[0]).toEqual({
            search: 'missing',
            error: 'No changes made',
        });
    });
});
//# sourceMappingURL=search-replace.test.js.map