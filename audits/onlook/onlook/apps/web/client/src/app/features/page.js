"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FeaturesPage;
const create_1 = require("@/components/store/create");
const pricing_modal_1 = require("@/components/ui/pricing-modal");
const non_project_1 = require("@/components/ui/settings-modal/non-project");
const constants_1 = require("@/utils/constants");
const features_hero_1 = require("../_components/hero/features-hero");
const benefits_section_1 = require("../_components/landing-page/benefits-section");
const cta_section_1 = require("../_components/landing-page/cta-section");
const faq_section_1 = require("../_components/landing-page/faq-section");
const features_grid_section_1 = require("../_components/landing-page/features-grid-section");
const features_intro_section_1 = require("../_components/landing-page/features-intro-section");
const responsive_mockup_section_1 = require("../_components/landing-page/responsive-mockup-section");
const website_layout_1 = require("../_components/website-layout");
const featuresFaqs = [
    {
        question: 'What is Onlook?',
        answer: 'Onlook is a visual design canvas that connects to your existing codebase. Designers drag real components onto an infinite canvas, make changes visually, and submit pull requests — no coding required.',
    },
    {
        question: 'How is Onlook different from other design tools?',
        answer: 'Traditional design tools create static mockups that must be rebuilt in code. Onlook works with your real components — what you design IS the code. Changes become PRs, not handoff specs.',
    },
    {
        question: 'How is Onlook different from AI code generators?',
        answer: 'AI generators create new code from scratch. Onlook constrains AI to YOUR existing components, so outputs match your design system. No translation, no drift.',
    },
    {
        question: 'Do I need to know how to code?',
        answer: 'No. Designers use a visual canvas with familiar tools. Real code runs underneath — you don\'t need to touch it unless you want to.',
    },
    {
        question: 'Can my team collaborate?',
        answer: 'Yes. Share your canvas, leave spatial comments, and work together in real-time. Changes sync to code and can be submitted as PRs for engineers to review.',
    },
    {
        question: 'What tech stack does Onlook support?',
        answer: 'React, Next.js, and any CSS approach (Tailwind, CSS modules, styled-components). Works with any component library.',
    },
];
function FeaturesPage() {
    return (<create_1.CreateManagerProvider>
            <website_layout_1.WebsiteLayout showFooter={true}>
                {/* AI-Friendly Summary Section */}
                <section className="sr-only" aria-label="Features Summary">
                    <h1>Onlook Features: Design with Your Real Components</h1>
                    <p>
                        Onlook is a visual design canvas that connects to your existing codebase.
                        Design with your real components on an infinite canvas. AI is constrained to your design system —
                        no brand drift, no throwaway code. Changes become mergeable pull requests.
                    </p>
                    <h2>Key Features</h2>
                    <ul>
                        <li>Your Real Components — design with the buttons, cards, and layouts your engineers built</li>
                        <li>AI constrained to your design system — uses your colors, fonts, and tokens</li>
                        <li>Built for Teams — real-time collaboration with spatial comments</li>
                        <li>Ship PRs, Not Prototypes — changes become mergeable pull requests</li>
                        <li>Canvas manipulation — drag, resize, arrange elements visually</li>
                        <li>Layer management — navigate your React component tree visually</li>
                        <li>Version history — roll back to any previous version</li>
                        <li>Works with your codebase — connect existing React or Next.js projects</li>
                        <li>Direct GitHub integration — push changes directly to your repository</li>
                    </ul>
                </section>

                <div className="w-screen h-screen flex items-center justify-center" id="hero">
                    <features_hero_1.FeaturesHero />
                </div>
                <responsive_mockup_section_1.ResponsiveMockupSection />
                <benefits_section_1.BenefitsSection />
                <features_intro_section_1.FeaturesIntroSection />
                <features_grid_section_1.FeaturesGridSection />
                <faq_section_1.FAQSection faqs={featuresFaqs}/>
                <cta_section_1.CTASection ctaText={`Ready to stop rebuilding?`} buttonText="Book a Demo" href={constants_1.ExternalRoutes.BOOK_DEMO}/>
                <non_project_1.NonProjectSettingsModal />
                <pricing_modal_1.SubscriptionModal />
            </website_layout_1.WebsiteLayout>
        </create_1.CreateManagerProvider>);
}
//# sourceMappingURL=page.js.map