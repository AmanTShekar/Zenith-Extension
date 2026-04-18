"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingCard = void 0;
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const motion_card_1 = require("@onlook/ui/motion-card");
const framer_motion_1 = require("framer-motion");
const react_i18next_1 = require("react-i18next");
const PricingCard = ({ plan, price, description, features, buttonText, buttonProps, delay, isLoading, }) => {
    const { t } = (0, react_i18next_1.useTranslation)();
    return (<motion_card_1.MotionCard className="w-[360px]" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <framer_motion_1.motion.div className="p-6 flex flex-col h-full">
                <div className="space-y-1">
                    <h2 className="text-title2">{plan}</h2>
                    <p className="text-foreground-onlook text-largePlus">{price}</p>
                </div>
                <div className="border-[0.5px] border-border-primary -mx-6 my-6"/>
                <p className="text-foreground-primary text-title3 text-balance">{description}</p>
                <div className="border-[0.5px] border-border-primary -mx-6 my-6"/>
                <div className="space-y-4 mb-6">
                    {features.map((feature, i) => (<div key={feature} className="flex items-center gap-3 text-sm text-foreground-secondary/80">
                            <icons_1.Icons.Check className="w-5 h-5 text-foreground-secondary/80"/>
                            <span>{feature}</span>
                        </div>))}
                </div>
                <button_1.Button className="mt-auto w-full" {...buttonProps} disabled={isLoading || buttonProps.disabled}>
                    {isLoading ? (<div className="flex items-center gap-2">
                            <icons_1.Icons.Shadow className="w-4 h-4 animate-spin"/>
                            <span>{t('pricing.loading.checkingPayment')}</span>
                        </div>) : (buttonText)}
                </button_1.Button>
            </framer_motion_1.motion.div>
        </motion_card_1.MotionCard>);
};
exports.PricingCard = PricingCard;
//# sourceMappingURL=PricingCard.js.map