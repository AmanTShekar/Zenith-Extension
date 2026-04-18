"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poppins = exports.roboto = exports.inter = void 0;
const google_1 = require("next/font/google");
exports.inter = (0, google_1.Inter)({
    subsets: ['latin'],
    weight: ['400', '700'],
    style: ['normal'],
    variable: '--font-inter',
    display: 'swap',
});
exports.roboto = (0, google_1.Roboto)({
    subsets: ['latin'],
    weight: ['300', '400'],
    style: ['normal'],
    variable: '--font-roboto',
    display: 'swap',
});
exports.poppins = (0, google_1.Poppins)({
    subsets: ['latin'],
    weight: ['400', '600'],
    style: ['normal'],
    variable: '--font-poppins',
    display: 'swap',
});
//# sourceMappingURL=input.js.map