"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResizeHandles = void 0;
const editor_1 = require("@/components/store/editor");
const constants_1 = require("@onlook/constants");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
var HandleType;
(function (HandleType) {
    HandleType["Right"] = "right";
    HandleType["Bottom"] = "bottom";
})(HandleType || (HandleType = {}));
exports.ResizeHandles = (0, mobx_react_lite_1.observer)(({ frame, setIsResizing }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    // TODO implement aspect ratio lock
    const aspectRatioLocked = false;
    const lockedPreset = false;
    const startResize = (e, types) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = frame.dimension.width;
        const startHeight = frame.dimension.height;
        const aspectRatio = startWidth / startHeight;
        const resize = (e) => {
            const scale = editorEngine.canvas.scale;
            let widthDelta = types.includes(HandleType.Right) ? (e.clientX - startX) / scale : 0;
            let heightDelta = types.includes(HandleType.Bottom) ? (e.clientY - startY) / scale : 0;
            let newWidth = startWidth + widthDelta;
            let newHeight = startHeight + heightDelta;
            const minWidth = parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.width);
            const minHeight = parseInt(constants_1.DefaultSettings.MIN_DIMENSIONS.height);
            if (aspectRatioLocked) {
                if (types.includes(HandleType.Right) && !types.includes(HandleType.Bottom)) {
                    newHeight = newWidth / aspectRatio;
                }
                else if (!types.includes(HandleType.Right) && types.includes(HandleType.Bottom)) {
                    newWidth = newHeight * aspectRatio;
                }
                else {
                    if (Math.abs(widthDelta) > Math.abs(heightDelta)) {
                        newHeight = newWidth / aspectRatio;
                    }
                    else {
                        newWidth = newHeight * aspectRatio;
                    }
                }
                if (newWidth < minWidth) {
                    newWidth = minWidth;
                    newHeight = newWidth / aspectRatio;
                }
                if (newHeight < minHeight) {
                    newHeight = minHeight;
                    newWidth = newHeight * aspectRatio;
                }
            }
            else {
                newWidth = Math.max(newWidth, minWidth);
                newHeight = Math.max(newHeight, minHeight);
            }
            editorEngine.frames.updateAndSaveToStorage(frame.id, { dimension: { width: Math.round(newWidth), height: Math.round(newHeight) } });
            editorEngine.overlay.undebouncedRefresh();
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
    return (<div className={(0, utils_1.cn)('absolute inset-0 opacity-40 transition min-w-0 visible hover:opacity-60', lockedPreset && 'hover:opacity-40')}>
            <div className={(0, utils_1.cn)('flex items-center justify-center absolute -bottom-10 w-full h-10', lockedPreset ? 'cursor-not-allowed' : 'cursor-s-resize')} onMouseDown={(e) => startResize(e, [HandleType.Bottom])}>
                <div className="rounded bg-foreground-primary/80 w-48 h-1"></div>
            </div>
            <div className={(0, utils_1.cn)('flex items-center justify-center absolute -right-10 h-full w-10', lockedPreset ? 'cursor-not-allowed' : 'cursor-e-resize')} onMouseDown={(e) => startResize(e, [HandleType.Right])}>
                <div className="rounded bg-foreground-primary/80 w-1 h-48"></div>
            </div>
            <div className={(0, utils_1.cn)('flex items-center justify-center absolute -bottom-10 -right-10 w-10 h-10', lockedPreset ? 'cursor-not-allowed' : 'cursor-se-resize')} onMouseDown={(e) => startResize(e, [HandleType.Right, HandleType.Bottom])}>
                <div className="rounded bg-foreground-primary/80 w-2 h-2"></div>
            </div>
        </div>);
});
//# sourceMappingURL=resize-handles.js.map