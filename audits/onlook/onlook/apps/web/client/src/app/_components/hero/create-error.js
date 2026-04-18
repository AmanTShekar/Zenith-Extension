"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateError = void 0;
const create_1 = require("@/components/store/create");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
exports.CreateError = (0, mobx_react_lite_1.observer)(() => {
    const createManager = (0, create_1.useCreateManager)();
    const error = createManager.error;
    return (<react_1.motion.p className="max-w-xl text-center mt-2 p-2 bg-red-900/80 rounded-xl border border-red-500 text-sm text-red-500 px-4" initial={{ opacity: 0, filter: "blur(4px)" }} animate={error ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(4px)" }} transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }} style={{ willChange: "opacity, filter", transform: "translateZ(0)", display: error ? 'block' : 'none' }}>
            {error}
        </react_1.motion.p>);
});
//# sourceMappingURL=create-error.js.map