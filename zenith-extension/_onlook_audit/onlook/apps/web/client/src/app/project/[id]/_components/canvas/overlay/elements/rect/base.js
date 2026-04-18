"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRect = void 0;
const constants_1 = require("@onlook/constants");
const tokens_1 = require("@onlook/ui/tokens");
const react_1 = __importDefault(require("react"));
const BaseRect = ({ width, height, top, left, isComponent, className, children, strokeWidth = 2, }) => {
    if (width === undefined || height === undefined || top === undefined || left === undefined) {
        return null;
    }
    return (<div style={{
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
            pointerEvents: 'none',
        }} className={className} data-onlook-ignore="true" id={constants_1.EditorAttributes.ONLOOK_RECT_ID}>
            <svg overflow="visible" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <rect width={width} height={height} fill="none" stroke={isComponent ? tokens_1.colors.purple[500] : tokens_1.colors.red[500]} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
                {children}
            </svg>
        </div>);
};
exports.BaseRect = BaseRect;
//# sourceMappingURL=base.js.map