"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Document;
const script_1 = __importDefault(require("next/script"));
const react_1 = __importDefault(require("react"));
// Mock components
const ThemeProvider = (props) => <>{props.children}</>;
const Navbar = (props) => <header>Navbar</header>;
const Footer = (props) => <footer>Footer</footer>;
function Document() {
    return (<html lang="en" suppressHydrationWarning data-oid="o7v_4be">
            <head data-oid="795jc-7">
                <script_1.default type="module" src="https://cdn.jsdelivr.net/gh/onlook-dev/onlook@main/apps/web/preload/dist/index.js" data-oid="m4pfglr"/>


                <script_1.default type="module" src="https://cdn.jsdelivr.net/gh/onlook-dev/web@latest/apps/web/preload/dist/index.js" data-oid="yujojk-"/>

            </head>
            <body className={'h-screen antialiased'} data-oid="lb.txaa">
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange data-oid="3tbrd3_">

                    <Navbar data-oid="ctrg0y3"/>
                    <main className="" data-oid="j990_9w">
                        {/* @ts-ignore */}
                        {children}
                    </main>
                    <Footer data-oid="j7nr0na"/>
                </ThemeProvider>
            
        <script_1.default src="https://cdn.jsdelivr.net/gh/onlook-dev/onlook@d3887f2/apps/web/client/public/onlook-preload-script.js" strategy="afterInteractive" type="module" id="onlook-preload-script"></script_1.default>
      </body>
        </html>);
}
//# sourceMappingURL=expected.js.map