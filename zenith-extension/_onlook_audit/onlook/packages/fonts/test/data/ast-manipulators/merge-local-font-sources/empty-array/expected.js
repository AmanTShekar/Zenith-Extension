"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyFont = void 0;
const local_1 = __importDefault(require("next/font/local"));
exports.emptyFont = (0, local_1.default)({
    src: [{
            path: "./fonts/empty-regular.woff2",
            weight: "400",
            style: "normal"
        }],
    variable: '--font-empty',
    display: 'swap'
});
//# sourceMappingURL=expected.js.map