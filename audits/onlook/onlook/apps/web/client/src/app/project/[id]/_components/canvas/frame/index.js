"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameView = void 0;
const editor_1 = require("@/components/store/editor");
const sandbox_1 = require("@/components/store/editor/sandbox");
const icons_1 = require("@onlook/ui/icons");
const tokens_1 = require("@onlook/ui/tokens");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const right_click_menu_1 = require("../../right-click-menu");
const gesture_1 = require("./gesture");
const resize_handles_1 = require("./resize-handles");
const top_bar_1 = require("./top-bar");
const use_frame_reload_1 = require("./use-frame-reload");
const use_sandbox_timeout_1 = require("./use-sandbox-timeout");
const view_1 = require("./view");
const LOADING_MESSAGES = [
    'Starting up your project...',
    'This may take a minute or two...',
    'Initializing development environment...',
    'Tip: Use SHIFT+Click to add multiple elements on the canvas to your prompt',
    'If you have a large project, it may take a while...',
    'Tip: Click the "Branch" icon to create a new version of your project on the canvas',
    'Preparing the visual editor...',
    'Tip: Double-click on an element to open it up in the code editor',
    'Hang in there... seems like a large project...',
    'Thanks for your patience... standby...',
    'Loading your components and assets...',
    'Tip: Select multiple windows by clicking and dragging on the canvas',
    'Getting everything ready for you...',
    'Give it another minute...',
    'Hmmmmm...',
    'You may want to try refreshing your tab...',
    'Still not loading? Try refreshing your browser...',
    'If you\'re seeing this message, it\'s probably because your project is large...',
    'Onlook is still working on it...',
    'If you\'re seeing this message, it\'s probably because your project is large...',
    'If it\'s still not loading, contact support with the ? button in the bottom left corner',
    'If it\'s still not loading, contact support with the ? button in the bottom left corner',
    'If it\'s still not loading, contact support with the ? button in the bottom left corner',
];
exports.FrameView = (0, mobx_react_lite_1.observer)(({ frame, isInDragSelection = false }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const iFrameRef = (0, react_1.useRef)(null);
    const [isResizing, setIsResizing] = (0, react_1.useState)(false);
    const [messageIndex, setMessageIndex] = (0, react_1.useState)(0);
    const MESSAGE_INTERVAL = 12000;
    const { reloadKey, immediateReload, handleConnectionFailed, handleConnectionSuccess, getPenpalTimeout, } = (0, use_frame_reload_1.useFrameReload)();
    const { hasTimedOut, isConnecting } = (0, use_sandbox_timeout_1.useSandboxTimeout)(frame, handleConnectionFailed);
    const isSelected = editorEngine.frames.isSelected(frame.id);
    const branchData = editorEngine.branches.getBranchDataById(frame.branchId);
    const preloadScriptReady = branchData?.sandbox?.preloadScriptState === sandbox_1.PreloadScriptState.INJECTED;
    const isFrameReady = preloadScriptReady && !(isConnecting && !hasTimedOut);
    (0, react_1.useEffect)(() => {
        if (isFrameReady) {
            setMessageIndex(0);
            return;
        }
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, MESSAGE_INTERVAL);
        return () => clearInterval(interval);
    }, [isFrameReady]);
    return (<div className="flex flex-col fixed" style={{ transform: `translate(${frame.position.x}px, ${frame.position.y}px)` }}>
            <right_click_menu_1.RightClickMenu>
                <top_bar_1.TopBar frame={frame} isInDragSelection={isInDragSelection}/>
            </right_click_menu_1.RightClickMenu>
            <div className="relative" style={{
            outline: isSelected
                ? `2px solid ${tokens_1.colors.teal[400]}`
                : isInDragSelection
                    ? `2px solid ${tokens_1.colors.teal[500]}`
                    : 'none',
            borderRadius: '4px',
        }}>
                <resize_handles_1.ResizeHandles frame={frame} setIsResizing={setIsResizing}/>
                <view_1.FrameComponent key={reloadKey} frame={frame} reloadIframe={immediateReload} onConnectionFailed={handleConnectionFailed} onConnectionSuccess={handleConnectionSuccess} penpalTimeoutMs={getPenpalTimeout()} isInDragSelection={isInDragSelection} ref={iFrameRef}/>
                <gesture_1.GestureScreen frame={frame} isResizing={isResizing}/>

                {!isFrameReady && (<div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-md" style={{
                width: frame.dimension.width,
                height: frame.dimension.height,
            }}>
                        <div className="flex flex-col items-center gap-3 text-foreground" style={{
                transform: `scale(${1 / editorEngine.canvas.scale})`,
                width: `${frame.dimension.width * editorEngine.canvas.scale}px`,
                maxWidth: `${frame.dimension.width * editorEngine.canvas.scale}px`,
                padding: '0 16px'
            }}>
                            <icons_1.Icons.LoadingSpinner className="animate-spin h-8 w-8"/>
                            <p className="text-sm text-center bg-gradient-to-l from-white/20 via-white/90 to-white/20 bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer filter drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                                {LOADING_MESSAGES[messageIndex]}
                            </p>
                        </div>
                    </div>)}
            </div>
        </div>);
});
//# sourceMappingURL=index.js.map