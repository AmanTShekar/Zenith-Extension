"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const numberUnit_1 = require("@/lib/editor/styles/numberUnit");
const icons_1 = require("@onlook/ui/icons");
const use_toast_1 = require("@onlook/ui/use-toast");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const numberWithinRange = (number, min, max) => Math.min(Math.max(number, min), max);
const NumberUnitInput = (0, mobx_react_lite_1.observer)(({ elementStyle, onValueChange, }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [numberValue, setNumberValue] = (0, react_1.useState)('');
    const [unitValue, setUnitValue] = (0, react_1.useState)('');
    const [prevNumberValue, setPrevNumberValue] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        const selectedStyle = editorEngine.style.selectedStyle;
        if (!selectedStyle) {
            return;
        }
        const newValue = elementStyle.getValue(selectedStyle.styles);
        const { numberVal, unitVal } = (0, numberUnit_1.stringToParsedValue)(newValue, elementStyle.key === 'opacity');
        setNumberValue(numberVal);
        setUnitValue(unitVal);
    }, [editorEngine.style.selectedStyle]);
    const sendStyleUpdate = (newValue) => {
        editorEngine.style.update(elementStyle.key, newValue);
        onValueChange && onValueChange(elementStyle.key, newValue);
    };
    const handleNumberInputChange = (e) => {
        setNumberValue(e.currentTarget.value);
        const newNumber = e.currentTarget.value;
        const parsedNewNumber = Number.parseFloat(newNumber);
        const { min, max } = elementStyle.params || {};
        if (min !== undefined && parsedNewNumber < min) {
            (0, use_toast_1.toast)({
                title: `Invalid Input`,
                description: `Value for ${elementStyle.displayName} cannot be less than ${min}`,
                variant: 'destructive',
            });
            return;
        }
        if (max !== undefined && parsedNewNumber > max) {
            (0, use_toast_1.toast)({
                title: `Invalid Input`,
                description: `Value for ${elementStyle.displayName} cannot be more than ${max}`,
                variant: 'destructive',
            });
            return;
        }
        const { unitVal } = (0, numberUnit_1.stringToParsedValue)(e.currentTarget.value, elementStyle.key === 'opacity');
        const newUnit = unitVal === '' ? 'px' : unitVal;
        setUnitValue(newUnit);
    };
    const handleUnitInputChange = (e) => {
        const newUnit = e.currentTarget.value;
        const newValue = (0, numberUnit_1.parsedValueToString)(numberValue, newUnit);
        setUnitValue(newUnit);
        sendStyleUpdate(newValue);
    };
    const setValueCallback = (value) => {
        const { numberVal, unitVal } = (0, numberUnit_1.stringToParsedValue)(value, elementStyle.key === 'opacity');
        setNumberValue(numberVal);
        setUnitValue(unitVal);
    };
    const handleBlur = (e) => {
        if (e.currentTarget.value !== prevNumberValue) {
            const min = elementStyle.params?.min ?? -Infinity;
            const max = elementStyle.params?.max ?? Infinity;
            const parsedValue = Number.parseFloat(numberValue);
            const clampedValue = numberWithinRange(parsedValue, min, max);
            const value = (0, numberUnit_1.parsedValueToString)(clampedValue.toString(), unitValue);
            sendStyleUpdate(value);
        }
        editorEngine.history.commitTransaction();
    };
    const renderNumberInput = () => {
        return (<input type="text" placeholder="--" value={numberValue} onKeyDown={(e) => (0, numberUnit_1.handleNumberInputKeyDown)(e, elementStyle, (0, numberUnit_1.parsedValueToString)(numberValue, unitValue), setValueCallback, sendStyleUpdate)} onChange={handleNumberInputChange} className="w-full p-[6px] px-2 rounded border-none text-foreground-active bg-background-onlook/75 text-start focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" onFocus={() => {
                setPrevNumberValue(numberValue);
                editorEngine.history.startTransaction;
            }} onBlur={handleBlur}/>);
    };
    const renderUnitInput = () => {
        return (<div className="relative w-full group">
                    <select value={unitValue} className="p-[6px] w-full px-2 rounded border-none text-foreground-active bg-background-onlook/75 text-start appearance-none focus:outline-none focus:ring-0" onChange={handleUnitInputChange}>
                        {elementStyle.params?.units?.map((option) => (<option key={option} value={option}>
                                {option}
                            </option>))}
                    </select>
                    <div className="text-foreground-onlook group-hover:text-foreground-hover absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <icons_1.Icons.ChevronDown />
                    </div>
                </div>);
    };
    return (<div className="flex flex-row gap-1 justify-end text-xs w-32">
                {renderNumberInput()}
                {renderUnitInput()}
            </div>);
});
exports.default = NumberUnitInput;
//# sourceMappingURL=NumberUnitInput.js.map