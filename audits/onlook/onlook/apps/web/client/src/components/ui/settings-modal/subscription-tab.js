"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionTab = void 0;
const state_1 = require("@/components/store/state");
const react_1 = require("@/trpc/react");
const stripe_1 = require("@onlook/stripe");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const separator_1 = require("@onlook/ui/separator");
const sonner_1 = require("@onlook/ui/sonner");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_2 = require("react");
const use_subscription_1 = require("../pricing-modal/use-subscription");
const subscription_cancel_modal_1 = require("./subscription-cancel-modal");
exports.SubscriptionTab = (0, mobx_react_lite_1.observer)(() => {
    const stateManager = (0, state_1.useStateManager)();
    const { subscription, isPro } = (0, use_subscription_1.useSubscription)();
    const [showCancelModal, setShowCancelModal] = (0, react_2.useState)(false);
    const [isManageDropdownOpen, setIsManageDropdownOpen] = (0, react_2.useState)(false);
    const [isLoadingPortal, setIsLoadingPortal] = (0, react_2.useState)(false);
    const manageSubscriptionMutation = react_1.api.subscription.manageSubscription.useMutation({
        onSuccess: (session) => {
            if (session?.url) {
                window.open(session.url, '_blank');
            }
        },
        onError: (error) => {
            console.error('Failed to create portal session:', error);
            sonner_1.toast.error('Failed to create portal session');
        },
        onSettled: () => {
            setIsLoadingPortal(false);
        }
    });
    const handleUpgradePlan = () => {
        stateManager.isSubscriptionModalOpen = true;
        stateManager.isSettingsModalOpen = false;
        setIsManageDropdownOpen(false);
    };
    const handleCancelSubscription = () => {
        setShowCancelModal(true);
        setIsManageDropdownOpen(false);
    };
    const handleConfirmCancel = async () => {
        // Cancellation logic will be implemented later
        setShowCancelModal(false);
        setIsLoadingPortal(true);
        await manageSubscriptionMutation.mutateAsync();
    };
    const handleManageBilling = async () => {
        if (isPro && subscription) {
            setIsLoadingPortal(true);
            await manageSubscriptionMutation.mutateAsync();
        }
    };
    return (<div className="flex flex-col p-8">
            {/* Subscription Section */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-title3 mb-2">Subscription</h2>
                    <p className="text-muted-foreground text-small">
                        Manage your subscription plan and billing
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-4">
                        <div className="space-y-1">
                            <p className="text-regularPlus font-medium">Current Plan</p>
                            <p className="text-small text-muted-foreground">
                                {isPro ? (subscription?.scheduledChange?.scheduledAction === stripe_1.ScheduledSubscriptionAction.CANCELLATION ? (<>Pro plan (cancelling on {subscription.scheduledChange.scheduledChangeAt.toLocaleDateString()})</>) : (<>Pro plan - {subscription?.price?.monthlyMessageLimit || 'Unlimited'} messages per month</>)) : ('You are currently on the Free plan')}
                            </p>
                        </div>
                        <dropdown_menu_1.DropdownMenu open={isManageDropdownOpen} onOpenChange={setIsManageDropdownOpen}>
                            <dropdown_menu_1.DropdownMenuTrigger asChild>
                                <button_1.Button variant="outline" size="sm">
                                    Manage
                                    <icons_1.Icons.ChevronDown className="ml-1 h-3 w-3"/>
                                </button_1.Button>
                            </dropdown_menu_1.DropdownMenuTrigger>
                            <dropdown_menu_1.DropdownMenuContent align="end" className="w-48">
                                {!isPro && (<dropdown_menu_1.DropdownMenuItem onClick={handleUpgradePlan} className="cursor-pointer">
                                        <icons_1.Icons.Sparkles className="mr-2 h-4 w-4"/>
                                        Upgrade plan
                                    </dropdown_menu_1.DropdownMenuItem>)}
                                {isPro && subscription?.scheduledChange?.scheduledAction !== stripe_1.ScheduledSubscriptionAction.CANCELLATION && (<dropdown_menu_1.DropdownMenuItem onClick={handleUpgradePlan} className="cursor-pointer">
                                        <icons_1.Icons.Sparkles className="mr-2 h-4 w-4"/>
                                        Change plan
                                    </dropdown_menu_1.DropdownMenuItem>)}
                                {isPro && (<dropdown_menu_1.DropdownMenuItem onClick={() => {
                subscription?.scheduledChange?.scheduledAction === stripe_1.ScheduledSubscriptionAction.CANCELLATION ? handleManageBilling() : handleCancelSubscription();
            }} disabled={isLoadingPortal} className="cursor-pointer text-red-200 hover:text-red-100 group">
                                        <icons_1.Icons.CrossS className="mr-2 h-4 w-4 text-red-200 group-hover:text-red-100"/>
                                        {subscription?.scheduledChange?.scheduledAction === stripe_1.ScheduledSubscriptionAction.CANCELLATION ? 'Reactivate subscription' : 'Cancel subscription'}
                                    </dropdown_menu_1.DropdownMenuItem>)}
                            </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                    </div>

                    <separator_1.Separator />

                    {/* Payment Section */}
                    <div className="flex items-center justify-between py-4">
                        <div className="space-y-1">
                            <p className="text-regularPlus font-medium">Payment</p>
                            <p className="text-small text-muted-foreground">
                                Manage your payment methods and billing details
                            </p>
                        </div>
                        <button_1.Button variant="outline" size="sm" onClick={handleManageBilling} disabled={isLoadingPortal || !isPro}>
                            {isLoadingPortal ? 'Opening...' : 'Manage'}
                        </button_1.Button>
                    </div>
                </div>
            </div>
            <subscription_cancel_modal_1.SubscriptionCancelModal open={showCancelModal} onOpenChange={setShowCancelModal} onConfirmCancel={handleConfirmCancel}/>
        </div>);
});
//# sourceMappingURL=subscription-tab.js.map