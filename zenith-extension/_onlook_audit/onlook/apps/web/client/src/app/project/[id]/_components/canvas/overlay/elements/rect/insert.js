"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertRect = void 0;
const react_1 = __importDefault(require("react"));
const base_1 = require("./base");
const InsertRect = ({ rect }) => {
    if (!rect) {
        return null;
    }
    return <base_1.BaseRect {...rect}/>;
};
exports.InsertRect = InsertRect;
//# sourceMappingURL=insert.js.map