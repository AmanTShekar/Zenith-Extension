"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeInput = void 0;
const editor_1 = require("@/components/store/editor");
const react_1 = require("react");
const input_radio_1 = require("../../inputs/input-radio");
const index_1 = require("./index");
exports.TypeInput = (0, react_1.memo)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [value, setValue] = (0, react_1.useState)(editorEngine.style.selectedStyle?.styles.computed.display ?? 'block');
    (0, react_1.useEffect)(() => {
        setValue(editorEngine.style.selectedStyle?.styles.computed.display ?? 'block');
    }, [editorEngine.style.selectedStyle?.styles.computed.display]);
    return (<div className="flex items-center gap-0">
            <span className="text-sm text-muted-foreground w-20"> Type </span>
            <input_radio_1.InputRadio options={Object.values(index_1.layoutTypeOptions)} value={value} onChange={(newValue) => {
            setValue(newValue);
            editorEngine.style.update('display', newValue);
        }} className="flex-1"/>
        </div>);
});
//# sourceMappingURL=type.js.map