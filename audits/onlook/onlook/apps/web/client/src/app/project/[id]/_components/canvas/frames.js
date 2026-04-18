"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frames = void 0;
const editor_1 = require("@/components/store/editor");
const mobx_react_lite_1 = require("mobx-react-lite");
const frame_1 = require("./frame");
exports.Frames = (0, mobx_react_lite_1.observer)(({ framesInDragSelection }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const frames = editorEngine.frames.getAll();
    return (<div className="grid grid-flow-col gap-72">
            {frames.map((frame) => (<frame_1.FrameView key={frame.frame.id} frame={frame.frame} isInDragSelection={framesInDragSelection.has(frame.frame.id)}/>))}
        </div>);
});
//# sourceMappingURL=frames.js.map