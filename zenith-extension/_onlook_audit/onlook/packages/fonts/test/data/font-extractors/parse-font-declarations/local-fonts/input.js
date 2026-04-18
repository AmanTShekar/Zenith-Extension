"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandFont = exports.anotherFont = exports.customFont = void 0;
const local_1 = __importDefault(require("next/font/local"));
exports.customFont = (0, local_1.default)({
    src: [
        { path: './fonts/custom-regular.woff2', weight: '400', style: 'normal' },
        { path: './fonts/custom-bold.woff2', weight: '700', style: 'normal' },
        { path: './fonts/custom-italic.woff2', weight: '400', style: 'italic' },
    ],
    variable: '--font-custom',
    display: 'swap',
});
exports.anotherFont = (0, local_1.default)({
    src: './fonts/another.woff2',
    variable: '--font-another',
    display: 'swap',
});
exports.brandFont = (0, local_1.default)({
    src: [
        { path: './fonts/brand-light.woff2', weight: '300', style: 'normal' },
        { path: './fonts/brand-regular.woff2', weight: '400', style: 'normal' },
    ],
    variable: '--font-brand',
});
//# sourceMappingURL=input.js.map