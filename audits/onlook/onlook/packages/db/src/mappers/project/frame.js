"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDbPartialFrame = exports.toDbFrame = exports.fromDbFrame = void 0;
const fromDbFrame = (dbFrame) => {
    if (dbFrame.branchId === null) {
        throw new Error('Frame branchId should not be null');
    }
    return {
        id: dbFrame.id,
        canvasId: dbFrame.canvasId,
        branchId: dbFrame.branchId,
        url: dbFrame.url,
        position: {
            x: Number(dbFrame.x),
            y: Number(dbFrame.y),
        },
        dimension: {
            width: Number(dbFrame.width),
            height: Number(dbFrame.height),
        },
    };
};
exports.fromDbFrame = fromDbFrame;
const toDbFrame = (frame) => {
    return {
        id: frame.id,
        branchId: frame.branchId,
        canvasId: frame.canvasId,
        url: frame.url,
        x: frame.position.x.toString(),
        y: frame.position.y.toString(),
        width: frame.dimension.width.toString(),
        height: frame.dimension.height.toString(),
        // deprecated
        type: null,
    };
};
exports.toDbFrame = toDbFrame;
const toDbPartialFrame = (frame) => {
    return {
        id: frame.id,
        url: frame.url,
        x: frame.position?.x.toString(),
        y: frame.position?.y.toString(),
        canvasId: frame.canvasId,
        width: frame.dimension?.width.toString(),
        height: frame.dimension?.height.toString(),
    };
};
exports.toDbPartialFrame = toDbPartialFrame;
//# sourceMappingURL=frame.js.map