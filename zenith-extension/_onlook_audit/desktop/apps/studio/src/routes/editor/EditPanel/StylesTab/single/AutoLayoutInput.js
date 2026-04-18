"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const autolayout_1 = require("@/lib/editor/styles/autolayout");
const numberUnit_1 = require("@/lib/editor/styles/numberUnit");
const icons_1 = require("@onlook/ui/icons");
const use_toast_1 = require("@onlook/ui/use-toast");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const OPTION_OVERRIDES = {
    Fit: 'Hug',
    Relative: 'Rel',
};
const VALUE_OVERRIDE = {
    'fit-content': '',
};
const AutoLayoutInput = (0, mobx_react_lite_1.observer)(({ elementStyle }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [value, setValue] = (0, react_1.useState)(elementStyle.defaultValue);
    const [prevValue, setPrevValue] = (0, react_1.useState)(elementStyle.defaultValue);
    (0, react_1.useEffect)(() => {
        const selectedStyle = editorEngine.style.selectedStyle;
        if (!selectedStyle) {
            return;
        }
        const newValue = elementStyle.getValue(selectedStyle.styles);
        setValue(newValue);
    }, [editorEngine.style.selectedStyle]);
    const emitValue = (newValue) => {
        if (newValue === 'auto' || newValue === 'fit-content' || newValue === '') {
            setValue(newValue);
            sendStyleUpdate(newValue);
            return;
        }
        const { layoutValue, mode } = (0, autolayout_1.parseModeAndValue)(newValue);
        const numValue = parseFloat(layoutValue);
        const { min, max } = elementStyle.params || {};
        if (min !== undefined && numValue < min) {
            (0, use_toast_1.toast)({
                title: 'Invalid Input',
                description: `Value for ${elementStyle.displayName} cannot be less than ${min}`,
                variant: 'destructive',
            });
            return;
        }
        if (max !== undefined && numValue > max) {
            (0, use_toast_1.toast)({
                title: 'Invalid Input',
                description: `Value for ${elementStyle.displayName} cannot be greater than ${max}`,
                variant: 'destructive',
            });
            return;
        }
        const { numberVal, unitVal } = (0, numberUnit_1.stringToParsedValue)(newValue, mode === autolayout_1.LayoutMode.Relative || mode === autolayout_1.LayoutMode.Fill);
        const newUnit = (0, numberUnit_1.getDefaultUnit)(unitVal);
        const newLayoutValue = (0, numberUnit_1.parsedValueToString)(numberVal, newUnit);
        setValue(newLayoutValue);
        sendStyleUpdate(newLayoutValue);
    };
    const handleModeInputChange = (e) => {
        const selectedStyle = editorEngine.style.selectedStyle;
        if (!selectedStyle) {
            console.error('No style record found');
            return;
        }
        const newMode = e.target.value;
        const { layoutValue } = (0, autolayout_1.parseModeAndValue)(value);
        const newLayoutValue = (0, autolayout_1.getAutolayoutStyles)(autolayout_1.LayoutProperty[elementStyle.key], autolayout_1.LayoutMode[newMode], layoutValue, selectedStyle.rect, selectedStyle.parentRect);
        setValue(newLayoutValue);
        sendStyleUpdate(newLayoutValue);
    };
    const sendStyleUpdate = (newValue) => {
        editorEngine.style.update(elementStyle.key, newValue);
    };
    const overrideValue = () => {
        const { layoutValue } = (0, autolayout_1.parseModeAndValue)(value);
        const overriddenValue = VALUE_OVERRIDE[layoutValue];
        return overriddenValue !== undefined ? overriddenValue : layoutValue;
    };
    const handleBlur = (e) => {
        if (e.currentTarget.value !== prevValue) {
            emitValue(e.currentTarget.value);
        }
        editorEngine.history.commitTransaction();
    };
    return (elementStyle && (<div className="flex flex-row gap-1 justify-end">
                <input value={overrideValue()} type="text" className={`w-16 rounded p-1 px-2 text-xs border-none text-active bg-background-onlook/75 text-start focus:outline-none focus:ring-0`} placeholder="--" onChange={(e) => setValue(e.currentTarget.value)} onKeyDown={(e) => (0, numberUnit_1.handleNumberInputKeyDown)(e, elementStyle, value, setValue, sendStyleUpdate)} onFocus={() => {
            setPrevValue(overrideValue());
            editorEngine.history.startTransaction();
        }} onBlur={handleBlur}/>
                <div className="relative w-16">
                    <select name={elementStyle.displayName} value={(0, autolayout_1.parseModeAndValue)(value).mode} className="p-[6px] w-full px-2 text-start rounded border-none text-xs text-active bg-background-onlook/75 appearance-none focus:outline-none focus:ring-0 capitalize" onChange={handleModeInputChange}>
                        {elementStyle.params?.units?.map((option) => (<option key={option} className="bg-background-onlook/75" value={option}>
                                {OPTION_OVERRIDES[option] || option}
                            </option>))}
                    </select>
                    <div className="text-foreground-onlook absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                        <icons_1.Icons.ChevronDown />
                    </div>
                </div>
            </div>));
});
exports.default = AutoLayoutInput;
//# sourceMappingURL=AutoLayoutInput.js.map