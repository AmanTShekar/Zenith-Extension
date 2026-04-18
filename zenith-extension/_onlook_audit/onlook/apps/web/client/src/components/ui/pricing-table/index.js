"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingTable = void 0;
const auth_context_1 = require("@/app/auth/auth-context");
const keys_1 = require("@/i18n/keys");
const react_1 = require("@/trpc/react");
const next_intl_1 = require("next-intl");
const enterprise_card_1 = require("../pricing-modal/enterprise-card");
const free_card_1 = require("../pricing-modal/free-card");
const pro_card_1 = require("../pricing-modal/pro-card");
const PricingTable = () => {
    const t = (0, next_intl_1.useTranslations)();
    const { data: user } = react_1.api.user.get.useQuery();
    const { setIsAuthModalOpen } = (0, auth_context_1.useAuthContext)();
    return (<div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center lg:items-stretch w-full">
                <free_card_1.FreeCard delay={0.1} isUnauthenticated={!user} onSignupClick={() => setIsAuthModalOpen(true)}/>
                <pro_card_1.ProCard delay={0.2} isUnauthenticated={!user} onSignupClick={() => setIsAuthModalOpen(true)}/>
                <enterprise_card_1.EnterpriseCard delay={0.3}/>
            </div>
            <div className="text-center">
                <p className="text-foreground-secondary/60 text-small text-balance">
                    {t(keys_1.transKeys.pricing.footer.unusedMessages)}
                </p>
            </div>
        </div>);
};
exports.PricingTable = PricingTable;
//# sourceMappingURL=index.js.map