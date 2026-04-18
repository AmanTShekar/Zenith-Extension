"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = Layout;
require("./global.css");
const layout_config_1 = require("@/app/layout.config");
const source_1 = require("@/lib/source");
const docs_1 = require("fumadocs-ui/layouts/docs");
const provider_1 = require("fumadocs-ui/provider");
const google_1 = require("next/font/google");
const script_1 = __importDefault(require("next/script"));
const rb2b_loader_1 = __importDefault(require("@/components/rb2b-loader"));
const geist = (0, google_1.Geist)({
    subsets: ['latin'],
    variable: '--font-geist',
});
exports.metadata = {
    metadataBase: new URL('https://docs.onlook.dev'),
    title: {
        default: 'Onlook Docs',
        template: '%s – Onlook Docs',
    },
    description: 'Official documentation for Onlook – an open-source "Cursor for Designers" that lets you visually edit React & Tailwind projects.',
    openGraph: {
        siteName: 'Onlook Docs',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        site: '@onlookdev',
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: '/',
    },
};
const docsOptions = {
    ...layout_config_1.baseOptions,
};
const isProduction = process.env.NODE_ENV === 'production';
function Layout({ children }) {
    return (<html lang="en" className={geist.variable} suppressHydrationWarning>
            <body className="flex flex-col min-h-screen">
                {isProduction && (<>
                        <script_1.default src="https://z.onlook.com/cdn-cgi/zaraz/i.js" strategy="lazyOnload"/>
                        <rb2b_loader_1.default />
                    </>)}
                <provider_1.RootProvider>
                    <docs_1.DocsLayout tree={source_1.source.pageTree} {...docsOptions}>
                        {children}
                    </docs_1.DocsLayout>
                </provider_1.RootProvider>
            </body>
        </html>);
}
//# sourceMappingURL=layout.js.map