"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inter = void 0;
exports.default = Layout;
const react_1 = __importDefault(require("react"));
const google_1 = require("next/font/google");
exports.inter = (0, google_1.Inter)({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-inter',
});
function Layout({ children }) {
    return (<html className={`${exports.inter.variable} bg-white`}>
            <body className={`${exports.inter.className} min-h-screen text-gray-900`}>
                <div className={`container mx-auto ${exports.inter.className}`}>
                    <header className="header-style">
                        <h1 className={exports.inter.className}>Title</h1>
                    </header>
                    <main className={`main-content ${exports.inter.variable} px-4`}>{children}</main>
                </div>
            </body>
        </html>);
}
//# sourceMappingURL=input.js.map