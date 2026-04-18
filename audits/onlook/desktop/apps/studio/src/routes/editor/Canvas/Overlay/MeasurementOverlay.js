"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeasurementOverlay = void 0;
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/editor/engine/overlay/utils");
const tokens_1 = require("@onlook/ui/tokens");
const react_1 = __importStar(require("react"));
const BaseRect_1 = require("./BaseRect");
const toRectPoint = (rect) => ({
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    width: rect.width,
    height: rect.height,
    left: rect.left,
    top: rect.top,
});
const isBetween = (x, start, end) => {
    return (start <= x && x <= end) || (end <= x && x <= start);
};
const isIntersect = (rectA, rectB) => {
    if (rectA.left > rectB.right || rectB.left > rectA.right) {
        return false;
    }
    if (rectA.top > rectB.bottom || rectB.top > rectA.bottom) {
        return false;
    }
    return true;
};
const getInsideRect = (rectA, rectB) => {
    if (rectA.left >= rectB.left &&
        rectA.right <= rectB.right &&
        rectA.top >= rectB.top &&
        rectA.bottom <= rectB.bottom) {
        return rectA;
    }
    else if (rectB.left >= rectA.left &&
        rectB.right <= rectA.right &&
        rectB.top >= rectA.top &&
        rectB.bottom <= rectA.bottom) {
        return rectB;
    }
    return null;
};
exports.MeasurementOverlay = (0, react_1.memo)(({ fromRect, toRect }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const webview = editorEngine.webviews.getWebview(editorEngine.elements.selected[0]?.webviewId);
    const fromRectAdjusted = (0, react_1.useMemo)(() => (webview ? (0, utils_1.adaptRectToCanvas)(fromRect, webview) : fromRect), [fromRect, webview]);
    const toRectAdjusted = (0, react_1.useMemo)(() => (webview ? (0, utils_1.adaptRectToCanvas)(toRect, webview) : toRect), [toRect, webview]);
    const fromRectPoint = (0, react_1.useMemo)(() => toRectPoint(fromRect), [fromRect]);
    const toRectPointResult = (0, react_1.useMemo)(() => toRectPoint(toRect), [toRect]);
    const createDistance = (distance, toRect, isHorizontal) => {
        const result = { ...distance };
        const { start, end } = distance;
        if (isHorizontal && !isBetween(start.y, toRect.top, toRect.bottom)) {
            result.supportLine = {
                start: { x: end.x, y: toRect.top },
                end: { x: end.x, y: end.y },
            };
        }
        else if (!isHorizontal && !isBetween(start.x, toRect.left, toRect.right)) {
            result.supportLine = {
                start: { x: toRect.left, y: end.y },
                end: { x: end.x, y: end.y },
            };
        }
        return result;
    };
    const distances = (0, react_1.useMemo)(() => {
        if (!webview) {
            return [];
        }
        const result = [];
        // Scale values for display
        const scaleValue = (value) => (0, utils_1.adaptValueToCanvas)(Math.abs(value), true);
        // Calculate horizontal distances
        let y = fromRectPoint.top + fromRectPoint.height / 2;
        if (isIntersect(fromRectPoint, toRectPointResult)) {
            const insideRect = getInsideRect(toRectPointResult, fromRectPoint);
            if (insideRect) {
                y = insideRect.top + insideRect.height / 2;
            }
            else if (fromRectPoint.bottom > toRectPointResult.bottom) {
                y = fromRectPoint.top + (toRectPointResult.bottom - fromRectPoint.top) / 2;
            }
            else {
                y = fromRectPoint.bottom - (fromRectPoint.bottom - toRectPointResult.top) / 2;
            }
            const leftDistance = {
                value: scaleValue(fromRectPoint.left - toRectPointResult.left),
                start: { x: fromRectPoint.left, y },
                end: { x: toRectPointResult.left, y },
            };
            if (!isBetween(y, toRectPointResult.top, toRectPointResult.bottom)) {
                leftDistance.supportLine = {
                    start: { x: toRectPointResult.left, y: toRectPointResult.top },
                    end: { x: toRectPointResult.left, y },
                };
            }
            result.push(leftDistance);
            const rightDistance = {
                value: scaleValue(fromRectPoint.right - toRectPointResult.right),
                start: { x: fromRectPoint.right, y },
                end: { x: toRectPointResult.right, y },
            };
            if (!isBetween(y, toRectPointResult.top, toRectPointResult.bottom)) {
                rightDistance.supportLine = {
                    start: { x: toRectPointResult.right, y: toRectPointResult.top },
                    end: { x: toRectPointResult.right, y },
                };
            }
            result.push(rightDistance);
        }
        else if (fromRectPoint.left > toRectPointResult.right) {
            const distance = {
                value: scaleValue(fromRectPoint.left - toRectPointResult.right),
                start: { x: fromRectPoint.left, y },
                end: { x: toRectPointResult.right, y },
            };
            if (!isBetween(y, toRectPointResult.top, toRectPointResult.bottom)) {
                distance.supportLine = {
                    start: { x: toRectPointResult.right, y: toRectPointResult.top },
                    end: { x: toRectPointResult.right, y },
                };
            }
            result.push(distance);
        }
        else if (fromRectPoint.right < toRectPointResult.left) {
            const distance = {
                value: scaleValue(fromRectPoint.right - toRectPointResult.left),
                start: { x: fromRectPoint.right, y },
                end: { x: toRectPointResult.left, y },
            };
            if (!isBetween(y, toRectPointResult.top, toRectPointResult.bottom)) {
                distance.supportLine = {
                    start: { x: toRectPointResult.left, y: toRectPointResult.top },
                    end: { x: toRectPointResult.left, y },
                };
            }
            result.push(distance);
        }
        else if (isBetween(fromRectPoint.left, toRectPointResult.left, toRectPointResult.right) &&
            fromRectPoint.right >= toRectPointResult.left) {
            const distance = {
                value: scaleValue(fromRectPoint.left - toRectPointResult.left),
                start: { x: fromRectPoint.left, y },
                end: { x: toRectPointResult.left, y },
            };
            if (!isBetween(y, toRectPointResult.top, toRectPointResult.bottom)) {
                distance.supportLine = {
                    start: { x: toRectPointResult.left, y: toRectPointResult.top },
                    end: { x: toRectPointResult.left, y },
                };
            }
            result.push(distance);
        }
        else if (isBetween(fromRectPoint.right, toRectPointResult.left, toRectPointResult.right) &&
            fromRectPoint.left <= toRectPointResult.left) {
            result.push(createDistance({
                value: scaleValue(fromRectPoint.right - toRectPointResult.right),
                start: { x: fromRectPoint.right, y },
                end: { x: toRectPointResult.right, y },
            }, toRectPointResult, true));
        }
        else {
            result.push(createDistance({
                value: scaleValue(fromRectPoint.left - toRectPointResult.left),
                start: { x: fromRectPoint.left, y },
                end: { x: toRectPointResult.left, y },
            }, toRectPointResult, true));
            result.push(createDistance({
                value: scaleValue(fromRectPoint.right - toRectPointResult.right),
                start: { x: fromRectPoint.right, y },
                end: { x: toRectPointResult.right, y },
            }, toRectPointResult, true));
        }
        // Calculate vertical distances
        let x = fromRectPoint.left + fromRectPoint.width / 2;
        if (isIntersect(fromRectPoint, toRectPointResult)) {
            const insideRect = getInsideRect(toRectPointResult, fromRectPoint);
            if (insideRect) {
                x = insideRect.left + insideRect.width / 2;
            }
            else if (fromRectPoint.right > toRectPointResult.right) {
                x = fromRectPoint.left + (toRectPointResult.right - fromRectPoint.left) / 2;
            }
            else {
                x = fromRectPoint.right - (fromRectPoint.right - toRectPointResult.left) / 2;
            }
            const topDistance = {
                value: scaleValue(fromRectPoint.top - toRectPointResult.top),
                start: { x, y: fromRectPoint.top },
                end: { x, y: toRectPointResult.top },
            };
            if (!isBetween(x, toRectPointResult.left, toRectPointResult.right)) {
                topDistance.supportLine = {
                    start: { x: toRectPointResult.left, y: toRectPointResult.top },
                    end: { x, y: toRectPointResult.top },
                };
            }
            result.push(topDistance);
            const bottomDistance = {
                value: scaleValue(fromRectPoint.bottom - toRectPointResult.bottom),
                start: { x, y: fromRectPoint.bottom },
                end: { x, y: toRectPointResult.bottom },
            };
            if (!isBetween(x, toRectPointResult.left, toRectPointResult.right)) {
                bottomDistance.supportLine = {
                    start: { x: toRectPointResult.left, y: toRectPointResult.bottom },
                    end: { x, y: toRectPointResult.bottom },
                };
            }
            result.push(bottomDistance);
        }
        else if (fromRectPoint.top > toRectPointResult.bottom) {
            const distance = {
                value: scaleValue(fromRectPoint.top - toRectPointResult.bottom),
                start: { x, y: fromRectPoint.top },
                end: { x, y: toRectPointResult.bottom },
            };
            if (!isBetween(x, toRectPointResult.left, toRectPointResult.right)) {
                distance.supportLine = {
                    start: { x: toRectPointResult.left, y: toRectPointResult.bottom },
                    end: { x, y: toRectPointResult.bottom },
                };
            }
            result.push(distance);
        }
        else if (fromRectPoint.bottom < toRectPointResult.top) {
            const distance = {
                value: scaleValue(fromRectPoint.bottom - toRectPointResult.top),
                start: { x, y: fromRectPoint.bottom },
                end: { x, y: toRectPointResult.top },
            };
            if (!isBetween(x, toRectPointResult.left, toRectPointResult.right)) {
                distance.supportLine = {
                    start: { x: toRectPointResult.left, y: toRectPointResult.top },
                    end: { x, y: toRectPointResult.top },
                };
            }
            result.push(distance);
        }
        else if (isBetween(fromRectPoint.top, toRectPointResult.top, toRectPointResult.bottom)) {
            const distance = {
                value: scaleValue(fromRectPoint.top - toRectPointResult.top),
                start: { x, y: fromRectPoint.top },
                end: { x, y: toRectPointResult.top },
            };
            if (!isBetween(x, toRectPointResult.left, toRectPointResult.right)) {
                distance.supportLine = {
                    start: { x: toRectPointResult.left, y: toRectPointResult.top },
                    end: { x, y: toRectPointResult.top },
                };
            }
            result.push(distance);
        }
        else if (isBetween(fromRectPoint.bottom, toRectPointResult.top, toRectPointResult.bottom)) {
            const distance = {
                value: scaleValue(fromRectPoint.bottom - toRectPointResult.bottom),
                start: { x, y: fromRectPoint.bottom },
                end: { x, y: toRectPointResult.bottom },
            };
            if (!isBetween(x, toRectPointResult.left, toRectPointResult.right)) {
                distance.supportLine = {
                    start: { x: toRectPointResult.left, y: toRectPointResult.bottom },
                    end: { x, y: toRectPointResult.bottom },
                };
            }
            result.push(distance);
        }
        else {
            const topDistance = {
                value: scaleValue(fromRectPoint.top - toRectPointResult.top),
                start: { x, y: fromRectPoint.top },
                end: { x, y: toRectPointResult.top },
            };
            if (!isBetween(x, toRectPointResult.left, toRectPointResult.right)) {
                topDistance.supportLine = {
                    start: { x: toRectPointResult.left, y: toRectPointResult.top },
                    end: { x, y: toRectPointResult.top },
                };
            }
            result.push(topDistance);
            const bottomDistance = {
                value: scaleValue(fromRectPoint.bottom - toRectPointResult.bottom),
                start: { x, y: fromRectPoint.bottom },
                end: { x, y: toRectPointResult.bottom },
            };
            if (!isBetween(x, toRectPointResult.left, toRectPointResult.right)) {
                bottomDistance.supportLine = {
                    start: { x: toRectPointResult.left, y: toRectPointResult.bottom },
                    end: { x, y: toRectPointResult.bottom },
                };
            }
            result.push(bottomDistance);
        }
        return result;
    }, [fromRectPoint, toRectPointResult]);
    const viewBox = (0, react_1.useMemo)(() => ({
        minX: Math.min(fromRectAdjusted.left, toRectAdjusted.left) - 100,
        minY: Math.min(fromRectAdjusted.top, toRectAdjusted.top) - 100,
        width: Math.abs(toRectAdjusted.left - fromRectAdjusted.left) +
            Math.max(fromRectAdjusted.width, toRectAdjusted.width) +
            200,
        height: Math.abs(toRectAdjusted.top - fromRectAdjusted.top) +
            Math.max(fromRectAdjusted.height, toRectAdjusted.height) +
            200,
    }), [fromRectAdjusted, toRectAdjusted]);
    const svgContent = (<g transform={`translate(${-viewBox.minX},${-viewBox.minY})`}>
            <rect x={fromRect.left} y={fromRect.top} width={fromRect.width} height={fromRect.height} fill="none" stroke={tokens_1.colors.red[500]} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round"/>
            <rect x={toRect.left} y={toRect.top} width={toRect.width} height={toRect.height} fill="none" stroke={tokens_1.colors.red[500]} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round"/>

            {/* Distance lines and labels */}
            {distances.map((distance, index) => {
            const isHorizontal = distance.start.y === distance.end.y;
            const midX = (distance.start.x + distance.end.x) / 2 + (isHorizontal ? 24 : 0);
            const midY = (distance.start.y + distance.end.y) / 2 + (isHorizontal ? 0 : 16);
            return (<g key={index}>
                        <line x1={distance.start.x} y1={distance.start.y} x2={distance.end.x} y2={distance.end.y} stroke={tokens_1.colors.red[500]} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round"/>
                        {distance.supportLine && (<line x1={distance.supportLine.start.x} y1={distance.supportLine.start.y} x2={distance.supportLine.end.x} y2={distance.supportLine.end.y} stroke={tokens_1.colors.red[500]} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 6"/>)}
                        <g transform={`translate(${midX},${midY})`}>
                            <rect x={-20} y={-10} width={40} height={20} fill={tokens_1.colors.red[500]} rx={2}/>
                            <text x={0} y={0} fill="white" fontSize={12} textAnchor="middle" dominantBaseline="middle">
                                {Math.round(distance.value)}
                            </text>
                        </g>
                    </g>);
        })}
        </g>);
    return (<BaseRect_1.BaseRect width={viewBox.width} height={viewBox.height} top={viewBox.minY} left={viewBox.minX} strokeWidth={0}>
            {svgContent}
        </BaseRect_1.BaseRect>);
});
exports.MeasurementOverlay.displayName = 'MeasurementOverlay';
//# sourceMappingURL=MeasurementOverlay.js.map