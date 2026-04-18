"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotKeyLabel = HotKeyLabel;
const kbd_1 = require("@onlook/ui/kbd");
const utils_1 = require("@onlook/ui/utils");
function HotKeyLabel({ hotkey, className }) {
    return (<span className={(0, utils_1.cn)('flex items-center space-x-2', className)}>
            <span>{hotkey.description}</span>

            <kbd_1.Kbd>
                <span className="inline-grid grid-flow-col auto-cols-max gap-1.5 items-center text-xs [&_kbd]:text-[1.1em]" dangerouslySetInnerHTML={{ __html: hotkey.readableCommand }}/>
            </kbd_1.Kbd>
        </span>);
}
//# sourceMappingURL=hotkeys-label.js.map