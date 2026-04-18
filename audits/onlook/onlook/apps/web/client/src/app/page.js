"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Main;
const create_1 = require("@/components/store/create");
const pricing_modal_1 = require("@/components/ui/pricing-modal");
const non_project_1 = require("@/components/ui/settings-modal/non-project");
const constants_1 = require("@/utils/constants");
const auth_modal_1 = require("./_components/auth-modal");
const hero_1 = require("./_components/hero");
const contributor_section_1 = require("./_components/landing-page/contributor-section");
const cta_section_1 = require("./_components/landing-page/cta-section");
const faq_section_1 = require("./_components/landing-page/faq-section");
const responsive_mockup_section_1 = require("./_components/landing-page/responsive-mockup-section");
const testimonials_section_1 = require("./_components/landing-page/testimonials-section");
const what_can_onlook_do_section_1 = require("./_components/landing-page/what-can-onlook-do-section");
const website_layout_1 = require("./_components/website-layout");
function Main() {
    return (<create_1.CreateManagerProvider>
            <website_layout_1.WebsiteLayout showFooter={true}>
                <div className="w-screen h-screen flex items-center justify-center" id="hero">
                    <hero_1.Hero />
                </div>
                <responsive_mockup_section_1.ResponsiveMockupSection />
                {/* <CodeOneToOneSection /> */}
                <what_can_onlook_do_section_1.WhatCanOnlookDoSection />
                {/* <ObsessForHoursSection /> */}
                <contributor_section_1.ContributorSection />
                <testimonials_section_1.TestimonialsSection />
                <faq_section_1.FAQSection />
                <cta_section_1.CTASection href={constants_1.ExternalRoutes.BOOK_DEMO}/>
                <auth_modal_1.AuthModal />
                <non_project_1.NonProjectSettingsModal />
                <pricing_modal_1.SubscriptionModal />
            </website_layout_1.WebsiteLayout>
        </create_1.CreateManagerProvider>);
}
//# sourceMappingURL=page.js.map