"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terminal = void 0;
require("@xterm/xterm/css/xterm.css");
const editor_1 = require("@/components/store/editor");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const next_themes_1 = require("next-themes");
const react_1 = require("react");
const TERMINAL_THEME = {
    LIGHT: {
        background: '#ffffff',
        foreground: '#2d2d2d',
        cursor: '#333333',
        cursorAccent: '#ffffff',
        black: '#2d2d2d',
        red: '#d64646',
        green: '#4e9a06',
        yellow: '#c4a000',
        blue: '#3465a4',
        magenta: '#75507b',
        cyan: '#06989a',
        white: '#d3d7cf',
        brightBlack: '#555753',
        brightRed: '#ef2929',
        brightGreen: '#8ae234',
        brightYellow: '#fce94f',
        brightBlue: '#729fcf',
        brightMagenta: '#ad7fa8',
        brightCyan: '#34e2e2',
        brightWhite: '#eeeeec',
        selectionBackground: '#bfbfbf',
    },
    DARK: {}, // Use default dark theme
};
exports.Terminal = (0, react_1.memo)((0, mobx_react_lite_1.observer)(({ hidden = false, terminalSessionId, branchId, isActive = true }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    // Get terminal session from the appropriate branch's sandbox
    const terminalSession = branchId
        ? editorEngine.branches.getSandboxById(branchId)?.session?.getTerminalSession(terminalSessionId)
        : editorEngine.activeSandbox?.session?.getTerminalSession(terminalSessionId);
    const containerRef = (0, react_1.useRef)(null);
    const { theme } = (0, next_themes_1.useTheme)();
    // Mount xterm to DOM
    (0, react_1.useEffect)(() => {
        if (hidden || !isActive || !containerRef.current || !terminalSession?.xterm)
            return;
        // Only open if not already attached
        if (!terminalSession.xterm.element || terminalSession.xterm.element.parentElement !== containerRef.current) {
            terminalSession.xterm.open(containerRef.current);
            // Ensure proper sizing after opening
            setTimeout(() => {
                if (terminalSession?.fitAddon && containerRef.current && !hidden && isActive) {
                    terminalSession.fitAddon.fit();
                }
            }, 100);
        }
        return () => {
            // Detach xterm from DOM on unmount (but do not dispose)
            if (terminalSession?.xterm?.element &&
                containerRef.current &&
                terminalSession?.xterm?.element?.parentElement === containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [terminalSessionId, terminalSession, branchId, hidden, isActive]);
    (0, react_1.useEffect)(() => {
        if (terminalSession?.xterm) {
            terminalSession.xterm.options.theme = theme === 'light' ? TERMINAL_THEME.LIGHT : TERMINAL_THEME.DARK;
        }
    }, [theme, terminalSession]);
    (0, react_1.useEffect)(() => {
        if (!hidden && isActive && terminalSession?.xterm) {
            setTimeout(() => {
                terminalSession.xterm?.focus();
                // Fit terminal when it becomes visible
                if (terminalSession.fitAddon) {
                    terminalSession.fitAddon.fit();
                }
            }, 100);
        }
    }, [hidden, isActive, terminalSession]);
    // Handle container resize
    (0, react_1.useEffect)(() => {
        if (!containerRef.current || !terminalSession?.fitAddon || hidden || !isActive)
            return;
        const resizeObserver = new ResizeObserver(() => {
            if (!hidden && isActive) {
                terminalSession.fitAddon?.fit();
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => {
            resizeObserver.disconnect();
        };
    }, [terminalSession, hidden, isActive]);
    return (<div ref={containerRef} className={(0, utils_1.cn)('h-full w-full p-2 transition-opacity duration-200', hidden ? 'opacity-0' : 'opacity-100 delay-300')}/>);
}));
//# sourceMappingURL=terminal.js.map