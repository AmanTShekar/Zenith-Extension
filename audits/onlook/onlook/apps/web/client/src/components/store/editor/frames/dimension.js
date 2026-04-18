"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundDimensions = roundDimensions;
function roundDimensions(frame) {
    return {
        ...frame,
        position: {
            x: Math.round(frame.position.x),
            y: Math.round(frame.position.y),
        },
        dimension: {
            width: Math.round(frame.dimension.width),
            height: Math.round(frame.dimension.height),
        },
    };
}
//# sourceMappingURL=dimension.js.map