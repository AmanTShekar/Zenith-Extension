"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = Component;
const react_1 = __importDefault(require("react"));
function Component({ isActive }) {
    return <div className={`bg-blue-500 ${isActive ? 'active' : 'inactive'}`}/>;
}
//# sourceMappingURL=input.js.map