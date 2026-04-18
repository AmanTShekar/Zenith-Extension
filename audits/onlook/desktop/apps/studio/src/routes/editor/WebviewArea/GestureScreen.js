"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/editor/engine/overlay/utils");
const models_1 = require("@/lib/models");
const editor_1 = require("@onlook/models/editor");
const utils_2 = require("@onlook/ui/utils");
const throttle_1 = __importDefault(require("lodash/throttle"));
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const RightClickMenu_1 = require("../RightClickMenu");
const GestureScreen = (0, mobx_react_lite_1.observer)(({ webviewRef, setHovered, isResizing }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const getWebview = (0, react_1.useCallback)(() => {
        const webview = webviewRef.current;
        if (!webview) {
            throw Error('No webview found');
        }
        return webview;
    }, [webviewRef]);
    const getRelativeMousePosition = (0, react_1.useCallback)((e) => {
        const webview = getWebview();
        return (0, utils_1.getRelativeMousePositionToWebview)(e, webview);
    }, [getWebview]);
    const handleMouseEvent = (0, react_1.useCallback)(async (e, action) => {
        const webview = getWebview();
        const pos = getRelativeMousePosition(e);
        const el = await webview.executeJavaScript(`window.api?.getElementAtLoc(${pos.x}, ${pos.y}, ${action === editor_1.MouseAction.MOUSE_DOWN || action === editor_1.MouseAction.DOUBLE_CLICK})`);
        if (!el) {
            return;
        }
        switch (action) {
            case editor_1.MouseAction.MOVE:
                editorEngine.elements.mouseover(el, webview);
                if (e.altKey) {
                    editorEngine.elements.showMeasurement();
                }
                else {
                    editorEngine.overlay.removeMeasurement();
                }
                break;
            case editor_1.MouseAction.MOUSE_DOWN:
                if (el.tagName.toLocaleLowerCase() === 'body') {
                    editorEngine.webviews.select(webview);
                    return;
                }
                // Ignore right-clicks
                if (e.button == 2) {
                    break;
                }
                if (editorEngine.text.isEditing) {
                    editorEngine.text.end();
                }
                if (e.shiftKey) {
                    editorEngine.elements.shiftClick(el, webview);
                }
                else {
                    editorEngine.move.start(el, pos, webview);
                    editorEngine.elements.click([el], webview);
                }
                break;
            case editor_1.MouseAction.DOUBLE_CLICK:
                editorEngine.text.start(el, webview);
                break;
        }
    }, [getWebview, getRelativeMousePosition, editorEngine]);
    const throttledMouseMove = (0, react_1.useMemo)(() => (0, throttle_1.default)((e) => {
        if (editorEngine.move.isDragging) {
            editorEngine.move.drag(e, getRelativeMousePosition);
        }
        else if (editorEngine.mode === models_1.EditorMode.DESIGN ||
            ((editorEngine.mode === models_1.EditorMode.INSERT_DIV ||
                editorEngine.mode === models_1.EditorMode.INSERT_TEXT ||
                editorEngine.mode === models_1.EditorMode.INSERT_IMAGE) &&
                !editorEngine.insert.isDrawing)) {
            handleMouseEvent(e, editor_1.MouseAction.MOVE);
        }
        else if (editorEngine.insert.isDrawing) {
            editorEngine.insert.draw(e);
        }
    }, 16), [editorEngine, getRelativeMousePosition, handleMouseEvent]);
    (0, react_1.useEffect)(() => {
        return () => {
            throttledMouseMove.cancel();
        };
    }, [throttledMouseMove]);
    const handleClick = (0, react_1.useCallback)((e) => {
        const webview = getWebview();
        editorEngine.webviews.deselectAll();
        editorEngine.webviews.select(webview);
    }, [getWebview, editorEngine.webviews]);
    function handleDoubleClick(e) {
        if (editorEngine.mode !== models_1.EditorMode.DESIGN) {
            return;
        }
        handleMouseEvent(e, editor_1.MouseAction.DOUBLE_CLICK);
    }
    function handleMouseDown(e) {
        if (editorEngine.mode === models_1.EditorMode.DESIGN) {
            handleMouseEvent(e, editor_1.MouseAction.MOUSE_DOWN);
        }
        else if (editorEngine.mode === models_1.EditorMode.INSERT_DIV ||
            editorEngine.mode === models_1.EditorMode.INSERT_TEXT ||
            editorEngine.mode === models_1.EditorMode.INSERT_IMAGE) {
            editorEngine.insert.start(e);
        }
    }
    async function handleMouseUp(e) {
        editorEngine.insert.end(e, webviewRef.current);
        editorEngine.move.end(e);
    }
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleMouseEvent(e, editor_1.MouseAction.MOVE);
    };
    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const propertiesData = e.dataTransfer.getData('application/json');
            if (!propertiesData) {
                console.error('No element properties in drag data');
                return;
            }
            const properties = JSON.parse(propertiesData);
            if (properties.type === 'image') {
                const webview = getWebview();
                const dropPosition = getRelativeMousePosition(e);
                await editorEngine.insert.insertDroppedImage(webview, dropPosition, properties);
            }
            else {
                const webview = getWebview();
                const dropPosition = getRelativeMousePosition(e);
                await editorEngine.insert.insertDroppedElement(webview, dropPosition, properties);
            }
            editorEngine.mode = models_1.EditorMode.DESIGN;
        }
        catch (error) {
            console.error('drop operation failed:', error);
        }
    };
    const gestureScreenClassName = (0, react_1.useMemo)(() => {
        return (0, utils_2.cn)('absolute inset-0 bg-transparent', editorEngine.mode === models_1.EditorMode.PREVIEW && !isResizing ? 'hidden' : 'visible', editorEngine.mode === models_1.EditorMode.INSERT_DIV && 'cursor-crosshair', editorEngine.mode === models_1.EditorMode.INSERT_TEXT && 'cursor-text');
    }, [editorEngine.mode, isResizing]);
    return (<RightClickMenu_1.RightClickMenu>
            <div className={gestureScreenClassName} onClick={handleClick} onMouseOver={() => setHovered(true)} onMouseOut={(0, react_1.useCallback)(() => {
            setHovered(false);
            editorEngine.elements.clearHoveredElement();
            editorEngine.overlay.state.updateHoverRect(null);
        }, [editorEngine, setHovered])} onMouseLeave={handleMouseUp} onMouseMove={throttledMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onDoubleClick={handleDoubleClick} onDragOver={handleDragOver} onDrop={handleDrop}></div>
        </RightClickMenu_1.RightClickMenu>);
});
exports.default = GestureScreen;
//# sourceMappingURL=GestureScreen.js.map