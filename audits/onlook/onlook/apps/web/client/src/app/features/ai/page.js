"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AiFeaturesPage;
const create_1 = require("@/components/store/create");
const pricing_modal_1 = require("@/components/ui/pricing-modal");
const non_project_1 = require("@/components/ui/settings-modal/non-project");
const constants_1 = require("@/utils/constants");
const ai_features_hero_1 = require("../../_components/hero/ai-features-hero");
const ai_benefits_section_1 = require("../../_components/landing-page/ai-benefits-section");
const ai_features_grid_section_1 = require("../../_components/landing-page/ai-features-grid-section");
const ai_features_intro_section_1 = require("../../_components/landing-page/ai-features-intro-section");
const cta_section_1 = require("../../_components/landing-page/cta-section");
const faq_section_1 = require("../../_components/landing-page/faq-section");
const responsive_mockup_section_1 = require("../../_components/landing-page/responsive-mockup-section");
const website_layout_1 = require("../../_components/website-layout");
const aiFaqs = [
    {
        question: 'What is Onlook?',
        answer: 'Onlook is an open-source, visual editor for websites. It allows anyone to create and style their own websites without any coding knowledge.',
    },
    {
        question: 'What can I use Onlook to do?',
        answer: 'Onlook is great for creating websites, prototypes, user interfaces, and designs. Whether you need a quick mockup or a full-fledged website, ask Onlook to craft it for you.',
    },
    {
        question: 'How do I get started?',
        answer: 'Getting started with Onlook is easy. Simply sign up for an account, create a new project, and follow our step-by-step guide to deploy your first application.',
    },
    {
        question: 'Is Onlook free to use?',
        answer: "Onlook is free for your first prompt, but you're limited by the number of messages you can send. Please see our Pricing page for more details.",
    },
    {
        question: 'What is the difference between Onlook and other design tools?',
        answer: "Onlook is a visual editor for code. It allows you to create and style your own creations with code as the source of truth. While it is best suited for creating websites, it can be used for anything visual – presentations, mockups, and more. Because Onlook uses code as the source of truth, the types of designs you can create are unconstrained by Onlook's interface.",
    },
    {
        question: 'Why is Onlook open-source?',
        answer: 'Developers have historically been second-rate citizens in the design process. Onlook was founded to bridge the divide between design and development, and we wanted to make developers first-class citizens alongside designers. We chose to be open-source to give developers transparency into how we are building Onlook and how the work created through Onlook will complement the work of developers.',
    },
];
function AiFeaturesPage() {
    return (<create_1.CreateManagerProvider>
            <website_layout_1.WebsiteLayout showFooter={true}>
                {/* AI-Friendly Summary Section */}
                <section className="sr-only" aria-label="AI Features Summary">
                    <h1>Onlook AI Visual Editor: Build UIs with AI Using Your Design System</h1>
                    <p>
                        Onlook is an AI-powered visual editor that builds frontend UIs using your real React, Vue, or
                        Angular components. Unlike generic AI code generators, Onlook constrains AI to your design
                        system — your buttons, cards, and layouts. Changes become mergeable PRs, not throwaway prototypes.
                    </p>
                    <h2>Key AI Features</h2>
                    <ul>
                        <li>AI constrained to your design system — no brand drift, no off-brand results</li>
                        <li>Visual canvas with real code running underneath</li>
                        <li>Works with React, Next.js, Vue, Angular, Svelte</li>
                        <li>Supports Tailwind, CSS Modules, styled-components</li>
                        <li>Compatible with shadcn/ui, Material UI, Chakra UI, Mantine, Radix UI</li>
                        <li>Direct GitHub PR output — changes become mergeable pull requests</li>
                        <li>Real-time team collaboration</li>
                        <li>No coding required for designers</li>
                    </ul>
                </section>

                <div className="flex h-screen w-screen items-center justify-center" id="hero">
                    <ai_features_hero_1.AiFeaturesHero />
                </div>
                <responsive_mockup_section_1.ResponsiveMockupSection />
                <ai_benefits_section_1.AiBenefitsSection />
                <ai_features_intro_section_1.AiFeaturesIntroSection />
                <ai_features_grid_section_1.AiFeaturesGridSection />
                <cta_section_1.CTASection ctaText={`Start Building with AI Today`} buttonText="Get Started for Free" href={constants_1.ExternalRoutes.BOOK_DEMO}/>
                <faq_section_1.FAQSection faqs={aiFaqs}/>
                <non_project_1.NonProjectSettingsModal />
                <pricing_modal_1.SubscriptionModal />
            </website_layout_1.WebsiteLayout>
        </create_1.CreateManagerProvider>);
}
//# sourceMappingURL=page.js.map