"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryProvider = TelemetryProvider;
const env_1 = require("@/env");
const react_1 = require("@/trpc/react");
const navigation_1 = require("next/navigation");
const posthog_js_1 = __importDefault(require("posthog-js"));
const react_2 = require("posthog-js/react");
const react_3 = require("react");
// TelemetryProvider
// Unified initialization and identity management for analytics/feedback tools.
// - Initializes PostHog (analytics) and Gleap (feedback) when configured via env.
// - Identifies users once from a single source: Supabase user.id via TRPC.
// - Clears identities on user sign-out (see utils/telemetry/resetTelemetry).
// - Keeps PostHog React context so existing `usePostHog()` calls continue to work.
let gleapSingleton = null;
function TelemetryProvider({ children }) {
    const { data: user } = react_1.api.user.get.useQuery();
    const pathname = (0, navigation_1.usePathname)();
    // Initialize SDKs once
    (0, react_3.useEffect)(() => {
        if (env_1.env.NEXT_PUBLIC_POSTHOG_KEY) {
            try {
                posthog_js_1.default.init(env_1.env.NEXT_PUBLIC_POSTHOG_KEY, {
                    api_host: env_1.env.NEXT_PUBLIC_POSTHOG_HOST,
                    capture_pageview: "history_change",
                    capture_pageleave: true,
                    capture_exceptions: true,
                });
            }
            catch (e) {
                console.warn("PostHog init failed", e);
            }
        }
        else {
            console.warn("PostHog key is not set, skipping initialization");
        }
        if (env_1.env.NEXT_PUBLIC_GLEAP_API_KEY) {
            (async () => {
                try {
                    // Dynamic import to avoid hard dependency when not installed
                    const mod = await Promise.resolve().then(() => __importStar(require("gleap")));
                    gleapSingleton = mod.default ?? mod;
                    gleapSingleton.initialize(env_1.env.NEXT_PUBLIC_GLEAP_API_KEY);
                }
                catch (e) {
                    console.warn("Gleap init failed (is dependency installed?)", e);
                }
            })();
        }
    }, []);
    // Identify or clear identity on user changes
    (0, react_3.useEffect)(() => {
        try {
            if (user) {
                const fullName = user.displayName || [user.firstName, user.lastName].filter(Boolean).join(" ");
                posthog_js_1.default.identify(user.id, {
                    // Reserved PostHog person properties
                    $email: user.email,
                    $name: fullName,
                    $avatar: user.avatarUrl,
                    // Custom person properties (kept for compatibility)
                    firstName: user.firstName,
                    lastName: user.lastName,
                    displayName: user.displayName,
                    email: user.email,
                    avatar_url: user.avatarUrl,
                }, {
                    signup_date: new Date().toISOString(),
                });
            }
            else {
                // If user is signed out, reset PostHog identity
                posthog_js_1.default.reset();
            }
        }
        catch (e) {
            console.error("PostHog identify/reset error:", e);
        }
        if (!env_1.env.NEXT_PUBLIC_GLEAP_API_KEY)
            return;
        (async () => {
            try {
                const Gleap = gleapSingleton ?? (await Promise.resolve().then(() => __importStar(require("gleap")))).default;
                if (user) {
                    const name = user.displayName || [user.firstName, user.lastName].filter(Boolean).join(" ");
                    Gleap.identify(user.id, {
                        name,
                        email: user.email,
                        // Attach non-sensitive profile context
                        customData: {
                            displayName: user.displayName,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            avatarUrl: user.avatarUrl,
                        },
                    });
                }
                else {
                    Gleap.clearIdentity();
                }
            }
            catch (e) {
                // Safe to ignore if Gleap is not present
                // console.warn("Gleap identify/clear failed:", e);
            }
        })();
    }, [user]);
    // Soft re-initialize Gleap on path changes to guard against soft reloads/HMR
    (0, react_3.useEffect)(() => {
        if (!env_1.env.NEXT_PUBLIC_GLEAP_API_KEY)
            return;
        (async () => {
            try {
                const Gleap = gleapSingleton ?? (await Promise.resolve().then(() => __importStar(require("gleap")))).default;
                if (Gleap?.getInstance?.()?.softReInitialize) {
                    Gleap?.getInstance()?.softReInitialize();
                }
            }
            catch {
                // ignore
            }
        })();
    }, [pathname]);
    return <react_2.PostHogProvider client={posthog_js_1.default}>{children}</react_2.PostHogProvider>;
}
//# sourceMappingURL=telemetry-provider.js.map