"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopoverTrigger = exports.PopoverSeparator = exports.PopoverScrollArea = exports.PopoverHeader = exports.PopoverFooter = exports.PopoverContent = exports.PopoverClose = exports.PopoverAnchor = exports.Popover = void 0;
const react_1 = __importDefault(require("react"));
const PopoverPrimitive = __importStar(require("@radix-ui/react-popover"));
const ScrollArea = __importStar(require("@radix-ui/react-scroll-area"));
const SeparatorPrimitive = __importStar(require("@radix-ui/react-separator"));
const class_variance_authority_1 = require("class-variance-authority");
const utils_1 = require("../utils");
const popoverVariants = (0, class_variance_authority_1.cva)([
    'z-1000',
    'border',
    'rounded-md',
    'bg-popover',
    'text-popover-foreground text-sm font-normal',
    'shadow-md',
    'outline-none',
    'p-3',
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
]);
const Popover = PopoverPrimitive.Root;
exports.Popover = Popover;
const PopoverTrigger = PopoverPrimitive.Trigger;
exports.PopoverTrigger = PopoverTrigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
exports.PopoverAnchor = PopoverAnchor;
const PopoverClose = PopoverPrimitive.Close;
exports.PopoverClose = PopoverClose;
const PopoverContent = react_1.default.forwardRef(({ className, align = 'center', sideOffset = 4, children, ...props }, ref) => (<PopoverPrimitive.Portal>
        <PopoverPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className={(0, utils_1.cn)(popoverVariants(), className)} {...props}>
            {children}
        </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>));
exports.PopoverContent = PopoverContent;
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
const PopoverScrollArea = ({ className, children }) => {
    return (<ScrollArea.Root className={(0, utils_1.cn)('w-full h-full', className)} type="auto">
            <ScrollArea.Viewport className="w-full h-full">{children}</ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" className="w-3 pr-1 py-2 -mr-[20px]">
                <ScrollArea.Thumb className="bg-grey-200 w-2 rounded-lg"/>
            </ScrollArea.Scrollbar>
        </ScrollArea.Root>);
};
exports.PopoverScrollArea = PopoverScrollArea;
const PopoverSeparator = react_1.default.forwardRef(({ className, orientation = 'horizontal', fullLength = false, ...props }, ref) => (<div className="w-full">
        <SeparatorPrimitive.Root ref={ref} decorative orientation={orientation} className={(0, utils_1.cn)('shrink-0 bg-border', orientation === 'horizontal' ? 'h-[1px] w-fill' : 'h-fill w-[1px]', fullLength && orientation === 'horizontal' ? '-ml-2 -mr-[20px]' : '', className)} {...props}/>
    </div>));
exports.PopoverSeparator = PopoverSeparator;
PopoverSeparator.displayName = SeparatorPrimitive.Root.displayName;
const PopoverHeader = ({ className, children }) => {
    return (<>
            <div className={(0, utils_1.cn)('w-full pb-4', className)}>{children}</div>
            <PopoverSeparator fullLength/>
        </>);
};
exports.PopoverHeader = PopoverHeader;
const PopoverFooter = ({ className, children }) => {
    return (<div className="w-full -mb-3">
            <PopoverSeparator fullLength/>
            <div className={(0, utils_1.cn)('py-2', className)}>{children}</div>
        </div>);
};
exports.PopoverFooter = PopoverFooter;
//# sourceMappingURL=popover.js.map