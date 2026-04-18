"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Layout;
const constants_1 = require("@/utils/constants");
const server_1 = require("@/utils/supabase/server");
const subscription_1 = require("@/utils/subscription");
const navigation_1 = require("next/navigation");
async function Layout({ children }) {
    const supabase = await (0, server_1.createClient)();
    const { data: { session }, } = await supabase.auth.getSession();
    if (!session) {
        (0, navigation_1.redirect)(constants_1.Routes.LOGIN);
    }
    // Check if user has an active subscription
    const { hasActiveSubscription, hasLegacySubscription } = await (0, subscription_1.checkUserSubscriptionAccess)(session.user.id, session.user.email);
    // If no subscription, redirect to demo page
    if (!hasActiveSubscription && !hasLegacySubscription) {
        (0, navigation_1.redirect)(constants_1.Routes.DEMO_ONLY);
    }
    return <>{children}</>;
}
//# sourceMappingURL=layout.js.map