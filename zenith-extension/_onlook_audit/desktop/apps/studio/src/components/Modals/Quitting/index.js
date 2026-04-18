"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuittingModal = void 0;
const Context_1 = require("@/components/Context");
const index_1 = require("@onlook/ui/icons/index");
const framer_motion_1 = require("framer-motion");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.QuittingModal = (0, mobx_react_lite_1.observer)(() => {
    const appStateManager = (0, Context_1.useAppStateManager)();
    return (<framer_motion_1.AnimatePresence>
            {appStateManager.cleaningUp && (<>
                    {/* Backdrop */}
                    <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => (appStateManager.cleaningUp = false)}/>

                    {/* Modal */}
                    <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <div className="bg-background border rounded-lg shadow-lg p-0 pointer-events-auto">
                            <div className="p-10 text-xl flex flex-row gap-2 h-full overflow-hidden items-center justify-center">
                                <index_1.Icons.Shadow className="w-7 h-7 animate-spin"/>
                                <p className="">Closing Onlook...</p>
                            </div>
                        </div>
                    </framer_motion_1.motion.div>
                </>)}
        </framer_motion_1.AnimatePresence>);
});
//# sourceMappingURL=index.js.map