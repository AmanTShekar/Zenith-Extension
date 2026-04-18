"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectionInput = void 0;
const editor_1 = require("@/components/store/editor");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("react");
const input_radio_1 = require("../../inputs/input-radio");
const directionOptions = {
    column: { value: 'column', label: 'Vertical', icon: <icons_1.Icons.ArrowDown className="h-4 w-4"/> },
    row: { value: 'row', label: 'Horizontal', icon: <icons_1.Icons.ArrowRight className="h-4 w-4"/> },
};
const DirectionInput = () => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [value, setValue] = (0, react_1.useState)(editorEngine.style.selectedStyle?.styles.computed.flexDirection ?? 'column');
    (0, react_1.useEffect)(() => {
        setValue(editorEngine.style.selectedStyle?.styles.computed.flexDirection ?? 'column');
    }, [editorEngine.style.selectedStyle?.styles.computed.flexDirection]);
    // Check if flexbox is active
    const displayValue = editorEngine.style.selectedStyle?.styles.computed.display;
    const isFlexboxActive = displayValue === 'flex' || displayValue === 'inline-flex';
    // Don't render if flexbox is not active
    if (!isFlexboxActive) {
        return null;
    }
    return (<div className="flex items-center gap-0">
            <span className="text-sm text-muted-foreground w-20">Direction</span>
            <input_radio_1.InputRadio options={Object.values(directionOptions)} value={value} onChange={(newValue) => {
            setValue(newValue);
            editorEngine.style.updateMultiple({
                'flex-direction': newValue,
                display: 'flex',
            });
        }} className="flex-1"/>
        </div>);
};
exports.DirectionInput = DirectionInput;
//# sourceMappingURL=direction.js.map