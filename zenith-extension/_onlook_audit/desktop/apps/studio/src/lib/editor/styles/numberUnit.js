"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNumberInputKeyDown = exports.getDefaultUnit = void 0;
exports.stringToParsedValue = stringToParsedValue;
exports.parsedValueToString = parsedValueToString;
const use_toast_1 = require("@onlook/ui/use-toast");
function stringToParsedValue(val, percent = false) {
    const matches = val.match(/([-+]?[0-9]*\.?[0-9]+)([a-zA-Z%]*)/);
    let num = matches ? Number.parseFloat(matches[1]) : 0;
    let unit = matches && matches[2] ? matches[2] : '';
    if (percent && unit === '') {
        unit = '%';
        num = num <= 1 ? num * 100 : num;
    }
    return { numberVal: num.toString(), unitVal: unit };
}
function parsedValueToString(num, unit) {
    return `${num}${unit}`;
}
const getDefaultUnit = (unit) => {
    return unit === '' ? 'px' : unit;
};
exports.getDefaultUnit = getDefaultUnit;
const handleNumberInputKeyDown = (e, elementStyle, value, setValue, sendStyleUpdate) => {
    const { numberVal, unitVal } = stringToParsedValue(value, elementStyle.key === 'opacity');
    const newUnit = (0, exports.getDefaultUnit)(unitVal);
    if (e.key === 'Enter') {
        e.currentTarget.blur();
        return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const delta = e.key === 'ArrowUp' ? step : -step;
        const newNumber = parseFloat(numberVal) + delta;
        const newValue = parsedValueToString(newNumber.toString(), newUnit);
        const { min, max } = elementStyle.params || {};
        if (min !== undefined && newNumber < min) {
            (0, use_toast_1.toast)({
                title: 'Invalid Input',
                description: `Value for ${elementStyle.displayName} cannot be less than ${min}.`,
                variant: 'destructive',
            });
            return;
        }
        if (max !== undefined && newNumber > max) {
            (0, use_toast_1.toast)({
                title: 'Invalid Input',
                description: `Value for ${elementStyle.displayName} cannot be greater than ${max}.`,
                variant: 'destructive',
            });
            return;
        }
        setValue(newValue);
        sendStyleUpdate(newValue);
    }
};
exports.handleNumberInputKeyDown = handleNumberInputKeyDown;
//# sourceMappingURL=numberUnit.js.map