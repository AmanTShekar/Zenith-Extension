"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GestureScreen = void 0;
const editor_1 = require("@/components/store/editor");
const utils_1 = require("@/components/store/editor/overlay/utils");
const models_1 = require("@onlook/models");
const sonner_1 = require("@onlook/ui/sonner");
const utils_2 = require("@onlook/ui/utils");
const throttle_1 = __importDefault(require("lodash/throttle"));
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const right_click_menu_1 = require("../../right-click-menu");
exports.GestureScreen = (0, mobx_react_lite_1.observer)(({ frame, isResizing }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const getFrameData = (0, react_1.useCallback)(() => {
        return editorEngine.frames.get(frame.id);
    }, [editorEngine.frames, frame.id]);
    const getRelativeMousePosition = (0, react_1.useCallback)((e) => {
        const frameData = getFrameData();
        if (!frameData?.view) {
            return { x: 0, y: 0 };
        }
        return (0, utils_1.getRelativeMousePositionToFrameView)(e, frameData.view);
    }, [getFrameData]);
    const handleMouseEvent = (0, react_1.useCallback)(async (e, action) => {
        try {
            const frameData = getFrameData();
            if (!frameData?.view) {
                throw new Error('Frame view not found');
            }
            const pos = getRelativeMousePosition(e);
            const shouldGetStyle = [models_1.MouseAction.MOUSE_DOWN, models_1.MouseAction.DOUBLE_CLICK].includes(action);
            const el = await frameData.view.getElementAtLoc(pos.x, pos.y, shouldGetStyle);
            if (!el) {
                throw new Error('No element found');
            }
            switch (action) {
                case models_1.MouseAction.MOVE:
                    editorEngine.elements.mouseover(el);
                    if (e.altKey) {
                        if (editorEngine.state.insertMode !== models_1.InsertMode.INSERT_IMAGE) {
                            editorEngine.overlay.showMeasurement();
                        }
                    }
                    else {
                        editorEngine.overlay.removeMeasurement();
                    }
                    break;
                case models_1.MouseAction.MOUSE_DOWN:
                    if (el.tagName.toLocaleLowerCase() === 'body') {
                        editorEngine.frames.select([frame], e.shiftKey);
                        return;
                    }
                    // Ignore right-clicks
                    if (e.button == 2) {
                        break;
                    }
                    if (editorEngine.text.isEditing) {
                        await editorEngine.text.end();
                    }
                    if (e.shiftKey) {
                        editorEngine.elements.shiftClick(el);
                    }
                    else {
                        editorEngine.elements.click([el]);
                    }
                    break;
                case models_1.MouseAction.DOUBLE_CLICK:
                    if (el.oid) {
                        editorEngine.ide.openCodeBlock(el.oid);
                    }
                    else {
                        sonner_1.toast.error('Cannot find element in code panel');
                        return;
                    }
                    break;
            }
        }
        catch (error) {
            console.error('Error handling mouse event:', error);
            return;
        }
    }, [getRelativeMousePosition, editorEngine]);
    const throttledMouseMove = (0, react_1.useMemo)(() => (0, throttle_1.default)(async (e) => {
        // Skip hover events during drag selection
        if (editorEngine.state.isDragSelecting) {
            return;
        }
        if (editorEngine.state.editorMode === models_1.EditorMode.DESIGN ||
            editorEngine.state.editorMode === models_1.EditorMode.CODE ||
            ((editorEngine.state.insertMode === models_1.InsertMode.INSERT_DIV ||
                editorEngine.state.insertMode === models_1.InsertMode.INSERT_TEXT ||
                editorEngine.state.insertMode === models_1.InsertMode.INSERT_IMAGE) &&
                !editorEngine.insert.isDrawing)) {
            await handleMouseEvent(e, models_1.MouseAction.MOVE);
        }
        else if (editorEngine.insert.isDrawing) {
            editorEngine.insert.draw(e);
        }
    }, 16), [editorEngine.state.isDragSelecting, editorEngine.state.editorMode, editorEngine.insert.isDrawing, getRelativeMousePosition, handleMouseEvent]);
    (0, react_1.useEffect)(() => {
        return () => {
            throttledMouseMove.cancel();
        };
    }, [throttledMouseMove]);
    const handleClick = (0, react_1.useCallback)((e) => {
        editorEngine.frames.select([frame]);
    }, [editorEngine.frames]);
    async function handleDoubleClick(e) {
        if (editorEngine.state.editorMode === models_1.EditorMode.PREVIEW) {
            return;
        }
        await handleMouseEvent(e, models_1.MouseAction.DOUBLE_CLICK);
    }
    async function handleMouseDown(e) {
        if (editorEngine.state.editorMode === models_1.EditorMode.DESIGN || editorEngine.state.editorMode === models_1.EditorMode.CODE) {
            await handleMouseEvent(e, models_1.MouseAction.MOUSE_DOWN);
        }
        else if (editorEngine.state.insertMode === models_1.InsertMode.INSERT_DIV ||
            editorEngine.state.insertMode === models_1.InsertMode.INSERT_TEXT ||
            editorEngine.state.insertMode === models_1.InsertMode.INSERT_IMAGE) {
            editorEngine.insert.start(e);
        }
    }
    async function handleMouseUp(e) {
        const frameData = getFrameData();
        if (!frameData) {
            return;
        }
        await editorEngine.insert.end(e, frameData.view);
    }
    const handleDragOver = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await handleMouseEvent(e, models_1.MouseAction.MOVE);
    };
    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const propertiesData = e.dataTransfer.getData('application/json');
            if (!propertiesData) {
                throw new Error('No element properties in drag data');
            }
            const properties = JSON.parse(propertiesData);
            if (properties.type === 'image') {
                const frameData = editorEngine.frames.get(frame.id);
                if (!frameData) {
                    throw new Error('Frame data not found');
                }
                const dropPosition = getRelativeMousePosition(e);
                await editorEngine.insert.insertDroppedImage(frameData, dropPosition, properties, e.altKey);
            }
            else {
                const frameData = editorEngine.frames.get(frame.id);
                if (!frameData) {
                    throw new Error('Frame data not found');
                }
                const dropPosition = getRelativeMousePosition(e);
                await editorEngine.insert.insertDroppedElement(frameData, dropPosition, properties);
            }
            editorEngine.state.editorMode = models_1.EditorMode.DESIGN;
            editorEngine.state.insertMode = null;
        }
        catch (error) {
            console.error('drop operation failed:', error);
            sonner_1.toast.error('Failed to drop element', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
    const gestureScreenClassName = (0, react_1.useMemo)(() => {
        return (0, utils_2.cn)('absolute inset-0 bg-transparent', editorEngine.state.editorMode === models_1.EditorMode.PREVIEW && !isResizing
            ? 'hidden'
            : 'visible', editorEngine.state.insertMode === models_1.InsertMode.INSERT_DIV && 'cursor-crosshair', editorEngine.state.insertMode === models_1.InsertMode.INSERT_TEXT && 'cursor-text');
    }, [editorEngine.state.editorMode, isResizing]);
    const handleMouseOut = () => {
        editorEngine.elements.clearHoveredElement();
        editorEngine.overlay.state.removeHoverRect();
    };
    return (<right_click_menu_1.RightClickMenu>
            <div className={gestureScreenClassName} onClick={handleClick} onMouseOut={handleMouseOut} onMouseLeave={handleMouseUp} onMouseMove={throttledMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onDoubleClick={handleDoubleClick} onDragOver={handleDragOver} onDrop={handleDrop}></div>
        </right_click_menu_1.RightClickMenu>);
});
//# sourceMappingURL=gesture.js.map