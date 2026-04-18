"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanOverlay = void 0;
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.PanOverlay = (0, mobx_react_lite_1.observer)(({ isPanning, setIsPanning, clampPosition }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const startPan = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsPanning(true);
    };
    const pan = (event) => {
        if (!isPanning) {
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
        setIsPanning(false);
    };
    return (<div className={(0, utils_1.cn)('absolute w-full h-full cursor-grab', editorEngine.mode === models_1.EditorMode.PAN ? 'visible ' : 'hidden', isPanning ? 'cursor-grabbing' : 'cursor-grab')} onMouseDown={startPan} onMouseMove={pan} onMouseUp={endPan} onMouseLeave={endPan}></div>);
});
//# sourceMappingURL=PanOverlay.js.map