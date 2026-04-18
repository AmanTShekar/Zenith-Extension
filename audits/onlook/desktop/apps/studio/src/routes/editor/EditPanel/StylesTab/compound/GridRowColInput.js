"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const autolayout_1 = require("@/lib/editor/styles/autolayout");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const GridRowColInput = (0, mobx_react_lite_1.observer)(({ elementStyle }) => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [value, setValue] = (0, react_1.useState)(elementStyle.defaultValue);
    (0, react_1.useEffect)(() => {
        const selectedStyle = editorEngine.style.selectedStyle;
        if (!selectedStyle) {
            return;
        }
        const newValue = (0, autolayout_1.getRowColumnCount)(elementStyle.getValue(selectedStyle.styles)).toString();
        setValue(newValue);
    }, [editorEngine.style.selectedStyle]);
    const handleInput = (event) => {
        const newValue = (0, autolayout_1.generateRowColumnTemplate)(event.target.value);
        setValue(event.target.value);
        editorEngine.style.update(elementStyle.key, newValue);
    };
    return (<input type="number" className={`w-full p-[6px] text-xs px-2 rounded border-none text-active bg-background-onlook/75 text-start focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} placeholder="--" value={value} onInput={handleInput} onFocus={editorEngine.history.startTransaction} onBlur={editorEngine.history.commitTransaction}/>);
});
exports.default = GridRowColInput;
//# sourceMappingURL=GridRowColInput.js.map