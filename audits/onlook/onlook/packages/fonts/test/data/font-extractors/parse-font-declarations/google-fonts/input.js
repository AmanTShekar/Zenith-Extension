"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openSans = exports.roboto = exports.inter = void 0;
const google_1 = require("next/font/google");
exports.inter = (0, google_1.Inter)({
    subsets: ['latin'],
    weight: ['400', '700'],
    style: ['normal'],
    variable: '--font-inter',
    display: 'swap',
});
exports.roboto = (0, google_1.Roboto)({
    subsets: ['latin', 'latin-ext'],
    weight: ['300', '400', '500', '700'],
    style: ['normal', 'italic'],
    variable: '--font-roboto',
    display: 'swap',
});
exports.openSans = (0, google_1.Open_Sans)({
    subsets: ['latin'],
    weight: ['400', '600'],
    variable: '--font-open-sans',
});
//# sourceMappingURL=input.js.map