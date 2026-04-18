"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GapInput = void 0;
const editor_1 = require("@/components/store/editor");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const input_icon_1 = require("../../inputs/input-icon");
const GapInput = () => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { num, unit } = (0, utility_1.stringToParsedValue)(editorEngine.style.selectedStyle?.styles.computed.gap?.toString() ?? '12px');
    const [numValue, setNumValue] = (0, react_1.useState)(num);
    const [unitValue, setUnitValue] = (0, react_1.useState)(unit);
    (0, react_1.useEffect)(() => {
        const { num, unit } = (0, utility_1.stringToParsedValue)(editorEngine.style.selectedStyle?.styles.computed.gap?.toString() ?? '12px');
        setNumValue(num);
        setUnitValue(unit);
    }, [editorEngine.style.selectedStyle?.styles.computed.gap]);
    return (<div className="flex items-center gap-0 w-full">
            <span className="text-sm text-muted-foreground w-20">Gap</span>
            <div className="flex-1">
                <input_icon_1.InputIcon value={numValue} unit={unitValue} onChange={(newValue) => {
            setNumValue(newValue);
            editorEngine.style.update('gap', `${newValue}${unitValue}`);
        }} onUnitChange={(newUnit) => {
            setUnitValue(newUnit);
            editorEngine.style.update('gap', `${numValue}${newUnit}`);
        }}/>
            </div>
        </div>);
};
exports.GapInput = GapInput;
//# sourceMappingURL=gap.js.map