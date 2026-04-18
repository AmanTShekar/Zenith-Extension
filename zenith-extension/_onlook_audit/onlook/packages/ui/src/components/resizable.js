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
exports.ResizablePanel = void 0;
exports.useResizable = useResizable;
const utils_1 = require("@onlook/ui/utils");
const react_1 = __importStar(require("react"));
function useResizable({ defaultWidth = 240, minWidth = 200, maxWidth = 600, side = 'left', forceWidth, }) {
    const [width, setWidth] = (0, react_1.useState)(defaultWidth);
    const [isAnimating, setIsAnimating] = (0, react_1.useState)(false);
    const isDragging = (0, react_1.useRef)(false);
    const startPos = (0, react_1.useRef)(0);
    const startWidth = (0, react_1.useRef)(0);
    // Effect to handle forced width changes
    (0, react_1.useEffect)(() => {
        if (forceWidth !== undefined) {
            setIsAnimating(true);
            setWidth(forceWidth);
            // Reset animating after transition completes
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [forceWidth]);
    const handleMouseDown = (0, react_1.useCallback)((e) => {
        isDragging.current = true;
        startPos.current = e.clientX;
        startWidth.current = width;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [width]);
    const handleMouseMove = (0, react_1.useCallback)((e) => {
        if (!isDragging.current)
            return;
        const delta = e.clientX - startPos.current;
        let newWidth = side === 'left' ? startWidth.current + delta : startWidth.current - delta;
        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        setWidth(newWidth);
    }, [side, minWidth, maxWidth]);
    const handleMouseUp = (0, react_1.useCallback)(() => {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);
    (0, react_1.useEffect)(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);
    return { width, handleMouseDown, isAnimating };
}
const ResizablePanel = ({ children, side = 'left', defaultWidth = 240, minWidth = 200, maxWidth = 600, forceWidth, className, ...props }) => {
    const { width, handleMouseDown, isAnimating } = useResizable({
        defaultWidth,
        minWidth,
        maxWidth,
        side,
        forceWidth,
    });
    return (<div style={{ width: `${width}px` }} className={(0, utils_1.cn)('h-full relative', isAnimating && 'transition-[width] duration-300 ease-in-out', side === 'left' ? 'left-0' : 'right-0', className)} {...props}>
            <div className="h-full">{children}</div>
            <div className={(0, utils_1.cn)('absolute top-0 h-full w-1 cursor-col-resize transition-all hover:bg-border/50 group/panel-hover:bg-border/30', side === 'left' ? 'right-0' : 'left-0')} onMouseDown={handleMouseDown}/>
        </div>);
};
exports.ResizablePanel = ResizablePanel;
//# sourceMappingURL=resizable.js.map