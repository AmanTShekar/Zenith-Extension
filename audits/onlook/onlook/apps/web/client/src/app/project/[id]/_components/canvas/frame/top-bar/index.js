"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopBar = void 0;
const editor_1 = require("@/components/store/editor");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const link_1 = __importDefault(require("next/link"));
const react_1 = require("react");
const hover_tooltip_1 = require("../../../editor-bar/hover-tooltip");
const branch_1 = require("./branch");
const helpers_1 = require("./helpers");
const page_selector_1 = require("./page-selector");
exports.TopBar = (0, mobx_react_lite_1.observer)(({ frame, isInDragSelection = false }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const isSelected = editorEngine.frames.isSelected(frame.id);
    const topBarRef = (0, react_1.useRef)(null);
    const toolBarRef = (0, react_1.useRef)(null);
    const [shouldShowExternalLink, setShouldShowExternalLink] = (0, react_1.useState)(true);
    const mouseDownRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const calculateVisibility = () => {
            if (!topBarRef.current || !toolBarRef.current || !isSelected) {
                setShouldShowExternalLink(false);
                return;
            }
            const topBarWidth = topBarRef.current.clientWidth;
            const toolBarWidth = toolBarRef.current.clientWidth;
            const scale = editorEngine.canvas.scale;
            // Both toolbar and external link are scaled down by (1/scale)
            // So their visual widths are: actualWidth / scale
            const visualToolBarWidth = toolBarWidth / scale;
            const visualExternalLinkWidth = 32 / scale; // Button is ~32px, scaled down
            const padding = 10 / scale; // Some padding between elements, also scaled
            // Calculate if there's enough space for both toolbar and external link
            // Add extra buffer to hide the external link before it gets too cramped
            const totalNeededWidth = visualToolBarWidth + visualExternalLinkWidth + padding;
            const hasEnoughSpace = topBarWidth >= totalNeededWidth;
            setShouldShowExternalLink(hasEnoughSpace);
        };
        // Calculate on mount and when dependencies change
        calculateVisibility();
        // Recalculate when the window resizes or canvas scale changes
        const handleResize = () => calculateVisibility();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSelected, editorEngine.canvas.scale, frame.dimension.width]);
    const handleMouseDown = (e) => {
        // Ignore right clicks or other button presses
        if (e.button !== 0)
            return;
        // Prevent text selection and default behaviors
        e.preventDefault();
        mouseDownRef.current = {
            x: e.clientX,
            y: e.clientY,
            time: Date.now()
        };
        // If not multiselect and the clicked frame is not selected, select it first
        if (!editorEngine.frames.isSelected(frame.id) && !e.shiftKey) {
            editorEngine.frames.select([frame], false);
        }
        // Capture the selected frames after a possible selection update
        const selectedFrames = editorEngine.frames.selected.map((frameData) => frameData.frame);
        const framesToMove = selectedFrames.length > 0 ? selectedFrames : [frame];
        (0, helpers_1.createMouseMoveHandler)(e, {
            editorEngine,
            selectedFrames: framesToMove,
            clearElements
        });
    };
    const clearElements = () => {
        editorEngine.elements.clear();
        editorEngine.overlay.clearUI();
    };
    const handleReload = () => {
        editorEngine.frames.reloadView(frame.id);
    };
    const handleGoBack = async () => {
        await editorEngine.frames.goBack(frame.id);
    };
    const handleGoForward = async () => {
        await editorEngine.frames.goForward(frame.id);
    };
    const handleClick = (e) => {
        if (!mouseDownRef.current) {
            return;
        }
        const currentTime = Date.now();
        const timeDiff = currentTime - mouseDownRef.current.time;
        const distance = Math.sqrt(Math.pow(e.clientX - mouseDownRef.current.x, 2) +
            Math.pow(e.clientY - mouseDownRef.current.y, 2));
        // Don't register click if it was a long hold (>200ms) or significant movement (>5px)
        if (timeDiff > 200 || distance > 5) {
            mouseDownRef.current = null;
            return;
        }
        mouseDownRef.current = null;
        editorEngine.frames.select([frame], e.shiftKey);
    };
    return (<div ref={topBarRef} className={(0, utils_1.cn)('bg-blend-multiply hover:shadow m-auto flex flex-row items-center backdrop-blur-lg overflow-hidden relative shadow-sm border-input text-foreground-secondary group-hover:text-foreground cursor-grab active:cursor-grabbing', isSelected && 'text-teal-400 fill-teal-400', !isSelected && isInDragSelection && 'text-teal-500 fill-teal-500')} style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            ...(isSelected && { backgroundColor: 'rgba(20, 184, 166, 0.1)' }),
            height: `${28 / editorEngine.canvas.scale}px`,
            width: `${frame.dimension.width}px`,
            marginBottom: `${8 / editorEngine.canvas.scale}px`,
            borderRadius: `${8 / editorEngine.canvas.scale}px`,
            paddingTop: `${16 / editorEngine.canvas.scale}px`,
            paddingBottom: `${16 / editorEngine.canvas.scale}px`,
            paddingLeft: `${4 / editorEngine.canvas.scale}px`,
            paddingRight: `${4 / editorEngine.canvas.scale}px`,
        }} onMouseDown={handleMouseDown} onClick={handleClick}>
                <div className="flex flex-row items-center" style={{
            transform: `scale(${1 / editorEngine.canvas.scale})`,
            transformOrigin: 'left center',
        }} ref={toolBarRef}>
                    <hover_tooltip_1.HoverOnlyTooltip content="Go back" side="top" className="mb-1" hideArrow>
                        <button_1.Button variant="ghost" size="sm" className={(0, utils_1.cn)('cursor-pointer rounded-lg h-auto px-1 py-1 hover:!bg-transparent focus:!bg-transparent active:!bg-transparent', !editorEngine.frames.navigation.canGoBack(frame.id) && 'hidden', !isSelected && 'hidden')} onClick={handleGoBack} disabled={!editorEngine.frames.navigation.canGoBack(frame.id)}>
                            <icons_1.Icons.ArrowLeft />
                        </button_1.Button>
                    </hover_tooltip_1.HoverOnlyTooltip>
                    <hover_tooltip_1.HoverOnlyTooltip content="Go forward" side="top" className="mb-1" hideArrow>
                        <button_1.Button variant="ghost" size="sm" className={(0, utils_1.cn)('cursor-pointer rounded-lg h-auto px-1 py-1 hover:!bg-transparent focus:!bg-transparent active:!bg-transparent', !editorEngine.frames.navigation.canGoForward(frame.id) && 'hidden', !isSelected && 'hidden')} onClick={handleGoForward} disabled={!editorEngine.frames.navigation.canGoForward(frame.id)}>
                            <icons_1.Icons.ArrowRight />
                        </button_1.Button>
                    </hover_tooltip_1.HoverOnlyTooltip>
                    <hover_tooltip_1.HoverOnlyTooltip content="Refresh Page" side="top" className="mb-2" hideArrow>
                        <button_1.Button variant="ghost" size="sm" className={(0, utils_1.cn)('cursor-pointer rounded-lg h-auto hover:!bg-transparent focus:!bg-transparent active:!bg-transparent', !isSelected && 'hidden')} onClick={handleReload}>
                            <icons_1.Icons.Reload />
                        </button_1.Button>
                    </hover_tooltip_1.HoverOnlyTooltip>
                    <branch_1.BranchDisplay frame={frame}/>
                    <span className={(0, utils_1.cn)("ml-1.25 mb-0.5", isSelected ? "text-teal-700" : "text-foreground-secondary/50")}>·</span>
                    <page_selector_1.PageSelector frame={frame}/>
                </div>
                <hover_tooltip_1.HoverOnlyTooltip content="Preview in new tab" side="top" hideArrow className="mb-0">
                    <link_1.default className={(0, utils_1.cn)('absolute right-1 top-1/2 -translate-y-1/2 transition-opacity duration-300')} href={frame.url.replace(/\[([^\]]+)\]/g, 'temp-$1')} // Dynamic routes are not supported so we replace them with a temporary value
     target="_blank" style={{
            transform: `scale(${1 / editorEngine.canvas.scale})`,
            transformOrigin: 'right center',
            opacity: shouldShowExternalLink ? 1 : 0,
            pointerEvents: shouldShowExternalLink ? 'auto' : 'none',
        }}>
                        <button_1.Button variant="ghost" size="icon" className="rounded-lg hover:!bg-transparent focus:!bg-transparent active:!bg-transparent">
                            <icons_1.Icons.ExternalLink />
                        </button_1.Button>
                    </link_1.default>
                </hover_tooltip_1.HoverOnlyTooltip>
            </div>);
});
//# sourceMappingURL=index.js.map