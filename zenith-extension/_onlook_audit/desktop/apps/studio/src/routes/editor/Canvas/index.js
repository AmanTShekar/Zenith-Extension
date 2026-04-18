"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Canvas = void 0;
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const constants_1 = require("@onlook/models/constants");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const Hotkeys_1 = require("./Hotkeys");
const Overlay_1 = require("./Overlay");
const PanOverlay_1 = require("./PanOverlay");
exports.Canvas = (0, mobx_react_lite_1.observer)(({ children }) => {
    const ZOOM_SENSITIVITY = 0.006;
    const PAN_SENSITIVITY = 0.52;
    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 3;
    const MAX_X = 10000;
    const MAX_Y = 10000;
    const MIN_X = -5000;
    const MIN_Y = -5000;
    const editorEngine = (0, Context_1.useEditorEngine)();
    const containerRef = (0, react_1.useRef)(null);
    const [isPanning, setIsPanning] = (0, react_1.useState)(false);
    const scale = editorEngine.canvas.scale;
    const position = editorEngine.canvas.position;
    const handleCanvasMouseDown = (0, react_1.useCallback)((event) => {
        if (event.target !== containerRef.current) {
            return;
        }
        editorEngine.clearUI();
    }, [editorEngine]);
    const handleZoom = (0, react_1.useCallback)((event) => {
        if (!containerRef.current) {
            return;
        }
        event.preventDefault();
        const zoomFactor = -event.deltaY * ZOOM_SENSITIVITY;
        const rect = containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const newScale = scale * (1 + zoomFactor);
        const lintedScale = clampZoom(newScale);
        const deltaX = (x - position.x) * zoomFactor;
        const deltaY = (y - position.y) * zoomFactor;
        editorEngine.canvas.scale = lintedScale;
        if (newScale < MIN_ZOOM || newScale > MAX_ZOOM) {
            return;
        }
        const newPosition = clampPosition({
            x: position.x - deltaX,
            y: position.y - deltaY,
        }, lintedScale);
        editorEngine.canvas.position = newPosition;
    }, [scale, position, editorEngine.canvas]);
    function clampZoom(scale) {
        return Math.min(Math.max(scale, MIN_ZOOM), MAX_ZOOM);
    }
    function clampPosition(position, scale) {
        const effectiveMaxX = MAX_X * scale;
        const effectiveMaxY = MAX_Y * scale;
        const effectiveMinX = MIN_X * scale;
        const effectiveMinY = MIN_Y * scale;
        return {
            x: Math.min(Math.max(position.x, effectiveMinX), effectiveMaxX),
            y: Math.min(Math.max(position.y, effectiveMinY), effectiveMaxY),
        };
    }
    const handlePan = (0, react_1.useCallback)((event) => {
        const deltaX = (event.deltaX + (event.shiftKey ? event.deltaY : 0)) * PAN_SENSITIVITY;
        const deltaY = (event.shiftKey ? 0 : event.deltaY) * PAN_SENSITIVITY;
        const newPosition = clampPosition({
            x: position.x - deltaX,
            y: position.y - deltaY,
        }, scale);
        editorEngine.canvas.position = newPosition;
    }, [scale, position, editorEngine.canvas]);
    const handleWheel = (0, react_1.useCallback)((event) => {
        // This is a workaround to prevent the canvas from scrolling when textarea in Chat with AI is focused.
        if (event.target instanceof HTMLTextAreaElement) {
            return; // Let the default scroll behavior happen
        }
        if (event.ctrlKey || event.metaKey) {
            handleZoom(event);
        }
        else {
            handlePan(event);
        }
    }, [handleZoom, handlePan]);
    const middleMouseButtonDown = (0, react_1.useCallback)((e) => {
        if (e.button === 1) {
            editorEngine.mode = models_1.EditorMode.PAN;
            setIsPanning(true);
            e.preventDefault();
            e.stopPropagation();
        }
    }, [editorEngine]);
    const middleMouseButtonUp = (0, react_1.useCallback)((e) => {
        if (e.button === 1) {
            editorEngine.mode = models_1.EditorMode.DESIGN;
            setIsPanning(false);
            e.preventDefault();
            e.stopPropagation();
        }
    }, [editorEngine]);
    const transformStyle = (0, react_1.useMemo)(() => ({
        transition: 'transform ease',
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        transformOrigin: '0 0',
    }), [position.x, position.y, scale]);
    (0, react_1.useEffect)(() => {
        const div = containerRef.current;
        if (div) {
            div.addEventListener('wheel', handleWheel, { passive: false });
            div.addEventListener('mousedown', middleMouseButtonDown);
            div.addEventListener('mouseup', middleMouseButtonUp);
            return () => {
                div.removeEventListener('wheel', handleWheel);
                div.removeEventListener('mousedown', middleMouseButtonDown);
                div.removeEventListener('mouseup', middleMouseButtonUp);
            };
        }
    }, [handleWheel]);
    return (<Hotkeys_1.HotkeysArea>
            <div ref={containerRef} className="overflow-hidden bg-background-onlook flex flex-grow relative" onMouseDown={handleCanvasMouseDown}>
                <Overlay_1.Overlay>
                    <div id={constants_1.EditorAttributes.CANVAS_CONTAINER_ID} style={transformStyle}>
                        {children}
                    </div>
                </Overlay_1.Overlay>
                <PanOverlay_1.PanOverlay clampPosition={(position) => clampPosition(position, scale)} isPanning={isPanning} setIsPanning={setIsPanning}/>
            </div>
        </Hotkeys_1.HotkeysArea>);
});
//# sourceMappingURL=index.js.map