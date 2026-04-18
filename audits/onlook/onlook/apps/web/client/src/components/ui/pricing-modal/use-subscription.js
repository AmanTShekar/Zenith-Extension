"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSubscription = void 0;
const state_1 = require("@/components/store/state");
const react_1 = require("@/trpc/react");
const stripe_1 = require("@onlook/stripe");
const sonner_1 = require("@onlook/ui/sonner");
const react_2 = require("react");
const useSubscription = () => {
    const state = (0, state_1.useStateManager)();
    const { data: subscription, refetch: refetchSubscription } = react_1.api.subscription.get.useQuery(undefined, {
        refetchInterval: state.isSubscriptionModalOpen ? 3000 : false,
    });
    const [isCheckingSubscription, setIsCheckingSubscription] = (0, react_2.useState)(false);
    const isPro = subscription?.product.type === stripe_1.ProductType.PRO;
    const scheduledChange = subscription?.scheduledChange;
    (0, react_2.useEffect)(() => {
        if (isCheckingSubscription && isPro) {
            if (scheduledChange?.scheduledAction === stripe_1.ScheduledSubscriptionAction.PRICE_CHANGE) {
                sonner_1.toast.success('Subscription updated successfully!');
            }
            else if (scheduledChange?.scheduledAction === stripe_1.ScheduledSubscriptionAction.CANCELLATION) {
                sonner_1.toast.success('Subscription cancelled successfully!');
            }
            else {
                sonner_1.toast.success('Subscription activated successfully!');
            }
            setIsCheckingSubscription(false);
        }
    }, [isPro, scheduledChange?.scheduledAction, isCheckingSubscription]);
    return { subscription, isPro, refetchSubscription, isCheckingSubscription, setIsCheckingSubscription };
};
exports.useSubscription = useSubscription;
//# sourceMappingURL=use-subscription.js.map