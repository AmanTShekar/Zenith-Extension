"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customFont = exports.inter = void 0;
const google_1 = require("next/font/google");
const local_1 = __importDefault(require("next/font/local"));
exports.inter = (0, google_1.Inter)({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-inter',
});
exports.customFont = (0, local_1.default)({
    src: [
        { path: './fonts/custom-regular.woff2', weight: '400', style: 'normal' },
        { path: './fonts/custom-bold.woff2', weight: '700', style: 'normal' },
    ],
    variable: '--font-custom',
});
// This should be ignored as it's not exported
const notExported = (0, google_1.Inter)({
    subsets: ['latin'],
    weight: ['400'],
});
//# sourceMappingURL=input.js.map