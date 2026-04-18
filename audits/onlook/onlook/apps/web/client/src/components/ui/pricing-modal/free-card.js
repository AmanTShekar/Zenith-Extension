"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeCard = void 0;
const keys_1 = require("@/i18n/keys");
const react_1 = require("@/trpc/react");
const stripe_1 = require("@onlook/stripe");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const motion_card_1 = require("@onlook/ui/motion-card");
const select_1 = require("@onlook/ui/select");
const sonner_1 = require("@onlook/ui/sonner");
const react_2 = require("motion/react");
const next_intl_1 = require("next-intl");
const react_3 = require("react");
const use_subscription_1 = require("./use-subscription");
const FREE_TIER = {
    name: 'Free',
    price: '$0/month',
    description: 'Prototype and experiment in code with ease.',
    features: [
        'Visual code editor access',
        '5 projects',
        '5 AI chat messages a day',
        '15 AI messages a month',
        'Unlimited styling and code editing',
        'Limited to 1 screenshot per chat'
    ],
    defaultSelectValue: 'daily',
    selectValues: [
        { value: 'daily', label: '5 Daily Messages' },
    ],
};
const FreeCard = ({ delay, isUnauthenticated = false, onSignupClick, }) => {
    const t = (0, next_intl_1.useTranslations)();
    const { subscription, isPro, setIsCheckingSubscription } = (0, use_subscription_1.useSubscription)();
    const { mutateAsync: manageSubscription } = react_1.api.subscription.manageSubscription.useMutation();
    const [isCheckingOut, setIsCheckingOut] = (0, react_3.useState)(false);
    const isFree = !isPro;
    const isScheduledCancellation = subscription?.scheduledChange?.scheduledAction === stripe_1.ScheduledSubscriptionAction.CANCELLATION;
    const handleDowngradeToFree = async () => {
        try {
            setIsCheckingOut(true);
            const session = await manageSubscription();
            if (session?.url) {
                window.open(session.url, '_blank');
                setIsCheckingSubscription(true);
            }
            else {
                throw new Error('No checkout URL received');
            }
        }
        catch (error) {
            console.error('Error managing subscription:', error);
            sonner_1.toast.error('Error managing subscription', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        }
        finally {
            setIsCheckingOut(false);
        }
    };
    const buttonContent = () => {
        if (isCheckingOut) {
            return (<div className="flex items-center gap-2">
                    <icons_1.Icons.Shadow className="w-4 h-4 animate-spin"/>
                    <span>{t(keys_1.transKeys.pricing.loading.checkingPayment)}</span>
                </div>);
        }
        if (isUnauthenticated) {
            return "Get Started Free";
        }
        if (isScheduledCancellation) {
            return `Pro plan ends on ${subscription?.scheduledChange?.scheduledChangeAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }
        if (isFree) {
            return t(keys_1.transKeys.pricing.buttons.currentPlan);
        }
        return "Downgrade to Free Plan";
    };
    const handleButtonClick = () => {
        if (isUnauthenticated && onSignupClick) {
            onSignupClick();
        }
        else {
            handleDowngradeToFree();
        }
    };
    return (<motion_card_1.MotionCard className="w-[360px]" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <react_2.motion.div className="p-6 flex flex-col h-full">
                <div className="space-y-1">
                    <h2 className="text-title2">{FREE_TIER.name}</h2>
                    <p className="text-foreground-onlook text-largePlus">{FREE_TIER.price}</p>
                </div>
                <div className="border-[0.5px] border-border-primary -mx-6 my-6"/>
                <p className="text-foreground-primary text-title3 text-balance">{FREE_TIER.description}</p>
                <div className="border-[0.5px] border-border-primary -mx-6 my-6"/>
                <div className="flex flex-col gap-2 mb-6">
                    <select_1.Select value={FREE_TIER.defaultSelectValue} disabled={true}>
                        <select_1.SelectTrigger className="w-full">
                            <select_1.SelectValue placeholder="Select a plan"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent className="z-99">
                            <select_1.SelectGroup>
                                {FREE_TIER.selectValues.map((value) => (<select_1.SelectItem key={value.value} value={value.value}>
                                        {value.label}
                                    </select_1.SelectItem>))}
                            </select_1.SelectGroup>
                        </select_1.SelectContent>
                    </select_1.Select>
                    <button_1.Button className="w-full" variant="outline" onClick={handleButtonClick} disabled={isCheckingOut || (!isUnauthenticated && (isFree || isScheduledCancellation))}>
                        {buttonContent()}
                    </button_1.Button>
                </div>
                <div className="flex flex-col gap-2 h-42">
                    {FREE_TIER.features.map((feature) => (<div key={feature} className="flex items-center gap-3 text-sm text-foreground-secondary/80">
                            <icons_1.Icons.CheckCircled className="w-5 h-5 text-foreground-secondary/80"/>
                            <span>{feature}</span>
                        </div>))}
                </div>
            </react_2.motion.div>
        </motion_card_1.MotionCard>);
};
exports.FreeCard = FreeCard;
//# sourceMappingURL=free-card.js.map