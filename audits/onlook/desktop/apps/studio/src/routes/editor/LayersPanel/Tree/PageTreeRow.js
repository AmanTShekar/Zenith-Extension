"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@onlook/ui/utils");
const react_1 = require("react");
const PageTreeRow = (0, react_1.forwardRef)(({ attrs, children, isHighlighted }, ref) => {
    return (<div ref={ref} {...attrs} className={(0, utils_1.cn)('outline-none h-6 cursor-pointer w-full rounded', 'text-foreground-onlook/70', !attrs['aria-selected'] && [
            isHighlighted && 'bg-background-onlook text-foreground-primary',
            'hover:text-foreground-primary hover:bg-background-onlook',
        ], attrs['aria-selected'] && [
            '!bg-[#FA003C] dark:!bg-[#FA003C]',
            '!text-primary dark:!text-primary',
            '![&]:hover:bg-[#FA003C] dark:[&]:hover:bg-[#FA003C]',
        ])}>
            {children}
        </div>);
});
PageTreeRow.displayName = 'PageTreeRow';
exports.default = PageTreeRow;
//# sourceMappingURL=PageTreeRow.js.map