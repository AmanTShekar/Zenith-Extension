"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecenterCanvasButton = void 0;
const editor_1 = require("@/components/store/editor");
const button_1 = require("@onlook/ui/button");
const lucide_react_1 = require("lucide-react");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
exports.RecenterCanvasButton = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    return (<react_1.AnimatePresence>
            {editorEngine.frameEvent.isCanvasOutOfView && (<react_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full text-center">
                    <p className="text-foreground-secondary mb-2">Your canvas is out of view</p>
                    <button_1.Button onClick={editorEngine.frameEvent.recenterCanvas}>
                        <lucide_react_1.Scan className="size-4"/>
                        <span>Re-Center the Canvas</span>
                    </button_1.Button>
                </react_1.motion.div>)}
        </react_1.AnimatePresence>);
});
//# sourceMappingURL=recenter-canvas-button.js.map