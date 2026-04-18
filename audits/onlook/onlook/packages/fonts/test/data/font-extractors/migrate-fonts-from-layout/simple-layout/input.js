"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customFont = exports.inter = void 0;
exports.default = Layout;
const react_1 = __importDefault(require("react"));
const google_1 = require("next/font/google");
const local_1 = __importDefault(require("next/font/local"));
exports.inter = (0, google_1.Inter)({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-inter',
});
exports.customFont = (0, local_1.default)({
    src: './fonts/custom.woff2',
    variable: '--font-custom',
});
function Layout({ children }) {
    return (<html className={`${exports.inter.variable} ${exports.customFont.variable}`}>
            <body className={exports.inter.className}>{children}</body>
        </html>);
}
//# sourceMappingURL=input.js.map