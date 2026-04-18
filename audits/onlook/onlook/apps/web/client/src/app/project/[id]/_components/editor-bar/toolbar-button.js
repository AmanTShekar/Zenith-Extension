"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolbarButton = void 0;
const button_1 = require("@onlook/ui/button");
const utils_1 = require("@onlook/ui/utils");
const react_1 = require("react");
exports.ToolbarButton = (0, react_1.forwardRef)(({ isOpen = false, variant = 'ghost', size = 'toolbar', enableFocusStyles = false, className, children, ...props }, ref) => {
    const baseClasses = [
        // Base styles
        'border-border/0',
        'text-muted-foreground',
        'cursor-pointer',
        'rounded-lg',
        'border',
        'h-9',
        // Hover styles
        'hover:bg-background-tertiary/20',
        'hover:border-border',
        'hover:text-white',
    ];
    const focusClasses = enableFocusStyles ? [
        'focus:bg-background-tertiary/20',
        'focus:ring-border',
        'focus:ring-1',
        'focus:outline-none',
        'focus-within:bg-background-tertiary/20',
        'focus-within:border-border',
        'focus-within:text-white',
        'focus-visible:ring-0',
        'focus-visible:ring-offset-0',
    ] : [];
    const openClasses = isOpen ? [
        'bg-background-tertiary/20',
        'border-border',
        'text-white'
    ] : [];
    const allClasses = (0, utils_1.cn)(...baseClasses, ...focusClasses, ...openClasses, className);
    return (<button_1.Button ref={ref} variant={variant} size={size} className={allClasses} {...props}>
                {children}
            </button_1.Button>);
});
exports.ToolbarButton.displayName = 'ToolbarButton';
//# sourceMappingURL=toolbar-button.js.map