"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotFound;
const link_1 = __importDefault(require("next/link"));
const framer_motion_1 = require("framer-motion");
const website_layout_1 = require("./_components/website-layout");
const illustrations_1 = require("./_components/landing-page/illustrations");
function NotFound() {
    return (<website_layout_1.WebsiteLayout>
            <main className="relative min-h-screen w-full overflow-hidden">
                {/* Giant Onlook Seal - positioned to overflow top */}
                <framer_motion_1.motion.div className="absolute left-1/2 -translate-x-1/2 -top-[35vh] pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}>
                    <illustrations_1.Illustrations.OnlookLogoSeal className="w-[90vw] h-[90vw] max-w-[1000px] max-h-[1000px] text-foreground-primary/10"/>
                </framer_motion_1.motion.div>

                {/* Content - centered in viewport */}
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full p-4 text-center pt-24">
                    <div className="max-w-md space-y-6 mt-[15vh]">
                        {/* Title and subtitle */}
                        <framer_motion_1.motion.div className="space-y-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
                            <h1 className="text-6xl font-light tracking-tight text-foreground-primary">404</h1>
                            <p className="text-xl text-foreground-tertiary">
                                Seems like you ventured somewhere unknown on your journey. Let us help you find your way.
                            </p>
                        </framer_motion_1.motion.div>

                        {/* Home button */}
                        <framer_motion_1.motion.div className="flex justify-center pt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}>
                            <link_1.default href="/" className="inline-flex items-center rounded-md border border-foreground-primary/20 px-6 py-3 text-sm font-medium text-foreground-primary hover:bg-foreground-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors">
                                Back to home
                            </link_1.default>
                        </framer_motion_1.motion.div>
                    </div>
                </div>
            </main>
        </website_layout_1.WebsiteLayout>);
}
//# sourceMappingURL=not-found.js.map