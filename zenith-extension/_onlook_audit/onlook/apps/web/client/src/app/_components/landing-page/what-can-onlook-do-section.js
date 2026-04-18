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
exports.WhatCanOnlookDoSection = WhatCanOnlookDoSection;
const react_1 = __importStar(require("react"));
const fonts_1 = require("@/app/fonts");
const ai_chat_preview_block_1 = require("./feature-blocks/ai-chat-preview-block");
const brand_compliance_1 = require("./feature-blocks/brand-compliance");
const components_1 = require("./feature-blocks/components");
const direct_editing_1 = require("./feature-blocks/direct-editing");
const layers_1 = require("./feature-blocks/layers");
const revision_history_1 = require("./feature-blocks/revision-history");
// Hook to detect operating system
function useOperatingSystem() {
    const [os, setOs] = (0, react_1.useState)('unknown');
    (0, react_1.useEffect)(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('mac')) {
            setOs('mac');
        }
        else if (userAgent.includes('win')) {
            setOs('windows');
        }
        else if (userAgent.includes('linux')) {
            setOs('linux');
        }
        else {
            setOs('unknown');
        }
    }, []);
    return os;
}
function VersionRow({ title, subtitle, children, selected, onClick }) {
    return (<div className={`flex flex-row items-center justify-between px-4 py-3 cursor-pointer transition-colors ${selected ? 'bg-background-onlook/90' : 'bg-transparent'} hover:bg-background-onlook/90`} onClick={onClick}>
            <div>
                <div className="text-foreground-primary text-mini font-medium mb-1">{title}</div>
                <div className="text-foreground-tertiary text-mini font-light">{subtitle}</div>
            </div>
            {children && <div className="flex flex-row gap-1">{children}</div>}
        </div>);
}
function ParallaxContainer({ children, speed = 0.1 }) {
    const containerRef = (0, react_1.useRef)(null);
    const [transform, setTransform] = (0, react_1.useState)(0);
    const ticking = (0, react_1.useRef)(false);
    const lastScrollY = (0, react_1.useRef)(0);
    const updateTransform = (0, react_1.useCallback)(() => {
        if (!containerRef.current)
            return;
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // Calculate how far the element is from the center of the viewport
        const distanceFromCenter = rect.top + rect.height / 2 - viewportHeight / 2;
        // Apply transform based on distance from center
        setTransform(distanceFromCenter * speed);
        ticking.current = false;
    }, [speed]);
    (0, react_1.useEffect)(() => {
        const handleScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    updateTransform();
                });
                ticking.current = true;
            }
        };
        // Use passive scroll listener for better performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        updateTransform(); // Initial calculation
        return () => window.removeEventListener('scroll', handleScroll);
    }, [updateTransform]);
    return (<div ref={containerRef} style={{
            transform: `translate3d(0, ${transform}px, 0)`,
            transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            perspective: '1000px'
        }}>
            {children}
        </div>);
}
function WhatCanOnlookDoSection() {
    // Detect operating system for keyboard shortcuts
    const os = useOperatingSystem();
    // Carousel state for Demo Sites
    const [selectedVersionIdx, setSelectedVersionIdx] = (0, react_1.useState)(0);
    const [displayedImageIdx, setDisplayedImageIdx] = (0, react_1.useState)(0); // New state for delayed image display
    const [isAnimating, setIsAnimating] = (0, react_1.useState)(false);
    const [isFading, setIsFading] = (0, react_1.useState)(false);
    const [selectedElement, setSelectedElement] = (0, react_1.useState)('text2');
    const [isUserSelected, setIsUserSelected] = (0, react_1.useState)(false);
    const [lastUserInteraction, setLastUserInteraction] = (0, react_1.useState)(Date.now());
    // Keyboard shortcut carousel state
    const [shortcutLetterIdx, setShortcutLetterIdx] = (0, react_1.useState)(0);
    const [isShortcutAnimating, setIsShortcutAnimating] = (0, react_1.useState)(false);
    // Demo colors for carousel
    const demoColors = [
        'bg-gradient-to-br from-gray-400 to-gray-700',
        'bg-gradient-to-br from-gray-400 to-gray-700',
        'bg-gradient-to-br from-gray-400 to-gray-700',
        'bg-gradient-to-br from-gray-400 to-gray-700',
    ];
    // Demo images for carousel (null if no image)
    const demoImages = [
        '/assets/site-version-1.png',
        '/assets/site-version-2.png',
        '/assets/site-version-3.png',
        '/assets/site-version-4.png',
    ];
    // Version data for Today section
    const todayVersions = [
        { title: 'New typography and layout', subtitle: 'Alessandro · 3h ago' },
        { title: 'Save before publishing', subtitle: 'Onlook · 10h ago' },
        { title: 'Added new background image', subtitle: 'Sandra · 12h ago' },
        { title: 'Copy improvements and new branding', subtitle: 'Jonathan · 3d ago' },
    ];
    // Keyboard shortcut letters to cycle through
    const shortcutLetters = ['Z', 'X', 'C', 'V', 'D', 'G', 'A', 'S'];
    // Get the appropriate keyboard shortcut text
    const getKeyboardShortcut = () => {
        const currentLetter = shortcutLetters[shortcutLetterIdx];
        switch (os) {
            case 'mac':
                return `CMD+${currentLetter}`;
            case 'windows':
            case 'linux':
                return `Ctrl+${currentLetter}`;
            default:
                return `CMD/CTRL+${currentLetter}`; // Fallback for unknown OS
        }
    };
    (0, react_1.useEffect)(() => {
        setIsAnimating(true);
        setIsFading(true);
        const timer = setTimeout(() => {
            setIsAnimating(false);
            setIsFading(false);
        }, 200);
        return () => clearTimeout(timer);
    }, [selectedVersionIdx]);
    // Delayed image update effect
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => {
            setDisplayedImageIdx(selectedVersionIdx);
        }, 230); // 0.23 second delay
        return () => clearTimeout(timer);
    }, [selectedVersionIdx]);
    // Auto-rotation effect
    (0, react_1.useEffect)(() => {
        const rotationInterval = setInterval(() => {
            const now = Date.now();
            // Only rotate if it's been 4 seconds since last user interaction
            if (now - lastUserInteraction >= 4000) {
                setSelectedVersionIdx((prev) => (prev + 1) % demoColors.length);
            }
        }, 4000);
        return () => clearInterval(rotationInterval);
    }, [lastUserInteraction]);
    // Keyboard shortcut rotation effect
    (0, react_1.useEffect)(() => {
        const shortcutInterval = setInterval(() => {
            setIsShortcutAnimating(true);
            setTimeout(() => {
                setShortcutLetterIdx((prev) => (prev + 1) % shortcutLetters.length);
                setIsShortcutAnimating(false);
            }, 150); // Blur out duration
        }, 2000); // Change every 2 seconds
        return () => clearInterval(shortcutInterval);
    }, [shortcutLetters.length]);
    // Handle version selection
    const handleVersionSelect = (idx) => {
        setSelectedVersionIdx(idx);
        setLastUserInteraction(Date.now());
    };
    const handleResize = (e, position) => {
        e.stopPropagation();
        const element = e.currentTarget;
        const parent = element.parentElement;
        parent.draggable = false;
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parent.offsetWidth;
        const startHeight = parent.offsetHeight;
        const startLeft = parent.offsetLeft;
        const startTop = parent.offsetTop;
        const handleMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;
            switch (position) {
                case 'bottom-right':
                    newWidth = Math.max(100, startWidth + deltaX);
                    newHeight = Math.max(30, startHeight + deltaY);
                    break;
                case 'bottom-left':
                    newWidth = Math.max(100, startWidth - deltaX);
                    newHeight = Math.max(30, startHeight + deltaY);
                    newLeft = startLeft + (startWidth - newWidth);
                    break;
                case 'top-right':
                    newWidth = Math.max(100, startWidth + deltaX);
                    newHeight = Math.max(30, startHeight - deltaY);
                    newTop = startTop + (startHeight - newHeight);
                    break;
                case 'top-left':
                    newWidth = Math.max(100, startWidth - deltaX);
                    newHeight = Math.max(30, startHeight - deltaY);
                    newLeft = startLeft + (startWidth - newWidth);
                    newTop = startTop + (startHeight - newHeight);
                    break;
            }
            parent.style.width = `${newWidth}px`;
            parent.style.height = `${newHeight}px`;
            parent.style.left = `${newLeft}px`;
            parent.style.top = `${newTop}px`;
            parent.style.transform = 'none';
        };
        const handleMouseUp = () => {
            parent.draggable = true;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    const handleClick = (elementId) => {
        setSelectedElement(elementId);
    };
    const handleClickOutside = (e) => {
        const target = e.target;
        if (!target.closest('.draggable-text')) {
            setSelectedElement(null);
        }
    };
    (0, react_1.useEffect)(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    return (<>
            <div className="w-full max-w-6xl mx-auto py-32 px-8 flex flex-col md:flex-row gap-24 md:gap-24">
                {/* Left Column */}
                <div className="flex-1 flex flex-col gap-24">
                <div className="flex-1">
                    <h2 className="text-4xl lg:text-5xl font-light text-foreground-primary leading-tight">
                        <span className="bg-gradient-to-l from-white/20 via-white/90 to-white/20 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer filter drop-shadow-[0_0_14px_rgba(255,255,255,1)]">AI</span> <span className="text-foreground-tertiary">•</span> <span className="font-mono">Code</span> <span className="text-foreground-tertiary">•</span> <span className={`${fonts_1.vujahdayScript.className} not-italic text-6xl large:text-6xl`}>Design</span><br /> Side-by-side-by-side
                    </h2>
                </div>
                    <direct_editing_1.DirectEditingBlock />
                    <components_1.ComponentsBlock />
                    <revision_history_1.RevisionHistory />
                </div>
                {/* Right Column */}
                <div className="flex-1 flex flex-col gap-24 mt-16">
                    <ai_chat_preview_block_1.AiChatPreviewBlock />
                    <brand_compliance_1.BrandComplianceBlock />
                    <layers_1.LayersBlock />
                </div>
            </div>
            {/* Grid extension section */}
            <div className="w-full max-w-6xl mx-auto py-32 px-8">
                <h2 className="text-foreground-primary text-6xl text-right leading-[1.1] font-light mb-20">...and so<br />much more</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-20">
                    <div>
                        <div className="text-foreground-primary text-regularPlus mb-2 text-balance">Works With Your Codebase</div>
                        <div className="text-foreground-secondary text-regular text-balance">Connect your existing React, Next.js, or Vue project. No rebuilding. No migration. Start designing in minutes.</div>
                    </div>
                    <div>
                        <div className="text-foreground-primary text-regularPlus mb-2 text-balance">Built for Teams</div>
                        <div className="text-foreground-secondary text-regular text-balance">Share your canvas. Leave spatial comments. Work together on designs that become real PRs.</div>
                    </div>
                    <div>
                        <div className="text-foreground-primary text-regularPlus mb-2 text-balance">Direct GitHub Integration</div>
                        <div className="text-foreground-secondary text-regular text-balance">Push changes directly to your repository. Review diffs before committing.</div>
                    </div>
                    <div>
                        <div className="text-foreground-primary text-regularPlus mb-2 text-balance">Ship PRs, Not Prototypes</div>
                        <div className="text-foreground-secondary text-regular text-balance">Your changes become a real pull request. Engineers review and merge — no handoff, no translation.</div>
                    </div>
                    <div>
                        <div className="text-foreground-primary text-regularPlus mb-2 text-balance">Power User Shortcuts</div>
                        <div className="text-foreground-secondary text-regular text-balance">
                            All your familiar hotkeys work here. <span className={`transition-all duration-250 inline-block ${isShortcutAnimating ? 'blur-sm opacity-50 -translate-x-1' : 'blur-0 opacity-100 translate-x-0'}`}>{getKeyboardShortcut()}</span> and everything in between.
                        </div>
                    </div>
                    <div>
                        <div className="text-foreground-primary text-regularPlus mb-2 text-balance">Reference Anything in Chat</div>
                        <div className="text-foreground-secondary text-regular text-balance">Drop images, mockups, or docs into your conversation. AI uses them as context for better results.</div>
                    </div>
                </div>
            </div>
        </>);
}
//# sourceMappingURL=what-can-onlook-do-section.js.map