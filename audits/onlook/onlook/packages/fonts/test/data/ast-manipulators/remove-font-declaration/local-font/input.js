"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.anotherFont = exports.customFont = exports.inter = void 0;
const google_1 = require("next/font/google");
const local_1 = __importDefault(require("next/font/local"));
exports.inter = (0, google_1.Inter)({
    subsets: ['latin'],
    weight: ['400', '700'],
    style: ['normal'],
    variable: '--font-inter',
    display: 'swap',
});
exports.customFont = (0, local_1.default)({
    src: [
        { path: './fonts/custom-regular.woff2', weight: '400', style: 'normal' },
        { path: './fonts/custom-bold.woff2', weight: '700', style: 'normal' },
    ],
    variable: '--font-custom',
    display: 'swap',
});
exports.anotherFont = (0, local_1.default)({
    src: './fonts/another.woff2',
    variable: '--font-another',
    display: 'swap',
});
//# sourceMappingURL=input.js.map