"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = Layout;
const constants_1 = require("@/utils/constants");
const server_1 = require("@/utils/supabase/server");
const subscription_1 = require("@/utils/subscription");
const url_1 = require("@/utils/url");
const headers_1 = require("next/headers");
const navigation_1 = require("next/navigation");
exports.metadata = {
    title: 'Onlook',
    description: 'Onlook – Projects',
};
async function Layout({ children }) {
    const supabase = await (0, server_1.createClient)();
    const { data: { session }, } = await supabase.auth.getSession();
    if (!session) {
        const headersList = await (0, headers_1.headers)();
        const pathname = headersList.get('x-pathname') || constants_1.Routes.PROJECTS;
        (0, navigation_1.redirect)(`${constants_1.Routes.LOGIN}?${(0, url_1.getReturnUrlQueryParam)(pathname)}`);
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