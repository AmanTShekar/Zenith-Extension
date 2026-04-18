"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverOnlyTooltip = HoverOnlyTooltip;
const tooltip_1 = require("@onlook/ui/tooltip");
function HoverOnlyTooltip({ children, content, side = "bottom", className, hideArrow = true, disabled = false, sideOffset = 5, }) {
    if (disabled) {
        return <>{children}</>;
    }
    return (<tooltip_1.Tooltip disableHoverableContent>
      <tooltip_1.TooltipTrigger asChild>{children}</tooltip_1.TooltipTrigger>
      <tooltip_1.TooltipContent side={side} className={className} hideArrow={hideArrow} sideOffset={sideOffset}>
        {content}
      </tooltip_1.TooltipContent>
    </tooltip_1.Tooltip>);
}
//# sourceMappingURL=hover-tooltip.js.map