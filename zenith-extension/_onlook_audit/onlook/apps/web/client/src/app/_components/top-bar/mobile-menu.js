"use strict";
'use client';
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
exports.MobileMenu = MobileMenu;
const react_1 = require("react");
const Portal = __importStar(require("@radix-ui/react-portal"));
const accordion_1 = require("@onlook/ui/accordion");
const utils_1 = require("@onlook/ui/utils");
const constants_1 = require("@/utils/constants");
const navigation_1 = require("@/utils/constants/navigation");
function MobileMenu({ isOpen, onOpenChange }) {
    // Handle body scroll lock with class instead of direct style manipulation
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden');
        }
        else {
            document.body.classList.remove('overflow-hidden');
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isOpen]);
    return (<>
            {/* Hamburger button */}
            <button onClick={() => onOpenChange(!isOpen)} className="text-foreground-secondary flex items-center justify-center p-3 hover:opacity-80 md:hidden" aria-label={isOpen ? 'Close menu' : 'Open menu'}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
            </button>

            {/* Backdrop - portaled to body */}
            <Portal.Root>
                <div className={(0, utils_1.cn)('fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-200 md:hidden', 'top-12', // Start below the navbar
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')} onClick={() => onOpenChange(false)} style={{ zIndex: 40 }}/>
            </Portal.Root>

            {/* Menu panel - portaled to body */}
            <Portal.Root>
                <div className={(0, utils_1.cn)('bg-background border-border fixed right-0 left-0 overflow-y-auto border-b shadow-lg transition-all duration-200 md:hidden', 'top-12 max-h-[calc(100vh-3rem)]', isOpen
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-4 opacity-0')} style={{ zIndex: 50 }}>
                    <accordion_1.Accordion type="single" collapsible className="w-full">
                        {navigation_1.NAVIGATION_CATEGORIES.map((category) => (<accordion_1.AccordionItem key={category.label} value={category.label} className="border-border border-b">
                                <accordion_1.AccordionTrigger className="hover:bg-foreground/5 flex w-full items-center justify-between p-4 text-left">
                                    <span className="text-regular text-foreground-primary">
                                        {category.label}
                                    </span>
                                </accordion_1.AccordionTrigger>
                                <accordion_1.AccordionContent className="bg-foreground/5">
                                    {category.links.map((link) => (<a key={link.href} href={link.href} onClick={() => onOpenChange(false)} className="hover:bg-foreground/10 block p-4 pl-8" {...(link.external && {
                target: '_blank',
                rel: 'noopener noreferrer',
            })}>
                                            <div className="text-foreground-primary text-sm font-medium">
                                                {link.title}
                                            </div>
                                            <div className="text-foreground-secondary mt-0.5 text-xs">
                                                {link.description}
                                            </div>
                                        </a>))}
                                </accordion_1.AccordionContent>
                            </accordion_1.AccordionItem>))}
                    </accordion_1.Accordion>

                    {/* Bottom CTA */}
                    <div className="p-4">
                        <a href={constants_1.ExternalRoutes.BOOK_DEMO} target="_blank" rel="noopener noreferrer" onClick={() => onOpenChange(false)} className="bg-foreground-primary text-background block w-full rounded-lg px-4 py-3 text-center text-sm font-medium transition-opacity hover:opacity-90">
                            Book a Demo
                        </a>
                    </div>
                </div>
            </Portal.Root>
        </>);
}
//# sourceMappingURL=mobile-menu.js.map