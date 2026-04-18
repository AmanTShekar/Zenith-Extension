"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverRect = void 0;
const react_1 = __importDefault(require("react"));
const base_1 = require("./base");
const HoverRect = ({ rect, isComponent }) => {
    if (!rect) {
        return null;
    }
    return <base_1.BaseRect {...rect} isComponent={isComponent} strokeWidth={1}/>;
};
exports.HoverRect = HoverRect;
//# sourceMappingURL=hover.js.map