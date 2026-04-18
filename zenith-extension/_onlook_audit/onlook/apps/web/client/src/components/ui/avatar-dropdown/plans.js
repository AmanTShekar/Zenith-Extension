"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageSection = void 0;
const state_1 = require("@/components/store/state");
const react_1 = require("@/trpc/react");
const stripe_1 = require("@onlook/stripe");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const progress_1 = require("@onlook/ui/progress");
const lodash_1 = require("lodash");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_2 = require("react");
exports.UsageSection = (0, mobx_react_lite_1.observer)(({ open }) => {
    const state = (0, state_1.useStateManager)();
    const { data: subscription, isLoading: subscriptionLoading } = react_1.api.subscription.get.useQuery();
    const { data: usageData, refetch: refetchUsage, isLoading: usageLoading } = react_1.api.usage.get.useQuery();
    const debouncedRefetchUsage = (0, lodash_1.debounce)(refetchUsage, 1000, { leading: true, trailing: false });
    (0, react_2.useEffect)(() => {
        if (open) {
            debouncedRefetchUsage();
        }
    }, [open]);
    const isLoading = subscriptionLoading || usageLoading;
    const product = subscription?.product ?? stripe_1.FREE_PRODUCT_CONFIG;
    const price = product?.type === stripe_1.ProductType.FREE ? 'Trial' : 'Active';
    let usage = product?.type === stripe_1.ProductType.FREE ? usageData?.daily : usageData?.monthly;
    const usagePercent = usage && usage.limitCount > 0 ? usage.usageCount / usage.limitCount * 100 : 0;
    const handleGetMoreCredits = () => {
        state.isSubscriptionModalOpen = true;
    };
    const getSubscriptionChangeMessage = () => {
        let message = '';
        if (subscription?.scheduledChange?.scheduledAction === stripe_1.ScheduledSubscriptionAction.PRICE_CHANGE && subscription.scheduledChange.price) {
            message = `Your ${subscription.scheduledChange.price.monthlyMessageLimit} messages a month plan starts on ${subscription.scheduledChange.scheduledChangeAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }
        else if (subscription?.scheduledChange?.scheduledAction === stripe_1.ScheduledSubscriptionAction.CANCELLATION) {
            message = `Your subscription will end on ${subscription.scheduledChange.scheduledChangeAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }
        if (message) {
            return (<div className="text-amber text-mini text-balance">
                    {message}
                </div>);
        }
    };
    return (<div className="p-4 w-full text-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div>
                    {isLoading ? (<>
                            <div className="text-sm h-4 bg-muted rounded animate-pulse mb-1 w-24"></div>
                            <div className="text-muted-foreground h-4 bg-muted rounded animate-pulse w-16"></div>
                        </>) : (<>
                            <div className="text-sm">{product.name}</div>
                            <div className="text-muted-foreground">{price}</div>
                        </>)}
                </div>
                <div className="text-right">
                    {isLoading ? (<>
                            <div className="text-sm h-4 bg-muted rounded animate-pulse mb-1 w-20"></div>
                            <div className="text-muted-foreground h-4 bg-muted rounded animate-pulse w-24"></div>
                        </>) : (<>
                            <div>{usage?.usageCount ?? 0} <span className="text-muted-foreground">of</span> {usage?.limitCount ?? 0}</div>
                            <div className="text-muted-foreground">{usage?.period === 'day' ? 'daily' : 'monthly'} chats used</div>
                        </>)}
                </div>
            </div>
            {!isLoading && getSubscriptionChangeMessage()}
            <progress_1.Progress value={isLoading ? 0 : usagePercent} className="w-full"/>
            <button_1.Button className="w-full flex items-center justify-center gap-2 bg-blue-400 text-white hover:bg-blue-500" onClick={handleGetMoreCredits}>
                <icons_1.Icons.Sparkles className="mr-1 h-4 w-4"/> Get more Credits
            </button_1.Button>
        </div>);
});
//# sourceMappingURL=plans.js.map