"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionModal = void 0;
const dunes_create_dark_png_1 = __importDefault(require("@/assets/dunes-create-dark.png"));
const dunes_create_light_png_1 = __importDefault(require("@/assets/dunes-create-light.png"));
const Context_1 = require("@/components/Context");
const ThemeProvider_1 = require("@/components/ThemeProvider");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const usage_1 = require("@onlook/models/usage");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const use_toast_1 = require("@onlook/ui/use-toast");
const framer_motion_1 = require("framer-motion");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const PricingCard_1 = require("./PricingCard");
exports.SubscriptionModal = (0, mobx_react_lite_1.observer)(() => {
    const userManager = (0, Context_1.useUserManager)();
    const editorEngine = (0, Context_1.useEditorEngine)();
    const { t } = (0, react_i18next_1.useTranslation)();
    const { theme } = (0, ThemeProvider_1.useTheme)();
    const [backgroundImage, setBackgroundImage] = (0, react_1.useState)(dunes_create_light_png_1.default);
    const [isCheckingOut, setIsCheckingOut] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const determineBackgroundImage = () => {
            if (theme === constants_1.Theme.Dark) {
                return dunes_create_dark_png_1.default;
            }
            else if (theme === constants_1.Theme.Light) {
                return dunes_create_light_png_1.default;
            }
            else if (theme === constants_1.Theme.System) {
                return window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? dunes_create_dark_png_1.default
                    : dunes_create_light_png_1.default;
            }
            return dunes_create_light_png_1.default;
        };
        setBackgroundImage(determineBackgroundImage());
    }, [theme]);
    (0, react_1.useEffect)(() => {
        let pollInterval = null;
        const getPlan = async () => {
            const plan = await userManager.subscription.getPlanFromServer();
            if (plan === usage_1.UsagePlanType.PRO) {
                editorEngine.chat.stream.clearRateLimited();
                editorEngine.chat.stream.clearErrorMessage();
            }
            setIsCheckingOut(null);
        };
        if (editorEngine.isPlansOpen) {
            getPlan();
            pollInterval = setInterval(getPlan, 3000);
        }
        // Cleanup function to clear interval when component unmounts or isPlansOpen changes
        return () => {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [editorEngine.isPlansOpen]);
    const startProCheckout = async () => {
        (0, utils_1.sendAnalytics)('start pro checkout');
        try {
            setIsCheckingOut(usage_1.UsagePlanType.PRO);
            const res = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.CREATE_STRIPE_CHECKOUT);
            if (res?.success) {
                (0, use_toast_1.toast)({
                    variant: 'default',
                    title: t('pricing.toasts.checkingOut.title'),
                    description: t('pricing.toasts.checkingOut.description'),
                });
            }
            else {
                throw new Error('No checkout URL received');
            }
            setIsCheckingOut(null);
        }
        catch (error) {
            (0, use_toast_1.toast)({
                variant: 'destructive',
                title: t('pricing.toasts.error.title'),
                description: t('pricing.toasts.error.description'),
            });
            console.error('Payment error:', error);
            setIsCheckingOut(null);
        }
    };
    const manageSubscription = async () => {
        try {
            setIsCheckingOut(usage_1.UsagePlanType.BASIC);
            const res = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.MANAGE_SUBSCRIPTION);
            if (res?.success) {
                (0, use_toast_1.toast)({
                    variant: 'default',
                    title: t('pricing.toasts.redirectingToStripe.title'),
                    description: t('pricing.toasts.redirectingToStripe.description'),
                });
            }
            if (res?.error) {
                throw new Error(res.error);
            }
            setIsCheckingOut(null);
        }
        catch (error) {
            console.error('Error managing subscription:', error);
            (0, use_toast_1.toast)({
                variant: 'destructive',
                title: 'Error managing subscription',
                description: `${error}`,
            });
            setIsCheckingOut(null);
        }
    };
    return (<framer_motion_1.AnimatePresence>
            {editorEngine.isPlansOpen && (<framer_motion_1.motion.div className="fixed inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="relative w-full h-full flex items-center justify-center" style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
                        <div className="absolute inset-0 bg-background/50"/>
                        <button_1.Button variant="ghost" onClick={() => (editorEngine.isPlansOpen = false)} className="fixed top-8 right-10 text-foreground-secondary">
                            <index_1.Icons.CrossL className="h-4 w-4"/>
                        </button_1.Button>
                        <div className="relative z-10">
                            <framer_motion_1.MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
                                <framer_motion_1.motion.div className="flex flex-col items-center gap-3">
                                    <framer_motion_1.motion.div className="flex flex-col gap-2 text-center mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                                        <div className="flex flex-row gap-2 w-[46rem] justify-between">
                                            <h1 className="text-title2 text-foreground-primary">
                                                {userManager.subscription.plan === usage_1.UsagePlanType.PRO
                ? t('pricing.titles.proMember')
                : t('pricing.titles.choosePlan')}
                                            </h1>
                                        </div>
                                    </framer_motion_1.motion.div>
                                    <div className="flex gap-4">
                                        <PricingCard_1.PricingCard plan={t('pricing.plans.basic.name')} price={t('pricing.plans.basic.price')} description={t('pricing.plans.basic.description')} features={t('pricing.plans.basic.features', {
                returnObjects: true,
                dailyMessages: 5,
                monthlyMessages: 50,
            })} buttonText={userManager.subscription.plan ===
                usage_1.UsagePlanType.BASIC
                ? t('pricing.buttons.currentPlan')
                : t('pricing.buttons.manageSubscription')} buttonProps={{
                onClick: () => {
                    manageSubscription();
                },
                disabled: userManager.subscription.plan ===
                    usage_1.UsagePlanType.BASIC ||
                    isCheckingOut === 'basic',
            }} delay={0.1} isLoading={isCheckingOut === 'basic'}/>
                                        <PricingCard_1.PricingCard plan={t('pricing.plans.pro.name')} price={t('pricing.plans.pro.price')} description={t('pricing.plans.pro.description')} features={t('pricing.plans.pro.features', {
                returnObjects: true,
            })} buttonText={userManager.subscription.plan === usage_1.UsagePlanType.PRO
                ? t('pricing.buttons.currentPlan')
                : t('pricing.buttons.getPro')} buttonProps={{
                onClick: startProCheckout,
                disabled: userManager.subscription.plan ===
                    usage_1.UsagePlanType.PRO ||
                    isCheckingOut === 'pro',
            }} delay={0.2} isLoading={isCheckingOut === 'pro'}/>
                                    </div>
                                    <framer_motion_1.motion.div className="flex flex-col gap-2 text-center" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                        <p className="text-foreground-secondary/60 text-small text-balance">
                                            {t('pricing.footer.unusedMessages')}
                                        </p>
                                    </framer_motion_1.motion.div>
                                </framer_motion_1.motion.div>
                            </framer_motion_1.MotionConfig>
                        </div>
                    </div>
                </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>);
});
//# sourceMappingURL=PricingPage.js.map