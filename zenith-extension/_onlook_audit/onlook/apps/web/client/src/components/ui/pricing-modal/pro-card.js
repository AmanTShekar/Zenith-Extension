"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProCard = exports.formatPrice = void 0;
const keys_1 = require("@/i18n/keys");
const react_1 = require("@/trpc/react");
const stripe_1 = require("@onlook/stripe");
const badge_1 = require("@onlook/ui/badge");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const motion_card_1 = require("@onlook/ui/motion-card");
const select_1 = require("@onlook/ui/select");
const sonner_1 = require("@onlook/ui/sonner");
const react_2 = require("motion/react");
const next_intl_1 = require("next-intl");
const react_3 = require("react");
const legacy_promotion_1 = require("./legacy-promotion");
const use_subscription_1 = require("./use-subscription");
const formatPrice = (cents) => `$${Math.round(cents / 100)}/month`;
exports.formatPrice = formatPrice;
const PRO_FEATURES = [
    'Unlimited projects',
    'Deploy to a custom domain',
    'Collaborate with your team',
    'Turn projects into templates',
];
const ProCard = ({ delay, isUnauthenticated = false, onSignupClick, }) => {
    const t = (0, next_intl_1.useTranslations)();
    const { subscription, isPro, refetchSubscription, setIsCheckingSubscription } = (0, use_subscription_1.useSubscription)();
    const { mutateAsync: checkout } = react_1.api.subscription.checkout.useMutation();
    const { mutateAsync: getPriceId } = react_1.api.subscription.getPriceId.useMutation();
    const { mutateAsync: updateSubscription } = react_1.api.subscription.update.useMutation();
    const { mutateAsync: releaseSubscriptionSchedule } = react_1.api.subscription.releaseSubscriptionSchedule.useMutation();
    const [isCheckingOut, setIsCheckingOut] = (0, react_3.useState)(false);
    const [selectedTier, setSelectedTier] = (0, react_3.useState)(stripe_1.PriceKey.PRO_MONTHLY_TIER_1);
    const selectedTierData = stripe_1.PRO_PRODUCT_CONFIG.prices.find(tier => tier.key === selectedTier);
    const isNewTierSelected = selectedTier !== subscription?.price.key;
    const isPendingTierSelected = selectedTier !== subscription?.price.key && selectedTier === subscription?.scheduledChange?.price?.key;
    if (!stripe_1.PRO_PRODUCT_CONFIG.prices.length) {
        throw new Error('No pro tiers found');
    }
    const handleCheckout = async () => {
        try {
            if (isPro) {
                if (isPendingTierSelected) {
                    await handleCancelScheduledDowngrade();
                }
                else if (isNewTierSelected) {
                    await updateExistingSubscription();
                }
                else {
                    throw new Error('No action to perform');
                }
            }
            else {
                await createCheckoutSession();
            }
        }
        catch (error) {
            sonner_1.toast.error(t(keys_1.transKeys.pricing.toasts.error.title), {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
            console.error('Payment error:', error);
        }
        finally {
            setIsCheckingOut(false);
        }
    };
    const handleCancelScheduledDowngrade = async () => {
        try {
            if (!subscription?.scheduledChange?.scheduledChangeAt || !subscription.scheduledChange.stripeSubscriptionScheduleId) {
                throw new Error('No scheduled downgrade found.');
            }
            setIsCheckingOut(true);
            await releaseSubscriptionSchedule({ subscriptionScheduleId: subscription.scheduledChange.stripeSubscriptionScheduleId });
            refetchSubscription();
            sonner_1.toast.success('Scheduled downgrade canceled!');
        }
        catch (error) {
            console.error('Error canceling scheduled downgrade:', error);
            sonner_1.toast.error('Error canceling scheduled downgrade', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        }
        finally {
            setIsCheckingOut(false);
        }
    };
    const createCheckoutSession = async () => {
        try {
            setIsCheckingOut(true);
            const stripePriceId = await getPriceId({ priceKey: selectedTier });
            const session = await checkout({ priceId: stripePriceId });
            if (!session?.url) {
                throw new Error('No checkout URL received');
            }
            window.open(session.url, '_blank');
            setIsCheckingSubscription(true);
        }
        catch (error) {
            sonner_1.toast.error(t('pricing.toasts.error.title'), {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
            console.error('Payment error:', error);
        }
        finally {
            setIsCheckingOut(false);
        }
    };
    const updateExistingSubscription = async () => {
        try {
            if (!subscription?.stripeSubscriptionId) {
                throw new Error('No subscription ID found');
            }
            setIsCheckingOut(true);
            const stripePriceId = await getPriceId({ priceKey: selectedTier });
            await updateSubscription({
                stripePriceId,
                stripeSubscriptionId: subscription.stripeSubscriptionId,
                stripeSubscriptionItemId: subscription.stripeSubscriptionItemId,
            });
            refetchSubscription();
            sonner_1.toast.success('Subscription updated!');
        }
        catch (error) {
            sonner_1.toast.error(t('pricing.toasts.error.title'), {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
            console.error('Payment error:', error);
        }
        finally {
            setIsCheckingOut(false);
        }
    };
    // Set selected tier based on current subscription
    (0, react_3.useEffect)(() => {
        if (subscription?.price.key) {
            setSelectedTier(subscription.price.key);
        }
    }, [subscription?.price.key]);
    const buttonContent = () => {
        if (isCheckingOut) {
            return (<div className="flex items-center gap-2">
                    <icons_1.Icons.Shadow className="w-4 h-4 animate-spin"/>
                    <span>
                        {t(keys_1.transKeys.pricing.loading.checkingPayment)}
                    </span>
                </div>);
        }
        if (isUnauthenticated) {
            return "Get Started with Pro";
        }
        if (!isPro) {
            return "Upgrade to Pro Plan";
        }
        if (!isNewTierSelected) {
            return "Current plan";
        }
        if (isPendingTierSelected) {
            return "Cancel Scheduled Downgrade";
        }
        return "Update plan";
    };
    const handleButtonClick = () => {
        if (isUnauthenticated && onSignupClick) {
            onSignupClick();
        }
        else {
            handleCheckout();
        }
    };
    return (<motion_card_1.MotionCard className="w-[360px]" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <react_2.motion.div className="p-6 flex flex-col h-full">
                <div className="space-y-1">
                    <h2 className="text-title2">{t(keys_1.transKeys.pricing.plans.pro.name)}</h2>
                    <p className="text-foreground-onlook text-largePlus">{(0, exports.formatPrice)(selectedTierData?.cost ?? 0)}</p>
                </div>
                <div className="border-[0.5px] border-border-primary -mx-6 my-6"/>
                <p className="text-foreground-primary text-title3 text-balance">{t(keys_1.transKeys.pricing.plans.pro.description)}</p>
                <div className="border-[0.5px] border-border-primary -mx-6 my-6"/>
                <div className="flex flex-col gap-2 mb-6">
                    <select_1.Select value={selectedTier} onValueChange={(value) => setSelectedTier(value)}>
                        <select_1.SelectTrigger className="w-full">
                            <select_1.SelectValue placeholder="Select a plan"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent className="z-99">
                            <select_1.SelectGroup>
                                {stripe_1.PRO_PRODUCT_CONFIG.prices.map((value) => (<select_1.SelectItem key={value.key} value={value.key}>
                                        <div className="flex items-center gap-2">
                                            {value.description}
                                            {value.key === subscription?.price.key && <badge_1.Badge variant="secondary">Current Plan</badge_1.Badge>}
                                            {value.key === subscription?.scheduledChange?.price?.key && <badge_1.Badge variant="secondary">Pending</badge_1.Badge>}
                                        </div>
                                    </select_1.SelectItem>))}
                            </select_1.SelectGroup>
                        </select_1.SelectContent>
                    </select_1.Select>
                    <button_1.Button className="w-full" onClick={handleButtonClick} disabled={isCheckingOut || (!isUnauthenticated && !isNewTierSelected)}>
                        {buttonContent()}
                    </button_1.Button>

                    {isPendingTierSelected && isPro && <div className="text-amber-500 text-small text-balance">
                        {`This plan will start on ${subscription?.scheduledChange?.scheduledChangeAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                    </div>}
                    {!isPro && <legacy_promotion_1.LegacyPromotion />}
                </div>
                <div className="flex flex-col gap-2 ">
                    {PRO_FEATURES.map((feature) => (<div key={feature} className="flex items-center gap-3 text-sm text-foreground-secondary/80">
                            <icons_1.Icons.CheckCircled className="w-5 h-5 text-foreground-secondary/80"/>
                            <span>{feature}</span>
                        </div>))}
                </div>
            </react_2.motion.div>
        </motion_card_1.MotionCard>);
};
exports.ProCard = ProCard;
//# sourceMappingURL=pro-card.js.map