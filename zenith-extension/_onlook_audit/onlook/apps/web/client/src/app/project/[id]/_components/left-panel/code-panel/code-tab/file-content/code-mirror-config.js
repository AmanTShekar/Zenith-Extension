"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBasicSetup = exports.scrollToLineColumn = exports.customDarkHighlightStyle = exports.customDarkTheme = exports.basicTheme = void 0;
exports.createSearchHighlight = createSearchHighlight;
exports.clearSearchHighlight = clearSearchHighlight;
exports.highlightElementRange = highlightElementRange;
exports.clearElementHighlight = clearElementHighlight;
exports.scrollToFirstMatch = scrollToFirstMatch;
exports.getLanguageFromFileName = getLanguageFromFileName;
exports.getExtensions = getExtensions;
const autocomplete_1 = require("@codemirror/autocomplete");
const lang_css_1 = require("@codemirror/lang-css");
const lang_html_1 = require("@codemirror/lang-html");
const lang_javascript_1 = require("@codemirror/lang-javascript");
const lang_json_1 = require("@codemirror/lang-json");
const lang_markdown_1 = require("@codemirror/lang-markdown");
const language_1 = require("@codemirror/language");
const lint_1 = require("@codemirror/lint");
const search_1 = require("@codemirror/search");
const state_1 = require("@codemirror/state");
const view_1 = require("@codemirror/view");
const highlight_1 = require("@lezer/highlight");
const lodash_1 = require("lodash");
// Custom colors for CodeMirror
const customColors = {
    orange: '#FFAC60',
    purple: '#C478FF',
    blue: '#3FA4FF',
    green: '#1AC69C',
    pink: '#FF32C6'
};
// Basic theme for CodeMirror
exports.basicTheme = {
    '&': {
        fontSize: '13px',
        backgroundColor: 'transparent',
    },
    '&.cm-focused .cm-selectionBackground, & .cm-selectionBackground': {
        backgroundColor: 'rgba(21, 170, 147, 0.2) !important',
    },
    '.cm-content': {
        lineHeight: '1.5',
    },
};
//dark theme for code editor
exports.customDarkTheme = view_1.EditorView.theme({
    '&': {
        color: '#ffffff',
        backgroundColor: '#000000',
        fontSize: '13px',
        userSelect: 'none !important',
    },
    '.cm-content': {
        padding: '10px 0',
        lineHeight: '1.5',
        caretColor: customColors.blue,
        backgroundColor: '#000000',
        userSelect: 'text !important',
    },
    '.cm-focused': {
        outline: 'none',
    },
    '&.cm-focused .cm-cursor': {
        borderLeftColor: customColors.blue,
        borderLeftWidth: '2px'
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
        backgroundColor: 'rgba(63, 164, 255, 0.2)',
    },
    '&.cm-editor.cm-focused .cm-selectionBackground': {
        backgroundColor: `${customColors.green}33 !important`,
    },
    '&.cm-editor .cm-selectionBackground': {
        backgroundColor: `${customColors.green}33 !important`,
    },
    '&.cm-editor .cm-content ::selection': {
        backgroundColor: `${customColors.green}33 !important`,
    },
    '.cm-line ::selection': {
        backgroundColor: `${customColors.green}33 !important`,
    },
    '::selection': {
        backgroundColor: `${customColors.green}33 !important`,
    },
    '.cm-selectionBackground': {
        backgroundColor: 'rgba(63, 164, 255, 0.2)',
    },
    '.cm-gutters': {
        backgroundColor: '#0a0a0a !important',
        color: '#6b7280 !important',
        border: 'none !important',
        borderRight: '1px solid #1f2937 !important',
        width: '45px !important'
    },
    ".cm-foldGutter": {
        width: '12px !important'
    },
    '.cm-gutterElement': {
        color: '#6b7280',
        width: '12px !important'
    },
    '.cm-lineNumbers .cm-gutterElement': {
        color: '#6b7280',
        fontSize: '12px'
    },
    '.cm-activeLine': {
        backgroundColor: 'rgba(255, 255, 255, 0.02)'
    },
    '.cm-activeLineGutter': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)'
    },
    '.cm-foldPlaceholder': {
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        color: customColors.blue
    },
    // Scrollbar styling
    '.cm-scroller::-webkit-scrollbar': {
        width: '8px',
        height: '8px'
    },
    '.cm-scroller::-webkit-scrollbar-track': {
        backgroundColor: '#0a0a0a'
    },
    '.cm-scroller::-webkit-scrollbar-thumb': {
        backgroundColor: '#374151',
        borderRadius: '4px'
    },
    '.cm-scroller::-webkit-scrollbar-thumb:hover': {
        backgroundColor: '#4b5563'
    },
    '.cm-scroller': {
        scrollBehavior: 'smooth'
    },
    '.cm-search-highlight': {
        backgroundColor: 'rgba(138, 194, 255, 0.42)',
    },
    '.cm-element-highlight': {
        backgroundColor: 'rgba(26, 198, 156, 0.2)',
        padding: '0.1735em 0',
        boxDecorationBreak: 'clone',
    },
}, { dark: true });
// Custom syntax highlighting with the specified colors
exports.customDarkHighlightStyle = language_1.HighlightStyle.define([
    // Keywords (if, for, function, etc.) - Pink 
    { tag: highlight_1.tags.keyword, color: customColors.pink, fontWeight: 'bold' },
    { tag: highlight_1.tags.controlKeyword, color: customColors.pink, fontWeight: 'bold' },
    { tag: highlight_1.tags.operatorKeyword, color: customColors.pink },
    // Strings - Blue
    { tag: highlight_1.tags.string, color: customColors.blue },
    { tag: highlight_1.tags.regexp, color: customColors.blue },
    // Numbers - Pink, bool purple, null pink
    { tag: highlight_1.tags.number, color: customColors.pink },
    { tag: highlight_1.tags.bool, color: customColors.purple },
    { tag: highlight_1.tags.null, color: customColors.pink },
    // Functions - purple and methods - pink
    { tag: highlight_1.tags.function(highlight_1.tags.variableName), color: customColors.purple },
    { tag: highlight_1.tags.function(highlight_1.tags.propertyName), color: customColors.pink },
    // Variables-purple and properties - Green
    { tag: highlight_1.tags.variableName, color: customColors.purple },
    { tag: highlight_1.tags.propertyName, color: customColors.green },
    { tag: highlight_1.tags.attributeName, color: customColors.green },
    // Types and classes - Purple (lighter shade)
    { tag: highlight_1.tags.typeName, color: '#E879F9' },
    { tag: highlight_1.tags.className, color: '#E879F9' },
    { tag: highlight_1.tags.namespace, color: '#E879F9' },
    // Comments - Gray
    { tag: highlight_1.tags.comment, color: '#6b7280', fontStyle: 'italic' },
    { tag: highlight_1.tags.lineComment, color: '#6b7280', fontStyle: 'italic' },
    { tag: highlight_1.tags.blockComment, color: '#6b7280', fontStyle: 'italic' },
    // Operators - White/Light Gray
    { tag: highlight_1.tags.operator, color: '#d1d5db' },
    { tag: highlight_1.tags.punctuation, color: '#d1d5db' },
    { tag: highlight_1.tags.bracket, color: '#d1d5db' },
    // Tags (HTML/JSX) - Pink
    { tag: highlight_1.tags.tagName, color: customColors.pink },
    { tag: highlight_1.tags.angleBracket, color: '#d1d5db' },
    // Special tokens
    { tag: highlight_1.tags.atom, color: customColors.pink },
    { tag: highlight_1.tags.literal, color: customColors.orange },
    { tag: highlight_1.tags.unit, color: customColors.pink },
    // Invalid/Error
    { tag: highlight_1.tags.invalid, color: '#ef4444', textDecoration: 'underline' }
]);
const searchHighlightEffect = state_1.StateEffect.define();
const clearHighlightEffect = state_1.StateEffect.define();
const searchHighlightField = state_1.StateField.define({
    create() {
        return view_1.Decoration.none;
    },
    update(decorations, tr) {
        decorations = decorations.map(tr.changes);
        for (let effect of tr.effects) {
            if (effect.is(searchHighlightEffect)) {
                const { term } = effect.value;
                if (!term || term.length < 2) {
                    decorations = view_1.Decoration.none;
                    continue;
                }
                const content = tr.state.doc.toString();
                const termLower = term.toLowerCase();
                const contentLower = content.toLowerCase();
                const newDecorations = [];
                let index = 0;
                while ((index = contentLower.indexOf(termLower, index)) !== -1) {
                    const from = index;
                    const to = index + term.length;
                    newDecorations.push(view_1.Decoration.mark({
                        class: 'cm-search-highlight'
                    }).range(from, to));
                    index = to;
                }
                decorations = view_1.Decoration.set(newDecorations);
            }
            else if (effect.is(clearHighlightEffect)) {
                decorations = view_1.Decoration.none;
            }
        }
        return decorations;
    },
    provide: f => view_1.EditorView.decorations.from(f)
});
function createSearchHighlight(term) {
    return searchHighlightEffect.of({ term });
}
function clearSearchHighlight() {
    return clearHighlightEffect.of(null);
}
// Element highlighting effects
const elementHighlightEffect = state_1.StateEffect.define();
const clearElementHighlightEffect = state_1.StateEffect.define();
const elementHighlightField = state_1.StateField.define({
    create() {
        return view_1.Decoration.none;
    },
    update(decorations, tr) {
        decorations = decorations.map(tr.changes);
        for (let effect of tr.effects) {
            if (effect.is(elementHighlightEffect)) {
                const { startLine, startCol, endLine, endCol } = effect.value;
                // Convert line/column to document positions (0-indexed)
                const doc = tr.state.doc;
                // Clamp line numbers to valid range (1 through doc.lines)
                const clampedStartLine = Math.max(1, Math.min(startLine, doc.lines));
                const clampedEndLine = Math.max(1, Math.min(endLine, doc.lines));
                const startLineObj = doc.line(clampedStartLine);
                const endLineObj = doc.line(clampedEndLine);
                // Clamp column positions to valid range (1 through line length + 1)
                const clampedStartCol = Math.max(1, Math.min(startCol, startLineObj.length + 1));
                const clampedEndCol = Math.max(1, Math.min(endCol, endLineObj.length + 1));
                const startPos = startLineObj.from + clampedStartCol - 1;
                const endPos = endLineObj.from + clampedEndCol;
                // Ensure positions are within document bounds
                const validStartPos = Math.max(0, Math.min(startPos, doc.length));
                const validEndPos = Math.max(validStartPos, Math.min(endPos, doc.length));
                decorations = view_1.Decoration.set([
                    view_1.Decoration.mark({
                        class: 'cm-element-highlight'
                    }).range(validStartPos, validEndPos)
                ]);
            }
            else if (effect.is(clearElementHighlightEffect)) {
                decorations = view_1.Decoration.none;
            }
        }
        return decorations;
    },
    provide: f => view_1.EditorView.decorations.from(f)
});
function highlightElementRange(startLine, startCol, endLine, endCol) {
    // CodeMirror is 0-indexed, so we need to add 1 to the start and end columns
    return elementHighlightEffect.of({ startLine, startCol: startCol + 1, endLine, endCol: endCol + 1 });
}
function clearElementHighlight() {
    return clearElementHighlightEffect.of(null);
}
exports.scrollToLineColumn = (0, lodash_1.debounce)(undebounceScrollToLineColumn, 100, { leading: true, });
function undebounceScrollToLineColumn(view, line, column) {
    const doc = view.state.doc;
    // Ensure line number is within bounds (1-indexed to 0-indexed)
    const lineNum = Math.max(1, Math.min(line, doc.lines));
    const docLine = doc.line(lineNum);
    // Ensure column is within line bounds (1-indexed to 0-indexed)  
    const colNum = Math.max(1, Math.min(column, docLine.length + 1));
    const pos = docLine.from + colNum - 1;
    // Scroll to position with center alignment
    view.dispatch({
        effects: view_1.EditorView.scrollIntoView(pos, {
            y: 'center',
        }),
    });
}
function scrollToFirstMatch(view, term) {
    if (!term || term.length < 2)
        return false;
    const content = view.state.doc.toString();
    const termLower = term.toLowerCase();
    const contentLower = content.toLowerCase();
    const firstMatch = contentLower.indexOf(termLower);
    if (firstMatch !== -1) {
        const pos = firstMatch;
        view.dispatch({
            effects: view_1.EditorView.scrollIntoView(pos, {
                y: 'center'
            })
        });
        return true;
    }
    return false;
}
const getBasicSetup = (saveFile) => {
    const baseExtensions = [
        (0, view_1.highlightActiveLine)(),
        (0, view_1.highlightActiveLineGutter)(),
        (0, view_1.highlightSpecialChars)(),
        (0, view_1.drawSelection)(),
        (0, language_1.bracketMatching)(),
        (0, autocomplete_1.autocompletion)(),
        (0, search_1.highlightSelectionMatches)(),
        (0, lint_1.lintGutter)(),
        (0, view_1.lineNumbers)(),
        searchHighlightField,
        elementHighlightField,
        view_1.keymap.of([
            {
                key: 'Mod-s',
                run: () => {
                    saveFile();
                    return true;
                },
            },
        ]),
        exports.customDarkTheme,
        (0, language_1.syntaxHighlighting)(exports.customDarkHighlightStyle)
    ];
    return baseExtensions;
};
exports.getBasicSetup = getBasicSetup;
// Get language extensions for CodeMirror based on file type
function getLanguageFromFileName(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js':
            return 'javascript';
        case 'jsx':
            return 'javascript';
        case 'ts':
            return 'typescript';
        case 'tsx':
            return 'typescript';
        case 'css':
            return 'css';
        case 'html':
            return 'html';
        case 'json':
            return 'json';
        case 'md':
            return 'markdown';
        default:
            return 'typescript';
    }
}
// Get CodeMirror extensions based on file language
function getExtensions(language) {
    switch (language) {
        case 'javascript':
            return [(0, lang_javascript_1.javascript)({ jsx: true })];
        case 'typescript':
            return [(0, lang_javascript_1.javascript)({ jsx: true, typescript: true })];
        case 'css':
            return [(0, lang_css_1.css)()];
        case 'html':
            return [(0, lang_html_1.html)()];
        case 'json':
            return [(0, lang_json_1.json)()];
        case 'markdown':
            return [(0, lang_markdown_1.markdown)()];
        default:
            return [(0, lang_javascript_1.javascript)({ jsx: true, typescript: true })];
    }
}
//# sourceMappingURL=code-mirror-config.js.map