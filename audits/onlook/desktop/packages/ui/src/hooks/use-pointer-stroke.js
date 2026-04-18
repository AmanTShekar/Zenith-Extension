"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePointerStroke = usePointerStroke;
exports.usePointerStrokeCapture = usePointerStrokeCapture;
const react_1 = require("react");
function usePointerStroke({ onBegin, onMove, onEnd, onHover }, deps) {
    const stateRef = (0, react_1.useRef)();
    const onPointerDown = (0, react_1.useCallback)((e) => {
        if (e.button !== 0) {
            return;
        }
        e.currentTarget.setPointerCapture(e.pointerId);
        const x = Math.round(e.clientX);
        const y = Math.round(e.clientY);
        const initData = onBegin(e);
        stateRef.current = {
            initX: x,
            initY: y,
            lastX: x,
            lastY: y,
            initData,
        };
    }, deps);
    const onPointerMove = (0, react_1.useCallback)((e) => {
        if (!stateRef.current) {
            onHover?.(e);
            return;
        }
        const x = Math.round(e.clientX);
        const y = Math.round(e.clientY);
        const { initX, initY, lastX, lastY } = stateRef.current;
        if (e.buttons === 0) {
            // TODO: Looks like onPointerUp is not called accidentally
            e.currentTarget.releasePointerCapture(e.pointerId);
            onEnd?.(e, {
                totalDeltaX: x - initX,
                totalDeltaY: y - initY,
                initData: stateRef.current.initData,
            });
            stateRef.current = undefined;
            return;
        }
        stateRef.current.lastX = x;
        stateRef.current.lastY = y;
        onMove(e, {
            totalDeltaX: x - initX,
            totalDeltaY: y - initY,
            deltaX: x - lastX,
            deltaY: y - lastY,
            initData: stateRef.current.initData,
        });
    }, deps);
    const onPointerUp = (0, react_1.useCallback)((e) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        if (!stateRef.current) {
            return;
        }
        const x = Math.round(e.clientX);
        const y = Math.round(e.clientY);
        const { initX, initY } = stateRef.current;
        onEnd?.(e, {
            totalDeltaX: x - initX,
            totalDeltaY: y - initY,
            initData: stateRef.current.initData,
        });
        stateRef.current = undefined;
    }, deps);
    return { onPointerDown, onPointerMove, onPointerUp };
}
function usePointerStrokeCapture(options, deps) {
    const props = usePointerStroke(options, deps);
    return {
        onPointerDownCapture: props.onPointerDown,
        onPointerMoveCapture: props.onPointerMove,
        onPointerUpCapture: props.onPointerUp,
    };
}
//# sourceMappingURL=use-pointer-stroke.js.map