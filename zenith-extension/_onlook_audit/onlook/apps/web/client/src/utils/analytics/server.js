"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackEvent = void 0;
const env_1 = require("@/env");
const posthog_node_1 = require("posthog-node");
class PostHogSingleton {
    static instance = null;
    constructor() { }
    static getInstance() {
        if (!env_1.env.NEXT_PUBLIC_POSTHOG_KEY) {
            console.warn('PostHog key not found');
            return null;
        }
        if (!PostHogSingleton.instance) {
            PostHogSingleton.instance = new posthog_node_1.PostHog(env_1.env.NEXT_PUBLIC_POSTHOG_KEY, {
                host: env_1.env.NEXT_PUBLIC_POSTHOG_HOST,
                flushAt: 1,
                flushInterval: 0,
            });
        }
        return PostHogSingleton.instance;
    }
}
const client = PostHogSingleton.getInstance();
const trackEvent = (props) => {
    try {
        client?.capture(props);
    }
    catch (error) {
        console.error('Error tracking event:', error);
    }
};
exports.trackEvent = trackEvent;
//# sourceMappingURL=server.js.map