"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultCanvas = void 0;
const uuid_1 = require("uuid");
const createDefaultCanvas = (projectId) => {
    return {
        id: (0, uuid_1.v4)(),
        projectId: projectId,
    };
};
exports.createDefaultCanvas = createDefaultCanvas;
//# sourceMappingURL=canvas.js.map