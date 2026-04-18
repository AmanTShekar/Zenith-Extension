"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnicornBackground = UnicornBackground;
const react_1 = require("motion/react");
const react_2 = require("react");
const next_1 = __importDefault(require("unicornstudio-react/next"));
function UnicornBackground() {
    const containerRef = (0, react_2.useRef)(null);
    (0, react_2.useEffect)(() => {
        const container = containerRef.current;
        if (!container)
            return;
        // Handle wheel events to allow scrolling while keeping mouse interactivity
        const handleWheel = (e) => {
            // Prevent the default to avoid double-scrolling
            e.preventDefault();
            // Manually trigger scroll on the window
            window.scrollBy({
                top: e.deltaY,
                left: e.deltaX,
                behavior: 'auto',
            });
        };
        // Use passive: false so we can call preventDefault()
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);
    return (<react_1.motion.div ref={containerRef} className="absolute inset-0 z-0 h-screen w-screen" style={{
            willChange: 'opacity',
            transform: 'translateZ(0)',
        }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: 'easeOut', delay: 1 }}>
            <next_1.default jsonFilePath="/scenes/flow-background.json" width="100%" height="100%" scale={1} dpi={1} fps={60} onError={(error) => console.error('UnicornScene error:', error)} onLoad={() => console.log('UnicornScene loaded successfully')}/>
        </react_1.motion.div>);
}
//# sourceMappingURL=unicorn-background.js.map