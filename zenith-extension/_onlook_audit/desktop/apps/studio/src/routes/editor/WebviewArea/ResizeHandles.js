"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const constants_1 = require("@onlook/models/constants");
const toast_1 = require("@onlook/ui/toast");
const use_toast_1 = require("@onlook/ui/use-toast");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
var HandleType;
(function (HandleType) {
    HandleType["Right"] = "right";
    HandleType["Bottom"] = "bottom";
})(HandleType || (HandleType = {}));
const ResizeHandles = (0, mobx_react_lite_1.observer)(({ webviewRef, webviewSize, setWebviewSize, setSelectedPreset, lockedPreset, setLockedPreset, setIsResizing, aspectRatioLocked, webviewId, }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const resizeHandleRef = (0, react_1.useRef)(null);
    const { toast } = (0, use_toast_1.useToast)();
    const startResize = (e, types) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = webviewSize.width;
        const startHeight = webviewSize.height;
        const aspectRatio = startWidth / startHeight;
        const resize = (e) => {
            const scale = editorEngine.canvas.scale;
            let heightDelta = types.includes(HandleType.Bottom)
                ? (e.clientY - startY) / scale
                : 0;
            let widthDelta = types.includes(HandleType.Right)
                ? (e.clientX - startX) / scale
                : 0;
            let currentWidth = startWidth + widthDelta;
            let currentHeight = startHeight + heightDelta;
            if (aspectRatioLocked) {
                if (types.includes(HandleType.Right) && !types.includes(HandleType.Bottom)) {
                    heightDelta = widthDelta / aspectRatio;
                }
                else if (!types.includes(HandleType.Right) &&
                    types.includes(HandleType.Bottom)) {
                    widthDelta = heightDelta * aspectRatio;
                }
                else {
                    if (Math.abs(widthDelta) > Math.abs(heightDelta)) {
                        heightDelta = widthDelta / aspectRatio;
                    }
                    else {
                        widthDelta = heightDelta * aspectRatio;
                    }
                }
                currentWidth = startWidth + widthDelta;
                currentHeight = startHeight + heightDelta;
                if (currentWidth < parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width)) {
                    currentWidth = parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width);
                    currentHeight = currentWidth / aspectRatio;
                }
                if (currentHeight < parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height)) {
                    currentHeight = parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height);
                    currentWidth = currentHeight * aspectRatio;
                }
            }
            else {
                if (currentWidth < parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width)) {
                    currentWidth = parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width);
                }
                if (currentHeight < parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height)) {
                    currentHeight = parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height);
                }
            }
            setWebviewSize({
                width: Math.floor(currentWidth),
                height: Math.floor(currentHeight),
            });
            setSelectedPreset(null);
        };
        const stopResize = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(false);
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResize);
        };
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
    };
    const handleLockedResize = () => {
        const unlockPresetToast = () => {
            setLockedPreset(null);
        };
        toast({
            title: 'Preset dimensions locked.',
            description: 'Unlock to resize.',
            action: (<toast_1.ToastAction altText="Unlock" onClick={unlockPresetToast}>
                        Unlock
                    </toast_1.ToastAction>),
        });
    };
    return (<div className={(0, utils_1.cn)('absolute inset-0 opacity-40 transition min-w-0 visible', {
            'hover:opacity-60': !lockedPreset,
        })}>
                <div ref={resizeHandleRef} className={(0, utils_1.cn)('flex items-center justify-center absolute -bottom-10 w-full h-10', lockedPreset ? 'cursor-not-allowed' : 'cursor-s-resize')} onMouseDown={(e) => lockedPreset ? handleLockedResize() : startResize(e, [HandleType.Bottom])}>
                    <div className="rounded bg-foreground-primary/80 w-48 h-1"></div>
                </div>
                <div ref={resizeHandleRef} className={(0, utils_1.cn)('flex items-center justify-center absolute -right-10 h-full w-10', lockedPreset ? 'cursor-not-allowed' : 'cursor-e-resize')} onMouseDown={(e) => lockedPreset ? handleLockedResize() : startResize(e, [HandleType.Right])}>
                    <div className="rounded bg-foreground-primary/80 w-1 h-48"></div>
                </div>
                <div ref={resizeHandleRef} className={(0, utils_1.cn)('flex items-center justify-center absolute -bottom-10 -right-10 w-10 h-10', lockedPreset ? 'cursor-not-allowed' : 'cursor-se-resize')} onMouseDown={(e) => lockedPreset
            ? handleLockedResize()
            : startResize(e, [HandleType.Right, HandleType.Bottom])}>
                    <div className="rounded bg-foreground-primary/80 w-2 h-2"></div>
                </div>
            </div>);
});
exports.default = ResizeHandles;
//# sourceMappingURL=ResizeHandles.js.map