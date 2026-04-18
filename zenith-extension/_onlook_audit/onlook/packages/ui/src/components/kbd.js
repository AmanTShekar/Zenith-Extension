"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kbd = Kbd;
const utils_1 = require("../utils");
function Kbd({ children, className }) {
    return (<kbd className={(0, utils_1.cn)('pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-sm border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100', className)}>
            {children}
        </kbd>);
}
//# sourceMappingURL=kbd.js.map