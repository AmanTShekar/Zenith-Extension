"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthRedirect;
const constants_1 = require("@/utils/constants");
const url_1 = require("@/utils/url");
const localforage_1 = __importDefault(require("localforage"));
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const react_2 = require("@/trpc/react");
function AuthRedirect() {
    const router = (0, navigation_1.useRouter)();
    const { data: subscription, isLoading: subscriptionLoading } = react_2.api.subscription.get.useQuery();
    const { data: legacySubscription, isLoading: legacyLoading } = react_2.api.subscription.getLegacySubscriptions.useQuery();
    (0, react_1.useEffect)(() => {
        const handleRedirect = async () => {
            // Wait for both subscription queries to complete
            if (subscriptionLoading || legacyLoading) {
                return;
            }
            const returnUrl = await localforage_1.default.getItem(constants_1.LocalForageKeys.RETURN_URL);
            await localforage_1.default.removeItem(constants_1.LocalForageKeys.RETURN_URL);
            // If user has no active subscription or legacy subscription, redirect to demo-only page
            if (!subscription && !legacySubscription) {
                router.replace(constants_1.Routes.DEMO_ONLY);
                return;
            }
            // Otherwise, redirect to their intended destination
            const sanitizedUrl = (0, url_1.sanitizeReturnUrl)(returnUrl);
            router.replace(sanitizedUrl);
        };
        handleRedirect();
    }, [router, subscription, legacySubscription, subscriptionLoading, legacyLoading]);
    return (<div className="flex h-screen w-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-4">Redirecting...</h1>
                <p className="text-foreground-secondary">Please wait while we redirect you back.</p>
            </div>
        </div>);
}
//# sourceMappingURL=page.js.map