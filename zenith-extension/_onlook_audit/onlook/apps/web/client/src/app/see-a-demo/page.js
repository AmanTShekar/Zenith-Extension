"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DemoOnlyPage;
const constants_1 = require("@/utils/constants");
const client_1 = require("@/utils/supabase/client");
const telemetry_1 = require("@/utils/telemetry");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const navigation_1 = require("next/navigation");
function DemoOnlyPage() {
    const router = (0, navigation_1.useRouter)();
    const handleGoHome = () => {
        router.push(constants_1.Routes.HOME);
    };
    const handleSignOut = async () => {
        const supabase = (0, client_1.createClient)();
        void (0, telemetry_1.resetTelemetry)();
        await supabase.auth.signOut();
        router.push(constants_1.Routes.HOME);
    };
    return (<div className="flex h-screen w-screen items-center justify-center px-6 lg:px-12">
            <button aria-label="Open help" className="fixed bottom-4 left-4 w-8 h-8 rounded-full flex items-center justify-center text-foreground-tertiary hover:text-foreground-secondary bg-background-secondary hover:bg-background-tertiary transition-colors" onClick={() => void (0, telemetry_1.openFeedbackWidget)()}>
                <icons_1.Icons.QuestionMarkCircled className="w-4 h-4"/>
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl w-full items-center">
                {/* Left column - Content */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-4xl font-thin">
                            Onboard to Onlook
                        </h1>
                        <p className="text-foreground-secondary text-regular max-w-lg text-balance">
                            Get the most out of Onlook with a personalized onboarding session. Book a demo with our team to get started, or{' '}
                            <a href="https://github.com/onlook-dev/onlook" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                browse our repo
                            </a>
                            {' '}to self-host.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <button_1.Button asChild size="lg" className="bg-foreground-primary text-background-primary hover:bg-foreground-hover">
                            <a href={constants_1.ExternalRoutes.BOOK_DEMO} target="_blank" rel="noopener noreferrer">
                                Book a Demo
                            </a>
                        </button_1.Button>
                        <button_1.Button asChild variant="outline" size="lg">
                            <a href={constants_1.ExternalRoutes.DOCS} target="_blank" rel="noopener noreferrer">
                                View Docs
                            </a>
                        </button_1.Button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-border">
                        <p className="text-sm text-foreground-tertiary">
                            Already have an account?{' '}
                            <button onClick={handleSignOut} className="text-primary hover:underline">
                                Sign out and try a different email
                            </button>
                        </p>
                    </div>
                </div>

                {/* Right column - Docs placeholder */}
                <div className="hidden lg:flex flex-col items-start justify-start bg-background-secondary rounded-lg h-[500px] border border-border overflow-hidden relative group cursor-pointer" onClick={() => window.open('https://docs.onlook.com', '_blank', 'noopener,noreferrer')}>
                    <div className="w-full bg-background-primary rounded-tl-lg relative left-20 top-20 overflow-hidden transition-all duration-300 group-hover:scale-102">
                        <img src="/assets/demo-docs.png" alt="Demo Only Mockup" className="w-full h-auto transition-opacity duration-300 group-hover:opacity-40"/>
                    </div>
                    {/* Hover overlay with button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button_1.Button variant="secondary" size="lg" className="bg-background-primary hover:bg-background-tertiary" onClick={(e) => {
            e.stopPropagation();
            window.open('https://docs.onlook.com', '_blank', 'noopener,noreferrer');
        }}>
                            <span className="flex items-center gap-2">
                                View Docs
                                <icons_1.Icons.ExternalLink className="w-4 h-4"/>
                            </span>
                        </button_1.Button>
                    </div>
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=page.js.map