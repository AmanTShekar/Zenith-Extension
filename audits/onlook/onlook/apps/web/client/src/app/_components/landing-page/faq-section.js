"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQSection = FAQSection;
const constants_1 = require("@/utils/constants");
const icons_1 = require("@onlook/ui/icons");
const react_1 = __importDefault(require("react"));
const button_link_1 = require("../button-link");
const faq_dropdown_1 = require("./faq-dropdown");
const defaultFaqs = [
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
    {
        question: 'Is there a free version of Onlook?',
        answer: 'Yes, Onlook can be self-hosted for free on GitHub. For the hosted cloud version, please contact our team or book a demo.',
    },
    {
        question: 'Who owns the code?',
        answer: 'The code you make with Onlook is all yours. Export it locally, publish to GitHub, or deploy to a custom domain.',
    },
];
function FAQSection({ faqs = defaultFaqs, title = "Frequently\nasked questions", buttonText = "Read our FAQs", buttonHref = constants_1.Routes.FAQ, className = "" }) {
    return (<div className={`w-full py-48 px-8 bg-background-onlook/80 ${className}`} id="faq">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-24 md:gap-12">
                <div className="flex-1 flex flex-col items-start">
                    <h3 className="text-foreground-primary text-5xl md:text-6xl leading-[1.1] font-light mb-12 mt-4 max-w-3xl text-balance">
                        {title.split('\n').map((line, index) => (<react_1.default.Fragment key={index}>
                                {line}
                                {index < title.split('\n').length - 1 && <br />}
                            </react_1.default.Fragment>))}
                    </h3>
                    <button_link_1.ButtonLink href={buttonHref} rightIcon={<icons_1.Icons.ArrowRight className="w-5 h-5"/>}>{buttonText}</button_link_1.ButtonLink>
                </div>
                <div className="flex-1 flex flex-col gap-6">
                    <faq_dropdown_1.FAQDropdown faqs={faqs}/>
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=faq-section.js.map