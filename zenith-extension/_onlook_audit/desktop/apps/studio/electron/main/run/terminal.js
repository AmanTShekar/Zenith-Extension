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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@onlook/models/constants");
const run_1 = require("@onlook/models/run");
const pty = __importStar(require("node-pty"));
const os_1 = __importDefault(require("os"));
const __1 = require("..");
const bun_1 = require("../bun");
class TerminalManager {
    static instance;
    processes;
    outputHistory;
    constructor() {
        this.processes = new Map();
        this.outputHistory = new Map();
    }
    static getInstance() {
        if (!TerminalManager.instance) {
            TerminalManager.instance = new TerminalManager();
        }
        return TerminalManager.instance;
    }
    create(id, options) {
        try {
            const shell = os_1.default.platform() === 'win32' ? 'powershell.exe' : '/bin/sh';
            const ptyProcess = pty.spawn(shell, [], {
                name: 'xterm-color',
                cwd: options?.cwd,
            });
            ptyProcess.onData((data) => {
                this.checkTerminalState(data);
                this.addTerminalMessage(id, data);
            });
            this.processes.set(id, ptyProcess);
            return true;
        }
        catch (error) {
            console.error('Failed to create terminal.', error);
            return false;
        }
    }
    checkTerminalState(data) {
        if (this.shouldIgnoreCheck(data)) {
            return;
        }
        const errorFound = this.checkError(data);
        if (errorFound) {
            return;
        }
        this.checkSuccess(data);
    }
    shouldIgnoreCheck(data) {
        const ignorePatterns = ['[webpack.cache.PackFileCacheStrategy]'];
        return ignorePatterns.some((pattern) => data.toLowerCase().includes(pattern.toLowerCase()));
    }
    checkError(data) {
        // Critical CLI errors
        const errorPatterns = [
            'command not found',
            'ENOENT:',
            'fatal:',
            'error:',
            // Critical Node.js errors
            'TypeError:',
            'ReferenceError:',
            'SyntaxError:',
            'Cannot find module',
            'Module not found',
            // Critical React/Next.js errors
            'Failed to compile',
            'Build failed',
            'Invalid hook call',
            'Invalid configuration',
            // Critical Package errors
            'npm ERR!',
            'yarn error',
            'pnpm ERR!',
            'Missing dependencies',
            // Critical TypeScript errors
            'TS2304:', // Cannot find name
            'TS2307:', // Cannot find module
        ];
        let errorFound = false;
        if (errorPatterns.some((pattern) => data.toLowerCase().includes(pattern.toLowerCase()))) {
            __1.mainWindow?.webContents.send(constants_1.MainChannels.RUN_STATE_CHANGED, {
                state: run_1.RunState.ERROR,
                message: `Command error detected: ${data.trim()}`,
            });
            errorFound = true;
        }
        return errorFound;
    }
    checkSuccess(data) {
        // Strip ANSI escape codes to get plain text
        const stripAnsi = (str) => str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
        const plainText = stripAnsi(data).trim().toLowerCase();
        const successPatterns = ['get / 200'];
        if (successPatterns.some((pattern) => plainText.includes(pattern))) {
            __1.mainWindow?.webContents.send(constants_1.MainChannels.RUN_STATE_CHANGED, {
                state: run_1.RunState.RUNNING,
                message: 'Command executed successfully.',
            });
            return true;
        }
        return false;
    }
    addTerminalMessage(id, data) {
        const currentHistory = this.getHistory(id) || '';
        this.outputHistory.set(id, currentHistory + data);
        this.emitMessage(id, data);
    }
    emitMessage(id, data) {
        __1.mainWindow?.webContents.send(constants_1.MainChannels.TERMINAL_ON_DATA, {
            id,
            data,
        });
    }
    write(id, data) {
        try {
            this.processes.get(id)?.write(data);
            return true;
        }
        catch (error) {
            console.error('Failed to write to terminal.', error);
            return false;
        }
    }
    resize(id, cols, rows) {
        try {
            this.processes.get(id)?.resize(cols, rows);
            return true;
        }
        catch (error) {
            console.error('Failed to resize terminal.', error);
            return false;
        }
    }
    kill(id) {
        try {
            const process = this.processes.get(id);
            if (process) {
                process.kill();
                this.processes.delete(id);
                this.outputHistory.delete(id);
            }
            return true;
        }
        catch (error) {
            console.error('Failed to kill terminal.', error);
            return false;
        }
    }
    killAll() {
        this.processes.forEach((process) => process.kill());
        this.processes.clear();
        return true;
    }
    executeCommand(id, command) {
        try {
            const commandToExecute = (0, bun_1.getBunCommand)(command);
            const newline = os_1.default.platform() === 'win32' ? '\r\n' : '\n';
            return this.write(id, commandToExecute + newline);
        }
        catch (error) {
            console.error('Failed to execute command.', error);
            return false;
        }
    }
    getHistory(id) {
        return this.outputHistory.get(id);
    }
}
exports.default = TerminalManager.getInstance();
//# sourceMappingURL=terminal.js.map