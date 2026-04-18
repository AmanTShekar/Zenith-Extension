"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandFont = exports.roboto = exports.inter = void 0;
exports.default = RootLayout;
const react_1 = __importDefault(require("react"));
const google_1 = require("next/font/google");
const local_1 = __importDefault(require("next/font/local"));
exports.inter = (0, google_1.Inter)({
    subsets: ['latin'],
    weight: ['400', '700'],
    style: ['normal'],
    variable: '--font-inter',
});
exports.roboto = (0, google_1.Roboto)({
    subsets: ['latin'],
    weight: ['300', '400'],
    variable: '--font-roboto',
});
exports.brandFont = (0, local_1.default)({
    src: [
        { path: './fonts/brand-regular.woff2', weight: '400', style: 'normal' },
        { path: './fonts/brand-bold.woff2', weight: '700', style: 'normal' },
    ],
    variable: '--font-brand',
});
function RootLayout({ children }) {
    return (<html lang="en" className={`${exports.inter.variable} ${exports.roboto.variable} ${exports.brandFont.variable}`}>
            <head>
                <title>My App</title>
            </head>
            <body className={`${exports.inter.className} antialiased`}>
                <main className={exports.roboto.className}>
                    <header className={exports.brandFont.className}>
                        <h1>Welcome</h1>
                    </header>
                    {children}
                </main>
            </body>
        </html>);
}
//# sourceMappingURL=input.js.map