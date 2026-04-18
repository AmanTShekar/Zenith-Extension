"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeBlockCopyButton = exports.CodeBlock = void 0;
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
const next_themes_1 = require("next-themes");
const react_syntax_highlighter_1 = require("react-syntax-highlighter");
const prism_1 = require("react-syntax-highlighter/dist/esm/styles/prism");
const utils_1 = require("../../utils");
const button_1 = require("../button");
const CodeBlockContext = (0, react_1.createContext)({
    code: '',
});
const CodeBlockComponent = ({ code, language, showLineNumbers = false, isStreaming = false, className, children, ...props }) => {
    const { resolvedTheme } = (0, next_themes_1.useTheme)();
    const isDark = resolvedTheme === 'dark';
    const [debouncedCode, setDebouncedCode] = (0, react_1.useState)(code);
    // Debounce code updates when streaming to avoid expensive syntax highlighting re-renders
    (0, react_1.useEffect)(() => {
        if (isStreaming) {
            const timer = setTimeout(() => {
                setDebouncedCode(code);
            }, 300);
            return () => clearTimeout(timer);
        }
        else {
            // When not streaming, update immediately
            setDebouncedCode(code);
        }
    }, [code, isStreaming]);
    return (<CodeBlockContext.Provider value={{ code }}>
            <div className={(0, utils_1.cn)('relative w-full overflow-hidden rounded-md border bg-background text-foreground', className)} {...props}>
                <div className="relative">
                    <react_syntax_highlighter_1.Prism className="overflow-hidden" codeTagProps={{
            className: 'font-mono text-xs',
        }} customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            background: 'hsl(var(--background-secondary))',
            color: 'hsl(var(--foreground))',
        }} language={language} lineNumberStyle={{
            color: 'hsl(var(--muted-foreground))',
            paddingRight: '1rem',
            minWidth: '2.5rem',
        }} showLineNumbers={showLineNumbers} style={isDark ? prism_1.oneDark : prism_1.oneLight}>
                        {debouncedCode}
                    </react_syntax_highlighter_1.Prism>
                    {children && (<div className="absolute top-2 right-2 flex items-center gap-2">{children}</div>)}
                </div>
            </div>
        </CodeBlockContext.Provider>);
};
exports.CodeBlock = (0, react_1.memo)(CodeBlockComponent);
const CodeBlockCopyButton = ({ onCopy, onError, timeout = 2000, children, className, ...props }) => {
    const [isCopied, setIsCopied] = (0, react_1.useState)(false);
    const { code } = (0, react_1.useContext)(CodeBlockContext);
    const copyToClipboard = async () => {
        if (typeof window === 'undefined' || !navigator.clipboard.writeText) {
            onError?.(new Error('Clipboard API not available'));
            return;
        }
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            onCopy?.();
            setTimeout(() => setIsCopied(false), timeout);
        }
        catch (error) {
            onError?.(error);
        }
    };
    const Icon = isCopied ? lucide_react_1.CheckIcon : lucide_react_1.CopyIcon;
    return (<button_1.Button className={(0, utils_1.cn)('shrink-0', className)} onClick={copyToClipboard} size="icon" variant="ghost" {...props}>
            {children ?? <Icon size={14}/>}
        </button_1.Button>);
};
exports.CodeBlockCopyButton = CodeBlockCopyButton;
//# sourceMappingURL=code-block.js.map