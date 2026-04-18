"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RB2BLoader;
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const env_1 = require("@/env");
function RB2BLoader() {
    const pathname = (0, navigation_1.usePathname)();
    (0, react_1.useEffect)(() => {
        if (!env_1.env.NEXT_PUBLIC_RB2B_ID)
            return;
        const existing = document.getElementById('rb2b-script');
        if (existing)
            existing.remove();
        const script = document.createElement('script');
        script.id = 'rb2b-script';
        script.src = `https://ddwl4m2hdecbv.cloudfront.net/b/${env_1.env.NEXT_PUBLIC_RB2B_ID}/${env_1.env.NEXT_PUBLIC_RB2B_ID}.js.gz`;
        script.async = true;
        document.body.appendChild(script);
    }, [pathname]);
    return null;
}
//# sourceMappingURL=rb2b-loader.js.map