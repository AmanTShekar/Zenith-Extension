"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = Component;
const react_1 = __importDefault(require("react"));
const inter = {
    variable: 'inter-variable'
};
const isActive = true;
function Component() {
    return <div className={`text-lg ${isActive ? 'font-bold' : 'font-normal'} bg-blue-500`}/>;
}
//# sourceMappingURL=expected.js.map