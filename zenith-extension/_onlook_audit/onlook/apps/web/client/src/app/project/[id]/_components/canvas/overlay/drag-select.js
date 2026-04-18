"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragSelectOverlay = void 0;
const tokens_1 = require("@onlook/ui/tokens");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.DragSelectOverlay = (0, mobx_react_lite_1.observer)(({ startX, startY, endX, endY, isSelecting }) => {
    if (!isSelecting) {
        return null;
    }
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    return (<div className="absolute pointer-events-none" style={{
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
            border: `1px solid ${tokens_1.colors.teal[300]}`,
            backgroundColor: `${tokens_1.colors.teal[300]}1A`, // 10% opacity (1A in hex)
        }}/>);
});
//# sourceMappingURL=drag-select.js.map