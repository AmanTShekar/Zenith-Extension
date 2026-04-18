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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipPortal = void 0;
exports.Tooltip = Tooltip;
exports.TooltipContent = TooltipContent;
exports.TooltipProvider = TooltipProvider;
exports.TooltipTrigger = TooltipTrigger;
const TooltipPrimitive = __importStar(require("@radix-ui/react-tooltip"));
const React = __importStar(require("react"));
const utils_1 = require("../utils");
function TooltipProvider({ delayDuration = 0, disableHoverableContent = false, ...props }) {
    return (<TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} disableHoverableContent={disableHoverableContent} {...props}/>);
}
function Tooltip({ delayDuration, disableHoverableContent, ...props }) {
    return (<TooltipProvider delayDuration={delayDuration} disableHoverableContent={disableHoverableContent}>
            <TooltipPrimitive.Root data-slot="tooltip" {...props}/>
        </TooltipProvider>);
}
function TooltipTrigger({ ...props }) {
    return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props}/>;
}
function TooltipContent({ className, sideOffset = 5, children, hideArrow = false, ...props }) {
    return (<TooltipPrimitive.Portal>
            <TooltipPrimitive.Content data-slot="tooltip-content" sideOffset={sideOffset} className={(0, utils_1.cn)('bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance', className)} {...props}>
                {children}
                {!hideArrow && (<TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"/>)}
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>);
}
const TooltipPortal = TooltipPrimitive.Portal;
exports.TooltipPortal = TooltipPortal;
//# sourceMappingURL=tooltip.js.map