"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hero = Hero;
const react_1 = require("react");
const react_2 = require("motion/react");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const constants_1 = require("@/utils/constants");
const fonts_1 = require("../../fonts");
const create_error_1 = require("./create-error");
const high_demand_1 = require("./high-demand");
const mobile_email_capture_1 = require("./mobile-email-capture");
const unicorn_background_1 = require("./unicorn-background");
function Hero() {
    const [isShortScreen, setIsShortScreen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const checkScreenHeight = () => {
            setIsShortScreen(window.innerHeight < 700);
        };
        checkScreenHeight();
        window.addEventListener('resize', checkScreenHeight);
        return () => window.removeEventListener('resize', checkScreenHeight);
    }, []);
    return (<div className="relative flex h-full w-full flex-col items-center text-center text-lg">
            <unicorn_background_1.UnicornBackground />
            {/* pointer-events-none allows mouse events to pass through to the canvas behind */}
            <div className="pointer-events-none mb-42 flex h-full w-full flex-col items-center justify-center gap-10 pt-12">
                <div className="relative z-20 flex flex-col items-center gap-3 pt-8 pb-2">
                    {!isShortScreen && (<react_2.motion.div className="relative z-20 mb-6 flex flex-col items-center gap-3 pt-4 pb-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.2, ease: 'easeOut' }}>
                            <a href="https://www.ycombinator.com/companies/onlook/jobs/e4gHv1n-founding-engineer-fullstack" target="_blank" rel="noopener noreferrer" className="pointer-events-auto hover:bg-foreground-secondary/20 border-foreground-secondary/20 text-foreground-secondary inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs backdrop-blur-sm transition-all duration-200 hover:scale-102">
                                We're hiring engineers
                                <icons_1.Icons.ArrowRight className="h-4 w-4"/>
                            </a>
                        </react_2.motion.div>)}
                    <react_2.motion.h1 className="text-center text-6xl !leading-[0.9] leading-tight font-light" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}>
                        Cursor for
                        <br />
                        <span className={`font-normal italic ${fonts_1.vujahdayScript.className} ml-1 text-[4.6rem] leading-[1.0]`}>
                            Designers
                        </span>
                    </react_2.motion.h1>
                    <react_2.motion.p className="text-foreground-secondary mt-2 max-w-xl text-center text-lg text-balance" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }} style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}>
                        Design with your real components.
                        <br />
                        Ship PRs, not prototypes.
                    </react_2.motion.p>
                    <high_demand_1.HighDemand />
                    <create_error_1.CreateError />
                </div>
                <div className="pointer-events-auto relative z-20 hidden flex-row items-center gap-4 sm:flex">
                    <react_2.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}>
                        <button_1.Button asChild className="bg-foreground-primary text-background-primary hover:bg-foreground-hover">
                            <a href={constants_1.ExternalRoutes.BOOK_DEMO} target="_blank" rel="noopener noreferrer">
                                Book a Demo
                                <icons_1.Icons.ArrowRight className="h-4 w-4"/>
                            </a>
                        </button_1.Button>
                    </react_2.motion.div>
                </div>
                <div className="pointer-events-auto w-full flex justify-center">
                    <mobile_email_capture_1.MobileEmailCapture />
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=index.js.map