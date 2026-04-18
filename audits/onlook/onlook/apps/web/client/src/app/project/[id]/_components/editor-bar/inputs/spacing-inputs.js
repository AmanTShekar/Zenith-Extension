"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpacingInputs = void 0;
const input_icon_1 = require("./input-icon");
const getIconNames = (type) => {
    if (type === 'radius') {
        return {
            topLeft: 'CornerTopLeft',
            topRight: 'CornerTopRight',
            bottomRight: 'CornerBottomRight',
            bottomLeft: 'CornerBottomLeft',
        };
    }
    return {
        left: 'LeftSide',
        top: 'TopSide',
        right: 'RightSide',
        bottom: 'BottomSide',
    };
};
const SpacingInputs = ({ type, values, onChange }) => {
    const icons = getIconNames(type);
    const positions = type === 'radius'
        ? ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
        : ['left', 'top', 'right', 'bottom'];
    return (<div className="grid grid-cols-2 gap-2">
            {positions.map((pos) => (<input_icon_1.InputIcon key={pos} icon={icons[pos]} value={values[pos] ?? 0} onChange={(value) => onChange(value, pos)}/>))}
        </div>);
};
exports.SpacingInputs = SpacingInputs;
//# sourceMappingURL=spacing-inputs.js.map