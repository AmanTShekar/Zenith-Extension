"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBasicSetup = exports.basicTheme = void 0;
exports.getLanguageFromFileName = getLanguageFromFileName;
exports.getExtensions = getExtensions;
const lang_javascript_1 = require("@codemirror/lang-javascript");
const lang_css_1 = require("@codemirror/lang-css");
const lang_html_1 = require("@codemirror/lang-html");
const lang_json_1 = require("@codemirror/lang-json");
const lang_markdown_1 = require("@codemirror/lang-markdown");
const view_1 = require("@codemirror/view");
const view_2 = require("@codemirror/view");
const view_3 = require("@codemirror/view");
const language_1 = require("@codemirror/language");
const autocomplete_1 = require("@codemirror/autocomplete");
const search_1 = require("@codemirror/search");
const lint_1 = require("@codemirror/lint");
const view_4 = require("@codemirror/view");
const view_5 = require("@codemirror/view");
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
// Basic setup for CodeMirror
const getBasicSetup = (isDark, saveFile) => {
    return [
        view_1.EditorView.theme(exports.basicTheme),
        isDark
            ? view_1.EditorView.theme({
                '&': { color: '#ffffffd9' },
            })
            : view_1.EditorView.theme({
                '&': { color: '#000000d9' },
            }),
        (0, view_2.highlightActiveLine)(),
        (0, view_2.highlightActiveLineGutter)(),
        (0, view_3.highlightSpecialChars)(),
        (0, view_3.drawSelection)(),
        (0, language_1.bracketMatching)(),
        (0, autocomplete_1.autocompletion)(),
        (0, search_1.highlightSelectionMatches)(),
        (0, lint_1.lintGutter)(),
        (0, view_4.lineNumbers)(),
        view_5.keymap.of([
            {
                key: 'Mod-s',
                run: () => {
                    saveFile();
                    return true;
                },
            },
        ]),
    ];
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
//# sourceMappingURL=CodeMirrorConfig.js.map