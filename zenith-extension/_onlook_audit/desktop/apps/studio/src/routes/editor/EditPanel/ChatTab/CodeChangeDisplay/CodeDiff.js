"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeDiff = void 0;
const ThemeProvider_1 = require("@/components/ThemeProvider");
const utils_1 = require("@onlook/ui/utils");
const index_mjs_1 = require("@shikijs/monaco/index.mjs");
const monaco = __importStar(require("monaco-editor"));
const react_1 = require("react");
const shiki_1 = require("shiki");
const variants_1 = require("./variants");
const CodeDiff = ({ originalCode, modifiedCode, variant }) => {
    const { theme } = (0, ThemeProvider_1.useTheme)();
    const diffContainer = (0, react_1.useRef)(null);
    const diffEditor = (0, react_1.useRef)(null);
    const setting = variants_1.VARIANTS[variant || 'normal'];
    (0, react_1.useEffect)(() => {
        initMonaco();
        return () => {
            if (diffEditor.current) {
                diffEditor.current.dispose();
            }
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (diffEditor.current) {
            updateDiffContent(originalCode, modifiedCode);
        }
    }, [originalCode, modifiedCode]);
    (0, react_1.useEffect)(() => {
        if (diffEditor.current) {
            diffEditor.current.updateOptions({
                // @ts-expect-error - Option exists
                theme: theme === 'light' ? 'light-plus' : 'dark-plus',
            });
        }
    }, [theme]);
    async function initMonaco() {
        if (diffContainer.current) {
            await initHighlighter();
            diffEditor.current = monaco.editor.createDiffEditor(diffContainer.current, {
                theme: theme === 'light' ? 'light-plus' : 'dark-plus',
                automaticLayout: true,
                scrollbar: {
                    vertical: 'hidden',
                    horizontal: 'hidden',
                },
                overviewRulerBorder: false,
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                renderLineHighlight: 'none',
                contextmenu: false,
                folding: false,
                readOnly: true,
                stickyScroll: { enabled: false },
                glyphMargin: false,
                renderSideBySide: true,
                originalEditable: false,
                diffWordWrap: 'on',
                guides: {
                    indentation: false,
                    highlightActiveIndentation: false,
                    bracketPairs: false,
                },
                scrollBeyondLastLine: false,
                ...setting,
            });
            updateDiffContent(originalCode, modifiedCode);
        }
    }
    async function initHighlighter() {
        const LANGS = ['javascript', 'typescript', 'jsx', 'tsx'];
        const highlighter = await (0, shiki_1.createHighlighter)({
            themes: ['dark-plus', 'light-plus'],
            langs: LANGS,
        });
        LANGS.forEach((lang) => {
            monaco.languages.register({ id: lang });
        });
        (0, index_mjs_1.shikiToMonaco)(highlighter, monaco);
    }
    function updateDiffContent(original, modified) {
        if (!diffEditor.current) {
            console.error('Diff editor not initialized.');
            return;
        }
        const originalModel = monaco.editor.createModel(original, 'javascript');
        const modifiedModel = monaco.editor.createModel(modified, 'javascript');
        diffEditor.current.setModel({
            original: originalModel,
            modified: modifiedModel,
        });
    }
    return <div ref={diffContainer} className={(0, utils_1.cn)('w-full h-full overflow-hidden')}/>;
};
exports.CodeDiff = CodeDiff;
//# sourceMappingURL=CodeDiff.js.map