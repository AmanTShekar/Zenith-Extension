"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("@/styles/globals.css");
require("@onlook/ui/globals.css");
const rb2b_loader_1 = __importDefault(require("@/components/rb2b-loader"));
const telemetry_provider_1 = require("@/components/telemetry-provider");
const env_1 = require("@/env");
const use_feature_flags_1 = require("@/hooks/use-feature-flags");
const react_1 = require("@/trpc/react");
const sonner_1 = require("@onlook/ui/sonner");
const next_intl_1 = require("next-intl");
const server_1 = require("next-intl/server");
const google_1 = require("next/font/google");
const script_1 = __importDefault(require("next/script"));
const theme_1 = require("./_components/theme");
const auth_context_1 = require("./auth/auth-context");
const seo_1 = require("./seo");
const isProduction = env_1.env.NODE_ENV === 'production';
exports.metadata = {
    title: 'Onlook – Cursor for Designers',
    description: 'The power of Cursor for your own website. Onlook lets you edit your React website and write your changes back to code in real-time. Iterate and experiment with AI.',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
    openGraph: {
        url: 'https://onlook.com/',
        type: 'website',
        siteName: 'Onlook',
        title: 'Onlook – Cursor for Designers',
        description: 'The power of Cursor for your own website. Onlook lets you edit your React website and write your changes back to code in real-time. Iterate and experiment with AI.',
        images: [
            {
                url: 'https://framerusercontent.com/images/ScnnNT7JpmUya7afqGAets8.png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@onlookdev',
        creator: '@onlookdev',
        title: 'Onlook – Cursor for Designers',
        description: 'The power of Cursor for your own website. Onlook lets you edit your React website and write your changes back to code in real-time. Iterate and experiment with AI.',
        images: [
            {
                url: 'https://framerusercontent.com/images/ScnnNT7JpmUya7afqGAets8.png',
            },
        ],
    },
};
const inter = (0, google_1.Inter)({
    subsets: ['latin'],
    variable: '--font-inter',
});
async function RootLayout({ children }) {
    const locale = await (0, server_1.getLocale)();
    return (<html lang={locale} className={inter.variable} suppressHydrationWarning>
            <head>
                <link rel="canonical" href="https://onlook.com/"/>
                <meta name="robots" content="index, follow"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo_1.organizationSchema) }}/>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo_1.faqSchema) }}/>
            </head>
            <body>
                {isProduction && (<>
                        <script_1.default src="https://z.onlook.com/cdn-cgi/zaraz/i.js" strategy="lazyOnload"/>
                        <rb2b_loader_1.default />
                    </>)}
                <react_1.TRPCReactProvider>
                    <use_feature_flags_1.FeatureFlagsProvider>
                        <telemetry_provider_1.TelemetryProvider>
                            <theme_1.ThemeProvider attribute="class" forcedTheme="dark" enableSystem disableTransitionOnChange>
                                <auth_context_1.AuthProvider>
                                    <next_intl_1.NextIntlClientProvider>
                                        {children}
                                        <sonner_1.Toaster />
                                    </next_intl_1.NextIntlClientProvider>
                                </auth_context_1.AuthProvider>
                            </theme_1.ThemeProvider>
                        </telemetry_provider_1.TelemetryProvider>
                    </use_feature_flags_1.FeatureFlagsProvider>
                </react_1.TRPCReactProvider>
            </body>
        </html>);
}
//# sourceMappingURL=layout.js.map