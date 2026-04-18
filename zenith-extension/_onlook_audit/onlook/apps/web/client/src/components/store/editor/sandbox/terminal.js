"use strict";
'use client';
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
exports.CLISessionImpl = exports.CLISessionType = void 0;
const uuid_1 = require("uuid");
// Dynamic imports to avoid SSR issues
let FitAddonClass = null;
let TerminalClass = null;
var CLISessionType;
(function (CLISessionType) {
    CLISessionType["TERMINAL"] = "terminal";
    CLISessionType["TASK"] = "task";
})(CLISessionType || (exports.CLISessionType = CLISessionType = {}));
class CLISessionImpl {
    name;
    type;
    provider;
    errorManager;
    id;
    terminal;
    task;
    xterm;
    fitAddon;
    constructor(name, type, provider, errorManager) {
        this.name = name;
        this.type = type;
        this.provider = provider;
        this.errorManager = errorManager;
        this.id = (0, uuid_1.v4)();
        this.terminal = null;
        this.task = null;
        // Initialize xterm and fitAddon lazily
        this.xterm = null;
        this.fitAddon = null;
    }
    async ensureXTermLibraries() {
        if (!FitAddonClass || !TerminalClass) {
            try {
                const [fitAddonModule, xtermModule] = await Promise.all([
                    Promise.resolve().then(() => __importStar(require('@xterm/addon-fit'))),
                    Promise.resolve().then(() => __importStar(require('@xterm/xterm')))
                ]);
                FitAddonClass = fitAddonModule.FitAddon;
                TerminalClass = xtermModule.Terminal;
            }
            catch (error) {
                console.error('Failed to load xterm libraries:', error);
                throw new Error('Failed to load terminal libraries');
            }
        }
    }
    async initTerminal() {
        try {
            await this.ensureXTermLibraries();
            // Initialize xterm and fitAddon
            this.fitAddon = new FitAddonClass();
            this.xterm = this.createXTerm();
            this.xterm.loadAddon(this.fitAddon);
            const { terminal } = await this.provider.createTerminal({});
            if (!terminal) {
                console.error('Failed to create terminal');
                return;
            }
            this.terminal = terminal;
            terminal.onOutput((data) => {
                this.xterm?.write(data);
            });
            this.xterm.onData((data) => {
                terminal.write(data);
            });
            // Handle terminal resize
            this.xterm.onResize(({ cols, rows }) => {
                // Check if terminal has resize method
                if ('resize' in terminal && typeof terminal.resize === 'function') {
                    terminal.resize(cols, rows);
                }
            });
            await terminal.open();
            // Set initial terminal size and environment
            if (this.xterm.cols && this.xterm.rows && 'resize' in terminal && typeof terminal.resize === 'function') {
                terminal.resize(this.xterm.cols, this.xterm.rows);
            }
        }
        catch (error) {
            console.error('Failed to initialize terminal:', error);
            this.terminal = null;
        }
    }
    async initTask() {
        try {
            await this.ensureXTermLibraries();
            // Initialize xterm and fitAddon
            this.fitAddon = new FitAddonClass();
            this.xterm = this.createXTerm();
            this.xterm.loadAddon(this.fitAddon);
            const task = await this.createDevTaskTerminal();
            if (!task) {
                console.error('Failed to create task');
                return;
            }
            this.task = task;
            const output = await task.open();
            this.xterm.write(output);
            this.errorManager.processMessage(output);
            task.onOutput((data) => {
                this.xterm?.write(data);
                this.errorManager.processMessage(data);
            });
        }
        catch (error) {
            console.error('Failed to initialize task:', error);
        }
    }
    createXTerm() {
        const terminal = new TerminalClass({
            cursorBlink: true,
            fontSize: 12,
            fontFamily: 'monospace',
            convertEol: false,
            allowTransparency: true,
            disableStdin: false,
            allowProposedApi: true,
            macOptionIsMeta: true,
            altClickMovesCursor: false,
            windowsMode: false,
            scrollback: 1000,
            screenReaderMode: false,
            fastScrollModifier: 'alt',
            fastScrollSensitivity: 5,
        });
        // Override write method to handle Claude Code's redrawing patterns
        const originalWrite = terminal.write.bind(terminal);
        terminal.write = (data, callback) => {
            if (typeof data === 'string') {
                // Detect Claude Code's redraw pattern: multiple line clears with cursor movement
                const lineUpPattern = /(\x1b\[2K\x1b\[1A)+\x1b\[2K\x1b\[G/;
                if (lineUpPattern.test(data)) {
                    // Count how many lines are being cleared
                    const matches = data.match(/\x1b\[1A/g);
                    const lineCount = matches ? matches.length : 0;
                    // Clear the number of lines being redrawn plus some buffer
                    for (let i = 0; i <= lineCount + 2; i++) {
                        terminal.write('\x1b[2K\x1b[1A\x1b[2K');
                    }
                    terminal.write('\x1b[G'); // Go to beginning of line
                    // Extract just the content after the clearing commands
                    const contentMatch = /\x1b\[G(.+)$/s.exec(data);
                    if (contentMatch?.[1]) {
                        return originalWrite(contentMatch[1], callback);
                    }
                }
            }
            return originalWrite(data, callback);
        };
        return terminal;
    }
    async createDevTaskTerminal() {
        const { task } = await this.provider.getTask({
            args: {
                id: 'dev',
            },
        });
        if (!task) {
            console.error('No dev task found');
            return;
        }
        return task;
    }
    dispose() {
        if (this.xterm) {
            this.xterm.dispose();
        }
        if (this.terminal) {
            try {
                this.terminal.kill();
            }
            catch (error) {
                console.warn('Failed to kill terminal during disposal:', error);
            }
        }
    }
}
exports.CLISessionImpl = CLISessionImpl;
//# sourceMappingURL=terminal.js.map