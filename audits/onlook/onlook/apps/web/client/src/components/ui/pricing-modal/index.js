"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionModal = void 0;
const state_1 = require("@/components/store/state");
const use_get_background_1 = require("@/hooks/use-get-background");
const keys_1 = require("@/i18n/keys");
const stripe_1 = require("@onlook/stripe");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const next_intl_1 = require("next-intl");
const free_card_1 = require("./free-card");
const pro_card_1 = require("./pro-card");
const use_subscription_1 = require("./use-subscription");
exports.SubscriptionModal = (0, mobx_react_lite_1.observer)(() => {
    const state = (0, state_1.useStateManager)();
    const t = (0, next_intl_1.useTranslations)();
    const backgroundUrl = (0, use_get_background_1.useGetBackground)('create');
    const { subscription } = (0, use_subscription_1.useSubscription)();
    const getSubscriptionChangeMessage = () => {
        let message = '';
        if (subscription?.scheduledChange?.scheduledAction === stripe_1.ScheduledSubscriptionAction.PRICE_CHANGE && subscription.scheduledChange.price) {
            message = `Your ${subscription.scheduledChange.price.monthlyMessageLimit} messages a month plan starts on ${subscription.scheduledChange.scheduledChangeAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }
        else if (subscription?.scheduledChange?.scheduledAction === stripe_1.ScheduledSubscriptionAction.CANCELLATION) {
            message = `Your subscription will end on ${subscription.scheduledChange.scheduledChangeAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }
        if (message) {
            return (<div className="text-foreground-secondary/80 text-balance">
                    {message}
                </div>);
        }
    };
    return (<react_1.AnimatePresence>
            {state.isSubscriptionModalOpen && (<react_1.motion.div className="fixed inset-0 z-99" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="relative w-full h-full flex items-center justify-center" style={{
                backgroundImage: `url(${backgroundUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
                        <div className="absolute inset-0 bg-background/50"/>
                        <button_1.Button variant="ghost" onClick={() => state.isSubscriptionModalOpen = false} className="fixed top-8 right-10 text-foreground-secondary">
                            <icons_1.Icons.CrossL className="h-4 w-4"/>
                        </button_1.Button>
                        <div className="relative z-10">
                            <react_1.MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
                                <react_1.motion.div className="flex flex-col items-center gap-3">
                                    <react_1.motion.div className="flex flex-col gap-2 text-center mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                                        <div className="flex flex-col gap-2 w-[46rem] items-start">
                                            <h1 className="text-title2 text-foreground-primary">
                                                {subscription?.product.type === stripe_1.ProductType.PRO
                ? t(keys_1.transKeys.pricing.titles.proMember)
                : t(keys_1.transKeys.pricing.titles.choosePlan)}
                                            </h1>
                                            {getSubscriptionChangeMessage()}
                                        </div>
                                    </react_1.motion.div>
                                    <div className="flex gap-4">
                                        <free_card_1.FreeCard delay={0.1}/>
                                        <pro_card_1.ProCard delay={0.2}/>
                                    </div>
                                    <react_1.motion.div className="flex flex-col gap-2 text-center" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                        <p className="text-foreground-secondary/60 text-small text-balance">
                                            {t(keys_1.transKeys.pricing.footer.unusedMessages)}
                                        </p>
                                    </react_1.motion.div>
                                </react_1.motion.div>
                            </react_1.MotionConfig>
                        </div>
                    </div>
                </react_1.motion.div>)}
        </react_1.AnimatePresence>);
});
//# sourceMappingURL=index.js.map