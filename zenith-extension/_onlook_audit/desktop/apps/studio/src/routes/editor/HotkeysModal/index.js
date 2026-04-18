"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotkeysModal = void 0;
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const kbd_1 = require("@onlook/ui/kbd");
const separator_1 = require("@onlook/ui/separator");
const framer_motion_1 = require("framer-motion");
const mobx_react_lite_1 = require("mobx-react-lite");
const hotkeys_1 = require("/common/hotkeys");
exports.HotkeysModal = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    let HotkeyCategory;
    (function (HotkeyCategory) {
        HotkeyCategory["Tools"] = "Tools";
        HotkeyCategory["AI"] = "AI";
        HotkeyCategory["View"] = "View";
        HotkeyCategory["Edit"] = "Edit";
        HotkeyCategory["Layers"] = "Layers";
        HotkeyCategory["System"] = "System";
    })(HotkeyCategory || (HotkeyCategory = {}));
    const categories = {
        [HotkeyCategory.Tools]: [
            hotkeys_1.Hotkey.SELECT,
            hotkeys_1.Hotkey.PAN,
            hotkeys_1.Hotkey.PREVIEW,
            hotkeys_1.Hotkey.INSERT_DIV,
            hotkeys_1.Hotkey.INSERT_TEXT,
        ],
        [HotkeyCategory.AI]: [hotkeys_1.Hotkey.ADD_AI_CHAT, hotkeys_1.Hotkey.NEW_AI_CHAT],
        [HotkeyCategory.View]: [hotkeys_1.Hotkey.ZOOM_FIT, hotkeys_1.Hotkey.ZOOM_IN, hotkeys_1.Hotkey.ZOOM_OUT],
        [HotkeyCategory.Edit]: [
            hotkeys_1.Hotkey.UNDO,
            hotkeys_1.Hotkey.REDO,
            hotkeys_1.Hotkey.ENTER,
            hotkeys_1.Hotkey.COPY,
            hotkeys_1.Hotkey.PASTE,
            hotkeys_1.Hotkey.CUT,
            hotkeys_1.Hotkey.DUPLICATE,
            hotkeys_1.Hotkey.BACKSPACE,
        ],
        [HotkeyCategory.Layers]: [
            hotkeys_1.Hotkey.GROUP,
            hotkeys_1.Hotkey.UNGROUP,
            hotkeys_1.Hotkey.MOVE_LAYER_UP,
            hotkeys_1.Hotkey.MOVE_LAYER_DOWN,
        ],
        [HotkeyCategory.System]: [hotkeys_1.Hotkey.RELOAD_APP, hotkeys_1.Hotkey.OPEN_DEV_TOOL, hotkeys_1.Hotkey.SHOW_HOTKEYS],
    };
    return (<framer_motion_1.AnimatePresence>
            {editorEngine.isHotkeysOpen && (<>
                    {/* Backdrop */}
                    <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => (editorEngine.isHotkeysOpen = false)}/>

                    {/* Modal */}
                    <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <div className="bg-background border rounded-lg shadow-lg w-[900px] p-0 pointer-events-auto">
                            <div className="flex flex-col">
                                {/* Header */}
                                <div className="flex items-center p-6 pb-2">
                                    <h1 className="text-title3">Keyboard shortcuts</h1>
                                    <button_1.Button variant="ghost" size="icon" className="ml-auto" onClick={() => (editorEngine.isHotkeysOpen = false)}>
                                        <icons_1.Icons.CrossS className="h-4 w-4"/>
                                    </button_1.Button>
                                </div>
                                <separator_1.Separator />

                                {/* Content */}
                                <div className="p-6 pt-2">
                                    <div className="grid grid-cols-3 gap-12">
                                        {/* Modes Column */}

                                        <div className="space-y-8">
                                            {[HotkeyCategory.AI, HotkeyCategory.Edit].map((category) => (<div key={category}>
                                                        <h3 className="text-base font-medium text-muted-foreground mb-4">
                                                            {category}
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {categories[category].map((hotkey) => (<div key={hotkey.command} className="flex justify-between items-center">
                                                                    <span className="text-sm text-popover-foreground">
                                                                        {hotkey.description}
                                                                    </span>
                                                                    <div className="flex items-center gap-1">
                                                                        {hotkey.readableCommand
                        .split(' ')
                        .map((key) => (<kbd_1.Kbd key={`${hotkey.command}-${key}`} className="h-6 px-2 text-[12px] bg-muted/50 text-popover-foreground border-border">
                                                                                    {key}
                                                                                </kbd_1.Kbd>))}
                                                                    </div>
                                                                </div>))}
                                                        </div>
                                                    </div>))}
                                        </div>

                                        {/* Middle Column - Zoom, Text, Copy */}
                                        <div className="space-y-8">
                                            {[HotkeyCategory.Layers, HotkeyCategory.View].map((category) => (<div key={category}>
                                                        <h3 className="text-base font-medium text-muted-foreground mb-4">
                                                            {category}
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {categories[category].map((hotkey) => (<div key={hotkey.command} className="flex justify-between items-center">
                                                                    <span className="text-sm text-popover-foreground">
                                                                        {hotkey.description}
                                                                    </span>
                                                                    <div className="flex items-center gap-1">
                                                                        {hotkey.readableCommand
                        .split(' ')
                        .map((key) => (<kbd_1.Kbd key={`${hotkey.command}-${key}`} className="h-6 px-2 text-[12px] bg-muted/50 text-popover-foreground border-border">
                                                                                    {key}
                                                                                </kbd_1.Kbd>))}
                                                                    </div>
                                                                </div>))}
                                                        </div>
                                                    </div>))}
                                        </div>

                                        {/* Right Column - Actions, Delete */}
                                        <div className="space-y-8">
                                            {[HotkeyCategory.Tools, HotkeyCategory.System].map((category) => (<div key={category}>
                                                        <h3 className="text-base font-medium text-muted-foreground mb-4">
                                                            {category}
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {categories[category].map((hotkey) => (<div key={hotkey.command} className="flex justify-between items-center">
                                                                    <span className="text-sm text-popover-foreground">
                                                                        {hotkey.description}
                                                                    </span>
                                                                    <div className="flex items-center gap-1">
                                                                        {hotkey.readableCommand
                        .split(' ')
                        .map((key) => (<kbd_1.Kbd key={`${hotkey.command}-${key}`} className="h-6 px-2 text-[12px] bg-muted/50 text-popover-foreground border-border">
                                                                                    {key}
                                                                                </kbd_1.Kbd>))}
                                                                    </div>
                                                                </div>))}
                                                        </div>
                                                    </div>))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </framer_motion_1.motion.div>
                </>)}
        </framer_motion_1.AnimatePresence>);
});
//# sourceMappingURL=index.js.map