"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = Component;
const react_1 = __importDefault(require("react"));
function Component() {
    return <div className={`font-inter bg-blue-500 ${isActive ? 'text-white' : 'text-gray-500'} ${dynamicClass} hover:bg-blue-600`}/>;
}
//# sourceMappingURL=expected.js.map