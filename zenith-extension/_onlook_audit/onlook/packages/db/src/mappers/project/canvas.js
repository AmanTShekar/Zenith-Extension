"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDbCanvas = exports.fromDbCanvas = void 0;
const fromDbCanvas = (dbUserCanvas) => {
    return {
        id: dbUserCanvas.canvasId,
        scale: Number(dbUserCanvas.scale),
        position: {
            x: Number(dbUserCanvas.x),
            y: Number(dbUserCanvas.y),
        },
        userId: dbUserCanvas.userId,
    };
};
exports.fromDbCanvas = fromDbCanvas;
const toDbCanvas = (canvas) => {
    return {
        scale: canvas.scale.toString(),
        x: canvas.position.x.toString(),
        y: canvas.position.y.toString(),
        canvasId: canvas.id,
        userId: canvas.userId,
    };
};
exports.toDbCanvas = toDbCanvas;
//# sourceMappingURL=canvas.js.map