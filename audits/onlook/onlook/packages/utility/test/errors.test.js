"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const errors_1 = require("../src/errors");
// Known React/Next.js error messages
const reactNextErrors = [
    'Failed to compile.',
    'Build failed.',
    'Invalid hook call. Hooks can only be called inside of the body of a function component.',
    'Invalid configuration: The `output` property is not allowed in your Next.js config.',
    'error: Something went wrong in the build process.',
    'fatal: Unexpected error occurred.',
    'TypeError: Cannot read property',
    'ReferenceError: foo is not defined',
    'SyntaxError: Unexpected token',
    'Cannot find module "react"',
    'Module not found: Can\'t resolve "next"',
    'npm ERR! missing script: start',
    'yarn error Command failed.',
    'pnpm ERR! Cannot find module',
    'Missing dependencies: react, react-dom',
    'TS2304: Cannot find name',
    'TS2307: Cannot find module',
];
(0, bun_test_1.describe)('checkMessageError', () => {
    for (const msg of reactNextErrors) {
        (0, bun_test_1.it)(`should detect error for: ${msg.slice(0, 40)}...`, () => {
            (0, bun_test_1.expect)((0, errors_1.isErrorMessage)(msg)).toBe(true);
        });
    }
    (0, bun_test_1.it)('should not detect error for a normal log', () => {
        (0, bun_test_1.expect)((0, errors_1.isErrorMessage)('Server started successfully')).toBe(false);
    });
});
(0, bun_test_1.describe)('checkMessageSuccess', () => {
    (0, bun_test_1.it)('should detect success for GET / 200', () => {
        (0, bun_test_1.expect)((0, errors_1.isSuccessMessage)('GET / 200')).toBe(true);
        (0, bun_test_1.expect)((0, errors_1.isSuccessMessage)('\x1B[32mGET / 200\x1B[0m')).toBe(true); // with ANSI
    });
    (0, bun_test_1.it)('should not detect success for unrelated message', () => {
        (0, bun_test_1.expect)((0, errors_1.isSuccessMessage)('Build failed')).toBe(false);
        (0, bun_test_1.expect)((0, errors_1.isSuccessMessage)('Some random log')).toBe(false);
    });
});
(0, bun_test_1.describe)('TerminalBuffer', () => {
    (0, bun_test_1.it)('should emit error when an error message is added', (done) => {
        const buffer = new errors_1.TerminalBuffer(5);
        buffer.onError((lines) => {
            (0, bun_test_1.expect)(lines.some(errors_1.isErrorMessage)).toBe(true);
            done();
        });
        buffer.addLine('This is fine');
        buffer.addLine('Build failed.'); // triggers error
    });
    (0, bun_test_1.it)('should emit success and clear buffer when a success message is added', (done) => {
        const buffer = new errors_1.TerminalBuffer(5);
        buffer.onSuccess(() => {
            (0, bun_test_1.expect)(buffer.getBuffer().length).toBe(0);
            done();
        });
        buffer.addLine('Some log');
        buffer.addLine('GET / 200'); // triggers success
    });
    (0, bun_test_1.it)('should only keep the last N lines', () => {
        const buffer = new errors_1.TerminalBuffer(3);
        buffer.addLine('line1');
        buffer.addLine('line2');
        buffer.addLine('line3');
        buffer.addLine('line4');
        (0, bun_test_1.expect)(buffer.getBuffer()).toEqual(['line2', 'line3', 'line4']);
    });
    (0, bun_test_1.it)('should allow clearing the buffer manually', () => {
        const buffer = new errors_1.TerminalBuffer(3);
        buffer.addLine('line1');
        buffer.addLine('line2');
        buffer.clear();
        (0, bun_test_1.expect)(buffer.getBuffer()).toEqual([]);
    });
    (0, bun_test_1.it)('should not emit error for normal logs', (done) => {
        const buffer = new errors_1.TerminalBuffer(3);
        let errorEmitted = false;
        buffer.onError(() => {
            errorEmitted = true;
        });
        buffer.addLine('normal log');
        buffer.addLine('another log');
        setTimeout(() => {
            (0, bun_test_1.expect)(errorEmitted).toBe(false);
            done();
        }, 10);
    });
});
//# sourceMappingURL=errors.test.js.map