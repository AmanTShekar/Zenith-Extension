"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const numberUnit_1 = require("@/lib/editor/styles/numberUnit");
const use_toast_1 = require("@onlook/ui/use-toast");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const TextInput = (0, mobx_react_lite_1.observer)(({ elementStyle, onValueChange, className, disabled, }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [value, setValue] = (0, react_1.useState)(elementStyle.defaultValue);
    const [isFocused, setIsFocused] = (0, react_1.useState)(false);
    const [prevValue, setPrevValue] = (0, react_1.useState)(elementStyle.defaultValue);
    (0, react_1.useEffect)(() => {
        if (isFocused || !editorEngine.style.selectedStyle) {
            return;
        }
        const newValue = elementStyle.getValue(editorEngine.style.selectedStyle?.styles);
        setValue(newValue);
    }, [editorEngine.style.selectedStyle, isFocused]);
    const sendStyleUpdate = (newValue) => {
        editorEngine.style.update(elementStyle.key, newValue);
        onValueChange && onValueChange(elementStyle.key, newValue);
    };
    const emitValue = (newValue) => {
        const { numberVal, unitVal } = (0, numberUnit_1.stringToParsedValue)(newValue);
        const parsedNum = parseFloat(numberVal);
        const newUnit = (0, numberUnit_1.getDefaultUnit)(unitVal);
        newValue = (0, numberUnit_1.parsedValueToString)(parsedNum.toString(), newUnit);
        const { min, max } = elementStyle.params || {};
        if (min !== undefined && parsedNum < min) {
            (0, use_toast_1.toast)({
                title: 'Invalid Input',
                description: `Value for ${elementStyle.displayName} cannot be less than ${min}`,
                variant: 'destructive',
            });
            return;
        }
        if (max !== undefined && parsedNum > max) {
            (0, use_toast_1.toast)({
                title: 'Invalid Input',
                description: `Value for ${elementStyle.displayName} cannot be greater than ${max}`,
                variant: 'destructive',
            });
            return;
        }
        setValue(newValue);
        sendStyleUpdate(newValue);
    };
    const handleFocus = () => {
        setPrevValue(value);
        setIsFocused(true);
        editorEngine.history.startTransaction();
    };
    const handleBlur = (e) => {
        setIsFocused(false);
        if (prevValue !== e.currentTarget.value) {
            emitValue(e.currentTarget.value);
        }
        editorEngine.history.commitTransaction();
    };
    return (<input type="text" className={(0, utils_1.cn)('w-full p-[6px] text-xs px-2 rounded border-none text-active bg-background-onlook/75 text-start focus:outline-none focus:ring-0 appearance-none', className)} placeholder="--" value={value} onChange={(e) => setValue(e.currentTarget.value)} onFocus={handleFocus} onBlur={handleBlur} onKeyDown={(e) => (0, numberUnit_1.handleNumberInputKeyDown)(e, elementStyle, value, setValue, sendStyleUpdate)} disabled={disabled}/>);
});
exports.default = TextInput;
//# sourceMappingURL=TextInput.js.map