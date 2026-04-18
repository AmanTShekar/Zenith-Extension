"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultFrame = exports.DefaultMobileFrame = exports.DefaultDesktopFrame = exports.DefaultFrameType = void 0;
const uuid_1 = require("uuid");
var DefaultFrameType;
(function (DefaultFrameType) {
    DefaultFrameType["DESKTOP"] = "desktop";
    DefaultFrameType["MOBILE"] = "mobile";
})(DefaultFrameType || (exports.DefaultFrameType = DefaultFrameType = {}));
exports.DefaultDesktopFrame = {
    x: '150',
    y: '40',
    width: '1536',
    height: '960',
};
exports.DefaultMobileFrame = {
    x: '1600',
    y: '0',
    width: '440',
    height: '956',
};
const DefaultFrame = {
    [DefaultFrameType.DESKTOP]: exports.DefaultDesktopFrame,
    [DefaultFrameType.MOBILE]: exports.DefaultMobileFrame,
};
const createDefaultFrame = ({ canvasId, branchId, url, type = DefaultFrameType.DESKTOP, overrides, }) => {
    const defaultFrame = DefaultFrame[type];
    return {
        id: (0, uuid_1.v4)(),
        canvasId,
        branchId,
        url,
        x: defaultFrame.x,
        y: defaultFrame.y,
        width: defaultFrame.width,
        height: defaultFrame.height,
        ...overrides,
        // deprecated
        type: null,
    };
};
exports.createDefaultFrame = createDefaultFrame;
//# sourceMappingURL=frame.js.map