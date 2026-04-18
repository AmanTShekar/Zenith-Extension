"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VibeCodingWorkflowPage;
const create_1 = require("@/components/store/create");
const pricing_modal_1 = require("@/components/ui/pricing-modal");
const non_project_1 = require("@/components/ui/settings-modal/non-project");
const constants_1 = require("@/utils/constants");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("motion/react");
const unicorn_background_1 = require("../../_components/hero/unicorn-background");
const cta_section_1 = require("../../_components/landing-page/cta-section");
const faq_section_1 = require("../../_components/landing-page/faq-section");
const onlook_interface_mockup_1 = require("../../_components/landing-page/onlook-interface-mockup");
const github_1 = require("../../_components/top-bar/github");
const website_layout_1 = require("../../_components/website-layout");
const vibeCodingFaqs = [
    {
        question: 'What is vibe coding?',
        answer: "Vibe coding is a workflow where you describe what you want in natural language and AI generates the code. Most vibe coding tools are designed for solo use, not teams.",
    },
    {
        question: 'What is the problem with vibe coding today?',
        answer: "Most vibe coding tools are solo workflows. You can't easily share work-in-progress, collaborate in real-time, or hand off to engineers. The output is often throwaway code that doesn't match your design system.",
    },
    {
        question: 'How does Onlook make vibe coding work for teams?',
        answer: 'Onlook adds a visual canvas layer. Share your canvas with teammates, leave spatial comments, work together in real-time. AI is constrained to your design system, so outputs are consistent. Changes become PRs engineers can merge.',
    },
    {
        question: 'Can I use my existing vibe coding tools with Onlook?',
        answer: 'Yes. Use any AI coding tool to build. Open in Onlook to visually iterate, collaborate with your team, and refine before shipping. Onlook works with your existing codebase.',
    },
    {
        question: 'Does vibe coding in Onlook use my real components?',
        answer: "Yes. Unlike tools that generate generic HTML, Onlook connects to your component library. AI uses YOUR buttons, cards, and layouts. No brand drift, no rebuilding.",
    },
    {
        question: 'How do I share vibe-coded work with my team?',
        answer: 'Share your canvas link. Teammates can view, comment spatially, and collaborate in real-time. When ready, submit changes as a PR for engineers to review.',
    },
];
// Helper function for blur animations
const getBlurAnimationProps = (delay = 0) => ({
    initial: { opacity: 0, filter: 'blur(4px)' },
    whileInView: { opacity: 1, filter: 'blur(0px)' },
    viewport: { once: true, margin: '-100px 0px -100px 0px', amount: 0.3 },
    transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
    },
    style: {
        willChange: 'opacity, filter',
        transform: 'translateZ(0)',
    },
});
function VibeCodingHero() {
    const { formatted: starCount } = (0, github_1.useGitHubStats)();
    return (<div className="relative flex h-full w-full flex-col items-center justify-center gap-12 p-8 text-center text-lg">
            <unicorn_background_1.UnicornBackground />
            <div className="relative z-20 flex max-w-3xl flex-col items-center gap-6 pt-4 pb-2">
                <react_1.motion.h1 className="text-foreground-secondary mb-4 text-sm font-medium tracking-wider uppercase" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}>
                    Vibe Coding for Teams
                </react_1.motion.h1>
                <react_1.motion.p className="text-center text-4xl !leading-[1] leading-tight font-light text-balance md:text-6xl" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }} style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}>
                    Vibe coding has a collaboration problem
                </react_1.motion.p>
                <react_1.motion.p className="text-foreground-secondary mx-auto max-w-xl text-center text-lg" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }} style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}>
                    Most AI coding tools are solo workflows. Onlook adds the missing layer —
                    a visual canvas where teams collaborate on AI-generated UIs with their real components.
                </react_1.motion.p>
                <react_1.motion.div className="mt-8" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }} style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}>
                    <button_1.Button asChild variant="secondary" size="lg" className="hover:bg-foreground-primary hover:text-background-primary cursor-pointer p-6 transition-all duration-300">
                        <a href={constants_1.ExternalRoutes.BOOK_DEMO} target="_blank" rel="noopener noreferrer">
                            Book a Demo
                        </a>
                    </button_1.Button>
                </react_1.motion.div>
                <react_1.motion.div className="text-foreground-secondary mt-8 flex items-center justify-center gap-6 text-sm" initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }} style={{ willChange: 'opacity, filter', transform: 'translateZ(0)' }}>
                    <div className="flex items-center gap-2">
                        <span>{starCount}+ GitHub stars</span>
                    </div>
                    <div className="bg-foreground-secondary h-1 w-1 rounded-full"></div>
                    <div className="flex items-center gap-2">
                        <span>YC W25</span>
                    </div>
                    <div className="bg-foreground-secondary h-1 w-1 rounded-full"></div>
                    <div className="flex items-center gap-2">
                        <span>Open Source</span>
                    </div>
                </react_1.motion.div>
            </div>
        </div>);
}
function VibeCodingWorkflowPage() {
    return (<create_1.CreateManagerProvider>
            <website_layout_1.WebsiteLayout showFooter={true}>
                {/* AI-Friendly Summary Section */}
                <section className="sr-only" aria-label="Vibe Coding Workflow Summary">
                    <h1>Vibe Coding for Teams: Add Collaboration to Your AI Coding Workflow</h1>
                    <p>
                        Vibe coding — describing what you want and letting AI generate the code — is powerful but has
                        a collaboration problem. Most AI coding tools are solo workflows. You can't
                        easily share work-in-progress, collaborate in real-time, or ensure outputs match your design
                        system. Onlook solves this.
                    </p>
                    <h2>The Problem with Solo Vibe Coding</h2>
                    <ul>
                        <li>Solo workflow — hard to share work-in-progress with teammates</li>
                        <li>Throwaway code — doesn't use your real components</li>
                        <li>Brand drift — AI generates generic HTML/CSS, not your design system</li>
                        <li>No handoff path — "now how do I share this?" becomes a blocker</li>
                    </ul>
                    <h2>Onlook Makes Vibe Coding Work for Teams</h2>
                    <ul>
                        <li>Visual canvas — see and arrange AI-generated UIs spatially</li>
                        <li>Your real components — AI constrained to your design system</li>
                        <li>Real-time collaboration — share canvas, leave spatial comments</li>
                        <li>PR output — changes become mergeable pull requests</li>
                        <li>Works with any AI coding tool you already use</li>
                    </ul>
                </section>

                {/* Hero Section */}
                <div className="flex h-screen w-screen items-center justify-center" id="hero">
                    <VibeCodingHero />
                </div>

                {/* The Problem Section */}
                <section className="w-full bg-black py-32">
                    <div className="mx-auto max-w-6xl px-8">
                        <react_1.motion.h2 className="text-foreground-secondary mb-6 text-sm font-medium uppercase tracking-wider" {...getBlurAnimationProps()}>
                            The Problem
                        </react_1.motion.h2>
                        <react_1.motion.p className="mb-16 max-w-3xl text-4xl font-light leading-tight text-balance md:text-5xl" {...getBlurAnimationProps(0.1)}>
                            Solo vibe coding doesn't scale. Teams need to share, iterate, and ship together.
                        </react_1.motion.p>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {[
            {
                icon: icons_1.Icons.Person,
                title: 'Solo workflow',
                description: 'Most AI coding tools are designed for individual use. Sharing means screenshots or screen shares.',
            },
            {
                icon: icons_1.Icons.Trash,
                title: 'Throwaway code',
                description: "AI generates generic HTML/CSS. You'll rebuild it anyway to use your real components.",
            },
            {
                icon: icons_1.Icons.Brand,
                title: 'Brand drift',
                description: "Every vibe-coded UI looks different. AI doesn't know your design system.",
            },
            {
                icon: icons_1.Icons.QuestionMarkCircled,
                title: '"Now what?"',
                description: 'You built something cool. Now how do you share it, get feedback, or hand it off?',
            },
        ].map((item, index) => (<react_1.motion.div key={item.title} className="flex flex-col gap-4" {...getBlurAnimationProps(0.2 + index * 0.1)}>
                                    <item.icon className="text-foreground-secondary h-5 w-5"/>
                                    <h3 className="text-base font-medium text-balance">{item.title}</h3>
                                    <p className="text-foreground-secondary text-base text-balance">{item.description}</p>
                                </react_1.motion.div>))}
                        </div>
                    </div>
                </section>

                {/* The Solution Section */}
                <section className="w-full bg-black pt-32 pb-16">
                    <div className="mx-auto max-w-6xl px-8">
                        <react_1.motion.h2 className="text-foreground-secondary mb-6 text-sm font-medium uppercase tracking-wider" {...getBlurAnimationProps()}>
                            The Solution
                        </react_1.motion.h2>
                        <react_1.motion.p className="mb-24 max-w-3xl text-4xl font-light leading-tight text-balance md:text-5xl" {...getBlurAnimationProps(0.1)}>
                            Onlook adds the visual layer. Vibe code with your team, on your components, to real PRs.
                        </react_1.motion.p>
                    </div>

                    {/* Editor Mockup - Desktop */}
                    <react_1.motion.div className="hidden md:block w-screen h-[44rem] items-center justify-center mb-24" {...getBlurAnimationProps(0.2)}>
                        <onlook_interface_mockup_1.OnlookInterfaceMockup />
                    </react_1.motion.div>

                    {/* Editor Mockup - Mobile */}
                    <react_1.motion.div className="md:hidden w-screen relative overflow-hidden h-[880px]" {...getBlurAnimationProps(0.2)}>
                        <div className="absolute top-1/2 right-10 transform -translate-y-1/2 h-[800px] w-[1000px]">
                            <onlook_interface_mockup_1.OnlookInterfaceMockup />
                        </div>
                    </react_1.motion.div>

                    <div className="mx-auto max-w-6xl px-8">
                        <div className="grid gap-8 md:grid-cols-4">
                            {[
            {
                icon: icons_1.Icons.Layers,
                title: 'Visual canvas',
                description: 'See and arrange AI-generated UIs spatially. Not just terminal output.',
            },
            {
                icon: icons_1.Icons.Component,
                title: 'Your real components',
                description: 'AI uses your buttons, cards, layouts. Not generic HTML.',
            },
            {
                icon: icons_1.Icons.Person,
                title: 'Team collaboration',
                description: 'Share canvas, leave spatial comments, work together in real-time.',
            },
            {
                icon: icons_1.Icons.Branch,
                title: 'Ship PRs',
                description: 'Changes become pull requests. Engineers review and merge.',
            },
        ].map((item, index) => (<react_1.motion.div key={item.title} className="flex flex-col gap-3" {...getBlurAnimationProps(0.3 + index * 0.1)}>
                                    <item.icon className="text-foreground-secondary h-5 w-5"/>
                                    <h3 className="text-base font-medium text-balance">{item.title}</h3>
                                    <p className="text-foreground-secondary text-sm text-balance">{item.description}</p>
                                </react_1.motion.div>))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="w-full bg-black py-32">
                    <div className="mx-auto max-w-6xl px-8">
                        <react_1.motion.h2 className="text-foreground-secondary mb-6 text-sm font-medium uppercase tracking-wider" {...getBlurAnimationProps()}>
                            How It Works
                        </react_1.motion.h2>
                        <react_1.motion.p className="mb-16 max-w-3xl text-4xl font-light leading-tight text-balance md:text-5xl" {...getBlurAnimationProps(0.1)}>
                            Vibe code anywhere. Collaborate in Onlook. Ship together.
                        </react_1.motion.p>

                        <div className="grid gap-12 md:grid-cols-3">
                            {[
            {
                step: '01',
                title: 'Build with any AI tool',
                description: 'Use any AI coding tool to generate your initial UI. Onlook works with your existing codebase.',
            },
            {
                step: '02',
                title: 'Iterate on the canvas',
                description: 'Open in Onlook to visually refine. Drag elements, adjust styles, use AI with your real components. See changes in real code.',
            },
            {
                step: '03',
                title: 'Collaborate and ship',
                description: 'Share your canvas with teammates. Leave spatial comments. When ready, submit as a PR for engineers to review and merge.',
            },
        ].map((item, index) => (<react_1.motion.div key={item.step} className="flex flex-col gap-4" {...getBlurAnimationProps(0.2 + index * 0.1)}>
                                    <span className="text-foreground-tertiary text-sm font-medium">{item.step}</span>
                                    <h3 className="text-xl font-medium">{item.title}</h3>
                                    <p className="text-foreground-secondary text-base text-balance">{item.description}</p>
                                </react_1.motion.div>))}
                        </div>
                    </div>
                </section>

                {/* Comparison Section */}
                <section className="w-full bg-black py-32">
                    <div className="mx-auto max-w-6xl px-8">
                        <react_1.motion.h2 className="text-foreground-secondary mb-6 text-sm font-medium uppercase tracking-wider" {...getBlurAnimationProps()}>
                            Vibe Coding: Solo vs. Team
                        </react_1.motion.h2>
                        <react_1.motion.p className="mb-16 max-w-3xl text-4xl font-light leading-tight text-balance md:text-5xl" {...getBlurAnimationProps(0.1)}>
                            The difference between prototyping alone and shipping with your team.
                        </react_1.motion.p>

                        <react_1.motion.div className="grid gap-8 md:grid-cols-2" {...getBlurAnimationProps(0.2)}>
                            {/* Solo Column */}
                            <div className="border-foreground-primary/10 rounded-lg border p-8">
                                <h3 className="text-foreground-tertiary mb-6 text-sm font-medium uppercase tracking-wider">
                                    Solo Vibe Coding
                                </h3>
                                <ul className="space-y-4">
                                    {[
            'Generate generic HTML/CSS',
            'Share via screenshots',
            'Rebuild to use your components',
            'Manual handoff process',
            'Code needs translation',
        ].map((item) => (<li key={item} className="text-foreground-secondary flex items-start gap-3">
                                            <icons_1.Icons.CrossCircled className="text-foreground-tertiary mt-0.5 h-5 w-5 flex-shrink-0"/>
                                            <span>{item}</span>
                                        </li>))}
                                </ul>
                            </div>

                            {/* Team Column */}
                            <div className="border-foreground-primary/30 rounded-lg border bg-gradient-to-b from-white/5 to-transparent p-8">
                                <h3 className="text-foreground-secondary mb-6 text-sm font-medium uppercase tracking-wider">
                                    Team Vibe Coding with Onlook
                                </h3>
                                <ul className="space-y-4">
                                    {[
            'Use your real components',
            'Share a live canvas',
            'AI constrained to your design system',
            'Collaborate with spatial comments',
            'Ship PRs engineers can merge',
        ].map((item) => (<li key={item} className="text-foreground-primary flex items-start gap-3">
                                            <icons_1.Icons.CheckCircled className="text-teal-500 mt-0.5 h-5 w-5 flex-shrink-0"/>
                                            <span>{item}</span>
                                        </li>))}
                                </ul>
                            </div>
                        </react_1.motion.div>
                    </div>
                </section>

                {/* FAQ Section */}
                <faq_section_1.FAQSection faqs={vibeCodingFaqs} title="Frequently asked questions"/>

                {/* CTA Section */}
                <cta_section_1.CTASection ctaText={`Ready to vibe code\nwith your team?`} buttonText="Book a Demo" href={constants_1.ExternalRoutes.BOOK_DEMO}/>

                <non_project_1.NonProjectSettingsModal />
                <pricing_modal_1.SubscriptionModal />
            </website_layout_1.WebsiteLayout>
        </create_1.CreateManagerProvider>);
}
//# sourceMappingURL=page.js.map