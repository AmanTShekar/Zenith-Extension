"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentContextPill = SentContextPill;
const helpers_1 = require("./helpers");
function SentContextPill({ context }) {
    return (<span className="flex flex-row gap-0.5 text-xs items-center select-none" key={context.displayName}>
            {(0, helpers_1.getContextIcon)(context)}
            <span className="truncate">{(0, helpers_1.getTruncatedName)(context)}</span>
        </span>);
}
//# sourceMappingURL=SentContextPill.js.map