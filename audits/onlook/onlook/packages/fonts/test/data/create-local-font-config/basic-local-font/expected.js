"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customFont = void 0;
exports.customFont = localFont({
    src: [{
            path: "./fonts/custom-regular.woff2",
            weight: "400",
            style: "normal"
        }, {
            path: "./fonts/custom-bold.woff2",
            weight: "700",
            style: "normal"
        }],
    variable: "--font-custom-font",
    display: "swap",
    fallback: ["system-ui", "sans-serif"],
    preload: true
});
//# sourceMappingURL=expected.js.map