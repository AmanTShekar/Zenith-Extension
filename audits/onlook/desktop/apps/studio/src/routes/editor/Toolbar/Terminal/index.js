"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const ThemeProvider_1 = require("@/components/ThemeProvider");
const constants_1 = require("@onlook/models/constants");
const utils_1 = require("@onlook/ui/utils");
const xterm_1 = require("@xterm/xterm");
require("@xterm/xterm/css/xterm.css");
const mobx_react_lite_1 = require("mobx-react-lite");
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
const Terminal = (0, mobx_react_lite_1.observer)(({ hidden = false }) => {
    const terminalRef = (0, react_1.useRef)(null);
    const [terminal, setTerminal] = (0, react_1.useState)(null);
    const projectsManager = (0, Context_1.useProjectsManager)();
    const runner = projectsManager.runner;
    const { theme } = (0, ThemeProvider_1.useTheme)();
    (0, react_1.useEffect)(() => {
        if (terminal) {
            terminal.options.theme = theme === 'light' ? TERMINAL_THEME.LIGHT : TERMINAL_THEME.DARK;
        }
    }, [theme]);
    (0, react_1.useEffect)(() => {
        if (!terminalRef.current || !runner || terminal) {
            return;
        }
        const { term, terminalDataListener, stateListener } = initTerminal(runner, terminalRef.current);
        setTerminal(term);
        return () => {
            term.dispose();
            setTerminal(null);
            window.api.removeListener(constants_1.MainChannels.TERMINAL_ON_DATA, terminalDataListener);
            window.api.removeListener(constants_1.MainChannels.RUN_STATE_CHANGED, stateListener);
        };
    }, []);
    function initTerminal(runner, container) {
        const term = new xterm_1.Terminal({
            cursorBlink: true,
            fontSize: 12,
            fontFamily: 'monospace',
            theme: theme === 'light' ? TERMINAL_THEME.LIGHT : TERMINAL_THEME.DARK,
            convertEol: true,
            allowTransparency: true,
            disableStdin: false,
            allowProposedApi: true,
            macOptionIsMeta: true,
        });
        term.open(container);
        const { cols, rows } = term;
        runner.resizeTerminal(cols, rows);
        runner.getHistory().then((history) => {
            if (history) {
                term.write(history);
            }
        });
        // Set up event listeners
        term.onData((data) => {
            runner.handleTerminalInput(data);
        });
        term.onResize(({ cols, rows }) => {
            runner.resizeTerminal(cols, rows);
        });
        const terminalDataListener = (message) => {
            if (message.id === projectsManager.project?.id) {
                term.write(message.data);
            }
        };
        const stateListener = ({ state, message }) => {
            term.write('\x1b[96m' + message + '\x1b[0m\n');
        };
        window.api.on(constants_1.MainChannels.TERMINAL_ON_DATA, terminalDataListener);
        window.api.on(constants_1.MainChannels.RUN_STATE_CHANGED, stateListener);
        return { term, terminalDataListener, stateListener };
    }
    return (<div className={(0, utils_1.cn)('bg-background rounded-lg overflow-auto transition-all duration-300', hidden ? 'h-0 w-0 invisible' : 'h-[22rem] w-[37rem]')}>
            <div ref={terminalRef} className={(0, utils_1.cn)('h-full w-full p-2 transition-opacity duration-200', hidden ? 'opacity-0' : 'opacity-100 delay-300')}/>
        </div>);
});
exports.default = Terminal;
//# sourceMappingURL=index.js.map