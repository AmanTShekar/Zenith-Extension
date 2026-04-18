"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyPromotion = void 0;
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const framer_motion_1 = require("framer-motion");
const react_1 = require("react");
const sonner_1 = require("sonner");
const react_2 = require("~/trpc/react");
const LegacyPromotion = () => {
    const { data: legacySubscriptions } = react_2.api.subscription.getLegacySubscriptions.useQuery();
    const code = legacySubscriptions?.stripePromotionCode;
    const [isCopied, setIsCopied] = (0, react_1.useState)(false);
    return (<framer_motion_1.AnimatePresence>
            {code && (<framer_motion_1.motion.div className="border border-blue-500 rounded-md p-3 bg-blue-950" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-blue-100 text-left font-semibold">
                        Pro Desktop Users get 1 month free!
                    </p>

                    {/* Coupon Code Section */}
                    <p className="text-sm text-left mb-3 text-blue-200">
                        Use this code to redeem your free month of Tier 1 Pro
                    </p>

                    <div className="flex items-center justify-between rounded px-3 py-2 bg-blue-900">
                        <code className="text-blue-100 text-xs font-mono truncate flex-1 mr-2">
                            {code}
                        </code>
                        <button_1.Button size="sm" className="hover:bg-blue-600 bg-blue-500 rounded-md text-white transition-all duration-300 " onClick={() => {
                navigator.clipboard.writeText(code);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
                sonner_1.toast.success('Copied to clipboard');
            }}>
                            {isCopied ? <index_1.Icons.Check className="w-4 h-4"/> : <index_1.Icons.Copy className="w-4 h-4"/>}
                            {isCopied ? 'Copied' : 'Copy'}
                        </button_1.Button>
                    </div>
                </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>);
};
exports.LegacyPromotion = LegacyPromotion;
//# sourceMappingURL=legacy-promotion.js.map