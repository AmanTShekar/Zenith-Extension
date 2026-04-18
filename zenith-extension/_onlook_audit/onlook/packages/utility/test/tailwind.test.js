"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const tailwind_1 = require("../src/tailwind");
const translateWidth = (val) => {
    const res = (0, tailwind_1.CssToTailwindTranslator)(`.a{width:${val};}`);
    return res.data[0]?.resultVal || '';
};
(0, bun_test_1.describe)('isUnit validation via width property', () => {
    (0, bun_test_1.it)('rejects empty values', () => {
        (0, bun_test_1.expect)(translateWidth('')).toBe('');
    });
    (0, bun_test_1.it)('rejects invalid unit strings', () => {
        (0, bun_test_1.expect)(translateWidth('abc')).toBe('');
    });
    (0, bun_test_1.it)('accepts px units', () => {
        (0, bun_test_1.expect)(translateWidth('10px')).toBe('w-[10px]');
    });
    (0, bun_test_1.it)('accepts numeric values', () => {
        (0, bun_test_1.expect)(translateWidth('10')).toBe('w-[10]');
    });
    (0, bun_test_1.it)('converts known percentages', () => {
        (0, bun_test_1.expect)(translateWidth('50%')).toBe('w-1/2');
    });
});
//# sourceMappingURL=tailwind.test.js.map