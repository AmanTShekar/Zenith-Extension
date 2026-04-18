"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalBuffer = void 0;
exports.compareErrors = compareErrors;
exports.shouldIgnoreMessage = shouldIgnoreMessage;
exports.isErrorMessage = isErrorMessage;
exports.isSuccessMessage = isSuccessMessage;
const strip_ansi_1 = __importDefault(require("strip-ansi"));
function compareErrors(a, b) {
    if (a.sourceId === b.sourceId && a.content === b.content) {
        return true;
    }
    return false;
}
function shouldIgnoreMessage(message) {
    if (message.startsWith('<w>')) {
        return true;
    }
    return false;
}
function isErrorMessage(data) {
    // Critical CLI errors
    const errorPatterns = [
        // Next.js errors
        'Syntax Error',
        'Reference Error',
        'Type Error',
        'command not found',
        'ENOENT:',
        'fatal:',
        'error:',
        // Critical Node.js errors
        'TypeError',
        'ReferenceError',
        'SyntaxError',
        'Cannot find module',
        'Module not found',
        // Critical React/Next.js errors
        'Failed to compile',
        'Build failed',
        'Invalid hook call',
        'Invalid configuration',
        'Parsing ecmascript source code failed',
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
        errorFound = true;
    }
    return errorFound;
}
function isSuccessMessage(data) {
    // Strict regex patterns for Next.js success scenarios
    const successRegexPatterns = [
        // Next.js dev server ready patterns
        /Local:\s+http:\/\/localhost:\d+/i,
        /Ready in \d+(\.\d+)?(ms|s)/i,
        /Compiled successfully in \d+(\.\d+)?(ms|s)/i,
        // HTTP method success responses for any route
        /(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+\/[^\s]*\s+(200|201|204|304)/i,
        // Next.js build success patterns
        /Build completed in \d+(\.\d+)?(ms|s)/i,
        /Export completed/i,
        /Static generation complete/i,
        // Webpack compilation success
        /webpack compiled with \d+ warnings?/i,
        /webpack compiled successfully/i,
    ];
    // Strict string patterns that must match exactly
    const exactPatterns = [
        'compiled successfully',
        'ready - started server on',
        'event - compiled successfully',
    ];
    // Check regex patterns
    if (successRegexPatterns.some((regex) => regex.test(data))) {
        return true;
    }
    // Check exact string patterns (case insensitive)
    return exactPatterns.some((pattern) => data.toLowerCase().includes(pattern.toLowerCase()));
}
// Stateful buffer for terminal output
class TerminalBuffer {
    buffer = [];
    maxLines;
    errorCallback;
    successCallback;
    constructor(maxLines = 20) {
        this.maxLines = maxLines;
    }
    /**
     * Register a callback to be called when an error is detected.
     */
    onError(callback) {
        this.errorCallback = callback;
    }
    /**
     * Register a callback to be called when a success is detected (buffer is cleared).
     */
    onSuccess(callback) {
        this.successCallback = callback;
    }
    /**
     * Add a new line to the buffer and process for errors/success.
     */
    addLine(line) {
        const rawMessage = (0, strip_ansi_1.default)(line);
        this.buffer.push(rawMessage);
        if (this.buffer.length > this.maxLines) {
            this.buffer.shift();
        }
        // Check for error in the buffer
        if (this.buffer.some(isErrorMessage)) {
            if (this.errorCallback) {
                this.errorCallback([...this.buffer]);
            }
        }
        // Check for success in the buffer
        if (this.buffer.some(isSuccessMessage)) {
            this.clear();
            if (this.successCallback) {
                this.successCallback();
            }
        }
    }
    /**
     * Clear the buffer.
     */
    clear() {
        this.buffer = [];
    }
    /**
     * Get the current buffer contents.
     */
    getBuffer() {
        return [...this.buffer];
    }
}
exports.TerminalBuffer = TerminalBuffer;
//# sourceMappingURL=errors.js.map