"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTASection = CTASection;
const button_1 = require("@onlook/ui/button");
const navigation_1 = require("next/navigation");
function CTASection({ href, onClick, ctaText = "Ready to stop rebuilding?\nYour design system, on a canvas.", buttonText = "Book a Demo", showSubtext = true } = {}) {
    const router = (0, navigation_1.useRouter)();
    const handleGetStartedClick = () => {
        if (onClick) {
            onClick();
        }
        else if (href) {
            // Check if href is external (starts with http)
            if (href.startsWith('http')) {
                window.open(href, '_blank', 'noopener,noreferrer');
            }
            else {
                // Navigate to the specified href
                router.push(href);
            }
        }
        else {
            // Default behavior: scroll to hero section on homepage
            const heroSection = document.getElementById('hero');
            if (heroSection) {
                heroSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    };
    const handleHomepageNavigation = () => {
        // Navigate to homepage with hash to trigger scroll to hero
        router.push('/');
    };
    return (<div className="w-full max-w-6xl mx-auto py-32 px-8 flex flex-col items-right gap-24">
            <div className="flex-1 flex flex-col items-end justify-center text-right">
                <h2 className="text-foreground-primary text-5xl md:text-6xl leading-[1.05] font-light mb-8 max-w-4xl text-balance">
                    {ctaText.split('\n').map((line, index) => (<span key={index}>
                            {line}
                            {index < ctaText.split('\n').length - 1 && <br />}
                        </span>))}
                </h2>
                <div className="flex flex-row items-center justify-end gap-3 w-full">
                    <button_1.Button variant="secondary" size="lg" className="p-6 cursor-pointer hover:bg-foreground-primary hover:text-background-primary transition-colors" onClick={href === '/' ? handleHomepageNavigation : handleGetStartedClick}>
                        {buttonText}
                    </button_1.Button>
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=cta-section.js.map