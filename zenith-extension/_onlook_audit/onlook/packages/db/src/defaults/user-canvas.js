"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultUserCanvas = void 0;
const constants_1 = require("@onlook/constants");
const createDefaultUserCanvas = (userId, canvasId, overrides = {}) => {
    return {
        userId,
        canvasId,
        scale: constants_1.DefaultSettings.SCALE.toString(),
        x: constants_1.DefaultSettings.PAN_POSITION.x.toString(),
        y: constants_1.DefaultSettings.PAN_POSITION.y.toString(),
        ...overrides,
    };
};
exports.createDefaultUserCanvas = createDefaultUserCanvas;
//# sourceMappingURL=user-canvas.js.map