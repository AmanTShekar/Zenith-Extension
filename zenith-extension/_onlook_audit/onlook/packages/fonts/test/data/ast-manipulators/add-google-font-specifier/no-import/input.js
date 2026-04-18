"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customFont = void 0;
const local_1 = __importDefault(require("next/font/local"));
exports.customFont = (0, local_1.default)({
    src: './fonts/custom.woff2',
    variable: '--font-custom',
    display: 'swap',
});
//# sourceMappingURL=input.js.map