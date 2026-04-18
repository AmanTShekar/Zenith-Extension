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
exports.CodeBlock = void 0;
const ThemeProvider_1 = require("@/components/ThemeProvider");
const utils_1 = require("@onlook/ui/utils");
const index_mjs_1 = require("@shikijs/monaco/index.mjs");
const monaco = __importStar(require("monaco-editor"));
const react_1 = require("react");
const shiki_1 = require("shiki");
const variants_1 = require("./variants");
const CodeBlock = ({ className, code, variant, }) => {
    const editorContainer = (0, react_1.useRef)(null);
    const { theme } = (0, ThemeProvider_1.useTheme)();
    const editor = (0, react_1.useRef)(null);
    const decorationsCollection = (0, react_1.useRef)(null);
    const setting = variants_1.VARIANTS[variant || 'normal'];
    const LINE_HEIGHT = 20;
    (0, react_1.useEffect)(() => {
        try {
            initMonaco();
        }
        catch (error) {
            console.error('Failed to initialize Monaco editor:', error);
        }
        return () => {
            if (editor.current) {
                editor.current.dispose();
            }
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (editor.current) {
            editor.current.updateOptions({
                theme: theme === 'light' ? 'light-plus' : 'dark-plus',
            });
        }
    }, [theme]);
    const getEditorHeight = (code) => {
        const lineCount = code.split('\n').length;
        return lineCount * LINE_HEIGHT + 25;
    };
    async function initMonaco() {
        if (editorContainer.current) {
            await initHighlighter();
            if (editorContainer.current?.style) {
                const height = getEditorHeight(code);
                editorContainer.current.style.height = `${height}px`;
            }
            editor.current = monaco.editor.create(editorContainer.current, {
                value: '',
                language: 'javascript',
                theme: theme === 'light' ? 'light-plus' : 'dark-plus',
                automaticLayout: true,
                overviewRulerBorder: false,
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                renderLineHighlight: 'none',
                contextmenu: false,
                folding: false,
                readOnly: true,
                glyphMargin: false,
                stickyScroll: { enabled: false },
                insertSpaces: true,
                detectIndentation: false,
                guides: {
                    indentation: false,
                    highlightActiveIndentation: false,
                    bracketPairs: false,
                },
                scrollBeyondLastLine: false,
                minimap: { enabled: false },
                lineHeight: LINE_HEIGHT,
                ...setting,
            });
            decorationsCollection.current = editor.current.createDecorationsCollection();
            if (code) {
                updateCodeValue(code);
            }
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
    function updateCodeValue(code) {
        if (!editor.current) {
            console.error('Editor not initialized.');
            return;
        }
        editor.current.setValue(code);
    }
    return <div ref={editorContainer} className={(0, utils_1.cn)('flex w-full', className)}/>;
};
exports.CodeBlock = CodeBlock;
//# sourceMappingURL=CodeBlock.js.map