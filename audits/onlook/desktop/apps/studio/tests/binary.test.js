"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const bun_test_1 = require("bun:test");
const istextorbinary_1 = require("istextorbinary");
(0, bun_test_1.describe)('istextorbinary', () => {
    (0, bun_test_1.test)('should identify text files', () => {
        (0, bun_test_1.expect)((0, istextorbinary_1.isText)('test.txt')).toBe(true);
        (0, bun_test_1.expect)((0, istextorbinary_1.isText)('test.js')).toBe(true);
        (0, bun_test_1.expect)((0, istextorbinary_1.isText)('test.html')).toBe(true);
        (0, bun_test_1.expect)((0, istextorbinary_1.isText)('test.css')).toBe(true);
    });
    (0, bun_test_1.test)('should identify binary files', () => {
        (0, bun_test_1.expect)((0, istextorbinary_1.isBinary)('test.png')).toBe(true);
        (0, bun_test_1.expect)((0, istextorbinary_1.isBinary)('test.jpg')).toBe(true);
        (0, bun_test_1.expect)((0, istextorbinary_1.isBinary)('test.pdf')).toBe(true);
    });
    (0, bun_test_1.test)('should identify text content', () => {
        const textContent = Buffer.from('Hello, world!');
        (0, bun_test_1.expect)((0, istextorbinary_1.isText)(null, textContent)).toBe(true);
    });
    (0, bun_test_1.test)('should identify binary content', () => {
        // Create a small binary buffer with some non-text bytes
        const binaryContent = Buffer.from([0xff, 0x00, 0x00, 0xff]);
        (0, bun_test_1.expect)((0, istextorbinary_1.isBinary)(null, binaryContent)).toBe(true);
    });
    (0, bun_test_1.test)('should handle both filename and content together', () => {
        const textContent = Buffer.from('Hello, world!');
        const binaryContent = Buffer.from([0xff, 0x00, 0x00, 0xff]);
        // Test text file with text content
        (0, bun_test_1.expect)((0, istextorbinary_1.isText)('test.txt', textContent)).toBe(true);
        // Test binary file with binary content
        (0, bun_test_1.expect)((0, istextorbinary_1.isBinary)('test.png', binaryContent)).toBe(true);
        // Test binary file with text content
        (0, bun_test_1.expect)((0, istextorbinary_1.isBinary)('test.png', textContent)).toBe(true);
        // Test text file with binary content
        (0, bun_test_1.expect)((0, istextorbinary_1.isText)('test.txt', binaryContent)).toBe(true);
    });
});
//# sourceMappingURL=binary.test.js.map