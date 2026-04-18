"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVPicker = void 0;
const lodash_1 = require("lodash");
const use_pointer_stroke_1 = require("../../hooks/use-pointer-stroke");
const ColorSlider_1 = require("./ColorSlider");
const utility_1 = require("@onlook/utility");
const SVPickerGradient = ({ ...props }) => (<div className="absolute inset-0 z-[-1]" {...props}></div>);
const SVPickerWrap = ({ children, ...props }) => (<div className="relative z-0" {...props}>
        {children}
    </div>);
const SVPickerBody = ({ children, ...props }) => (<div className="relative shadow-inner border border-gray-300 rounded-sm overflow-hidden cursor-pointer" {...props}>
        {children}
    </div>);
const SVPicker = ({ width, height, handleSize, color, onChangeEnd, onChange, onMouseDown }) => {
    const hueDeg = Math.round(color.h * 360);
    const saturationGradient = `linear-gradient(to right, hsl(${hueDeg}, 0%, 100%), hsl(${hueDeg}, 100%, 50%))`;
    const valueGradient = `linear-gradient(to top, hsl(${hueDeg}, 0%, 0%), hsl(${hueDeg}, 0%, 100%))`;
    const valueAtEvent = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const s = (0, lodash_1.clamp)((e.clientX - rect.left) / rect.width, 0, 1);
        const v = (0, lodash_1.clamp)(1 - (e.clientY - rect.top) / rect.height, 0, 1);
        return new utility_1.Color({ ...color, s, v });
    };
    const pointerProps = (0, use_pointer_stroke_1.usePointerStroke)({
        onBegin: (e) => {
            onMouseDown(valueAtEvent(e));
        },
        onMove: (e) => {
            onChange(valueAtEvent(e));
        },
        onEnd: (e) => {
            onChangeEnd(valueAtEvent(e));
        },
    });
    return (<SVPickerWrap>
            <SVPickerBody style={{
            width: `${width}px`,
            height: `${height}px`,
        }} {...pointerProps}>
                <SVPickerGradient style={{ background: valueGradient }}/>
                <SVPickerGradient style={{ background: saturationGradient, mixBlendMode: 'multiply' }}/>
                <ColorSlider_1.ColorHandle style={{
            position: 'absolute',
            left: `${-handleSize / 2 + width * color.s}px`,
            top: `${-handleSize / 2 + height * (1 - color.v)}px`,
            width: `${handleSize}px`,
            height: `${handleSize}px`,
            color: color.toHex(),
        }}/>
            </SVPickerBody>
        </SVPickerWrap>);
};
exports.SVPicker = SVPicker;
//# sourceMappingURL=SVPicker.js.map