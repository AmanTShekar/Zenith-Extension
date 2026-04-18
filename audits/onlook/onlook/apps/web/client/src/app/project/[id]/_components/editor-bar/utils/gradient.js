"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasGradient = void 0;
const hasGradient = (bgImage) => {
    return !!(bgImage &&
        bgImage !== 'none' &&
        (bgImage.includes('gradient') ||
            bgImage.includes('linear-gradient') ||
            bgImage.includes('radial-gradient') ||
            bgImage.includes('conic-gradient')));
};
exports.hasGradient = hasGradient;
//# sourceMappingURL=gradient.js.map