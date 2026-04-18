"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const parse_1 = require("../electron/main/bun/parse");
(0, bun_test_1.describe)('replaceCommand', () => {
    (0, bun_test_1.it)('should handle simple commands without quotes', () => {
        const result = (0, parse_1.replaceCommand)('echo hello world', 'newecho');
        (0, bun_test_1.expect)(result).toEqual('echo hello world');
    });
    (0, bun_test_1.it)('should handle quoted arguments', () => {
        const result = (0, parse_1.replaceCommand)('npm "hello world" \'another quote\'', 'newecho');
        (0, bun_test_1.expect)(result).toEqual("newecho 'hello world' 'another quote'");
    });
    (0, bun_test_1.it)('should replace package manager commands', () => {
        const result = (0, parse_1.replaceCommand)('npm install express', 'bun');
        (0, bun_test_1.expect)(result).toEqual('bun install express');
    });
    (0, bun_test_1.it)('should combine command args with additional args', () => {
        const result = (0, parse_1.replaceCommand)('npm install express --save', 'bun');
        (0, bun_test_1.expect)(result).toEqual('bun install express --save');
    });
    (0, bun_test_1.it)('should handle empty command string', () => {
        const result = (0, parse_1.replaceCommand)('', 'bun');
        (0, bun_test_1.expect)(result).toEqual("''");
    });
    (0, bun_test_1.it)('should handle mixed quoted and unquoted arguments', () => {
        const result = (0, parse_1.replaceCommand)('npm install "package name" --save', 'bun');
        (0, bun_test_1.expect)(result).toEqual("bun install 'package name' --save");
    });
});
//# sourceMappingURL=bun.test.js.map