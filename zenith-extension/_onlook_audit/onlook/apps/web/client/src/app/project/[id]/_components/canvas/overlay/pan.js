"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanOverlay = void 0;
const editor_1 = require("@/components/store/editor");
const models_1 = require("@onlook/models");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.PanOverlay = (0, mobx_react_lite_1.observer)(({ clampPosition }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const startPan = (event) => {
        event.preventDefault();
        event.stopPropagation();
        editorEngine.state.canvasPanning = true;
    };
    const pan = (event) => {
        if (!editorEngine.state.canvasPanning) {
            return;
        }
        const deltaX = -event.movementX;
        const deltaY = -event.movementY;
        editorEngine.canvas.position = clampPosition({
            x: editorEngine.canvas.position.x - deltaX,
            y: editorEngine.canvas.position.y - deltaY,
        });
    };
    const endPan = () => {
        editorEngine.state.canvasPanning = false;
    };
    return (<div className={(0, utils_1.cn)('absolute w-full h-full cursor-grab', editorEngine.state.editorMode === models_1.EditorMode.PAN ? 'visible ' : 'hidden', editorEngine.state.canvasPanning ? 'cursor-grabbing' : 'cursor-grab')} onMouseDown={startPan} onMouseMove={pan} onMouseUp={endPan} onMouseLeave={endPan}></div>);
});
//# sourceMappingURL=pan.js.map