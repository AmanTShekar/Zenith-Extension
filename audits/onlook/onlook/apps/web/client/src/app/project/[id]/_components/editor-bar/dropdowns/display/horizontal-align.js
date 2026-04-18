"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorizontalAlignInput = void 0;
const editor_1 = require("@/components/store/editor");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const input_radio_1 = require("../../inputs/input-radio");
const horizontalAlignOptions = {
    'flex-start': {
        value: 'flex-start',
        label: 'Left',
        icon: <icons_1.Icons.AlignLeft className="h-4 w-4"/>,
    },
    center: {
        value: 'center',
        label: 'Center',
        icon: <icons_1.Icons.AlignCenterHorizontally className="h-4 w-4"/>,
    },
    'flex-end': {
        value: 'flex-end',
        label: 'Right',
        icon: <icons_1.Icons.AlignRight className="h-4 w-4"/>,
    },
    'space-between': {
        value: 'space-between',
        label: 'Space Between',
        icon: <icons_1.Icons.SpaceBetweenHorizontally className="h-4 w-4"/>,
    },
};
exports.HorizontalAlignInput = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [value, setValue] = (0, react_1.useState)(editorEngine.style.selectedStyle?.styles.computed.justifyContent ?? 'flex-start');
    (0, react_1.useEffect)(() => {
        setValue(editorEngine.style.selectedStyle?.styles.computed.justifyContent ?? 'flex-start');
    }, [editorEngine.style.selectedStyle?.styles.computed.justifyContent]);
    // Check if flexbox is active
    const displayValue = editorEngine.style.selectedStyle?.styles.computed.display;
    const isFlexboxActive = displayValue === 'flex' || displayValue === 'inline-flex';
    // Don't render if flexbox is not active
    if (!isFlexboxActive) {
        return null;
    }
    return (<div className="flex items-center gap-0">
            <span className="text-sm text-muted-foreground w-20">Horizontal</span>
            <input_radio_1.InputRadio options={Object.values(horizontalAlignOptions)} value={value} onChange={(newValue) => {
            setValue(newValue);
            editorEngine.style.update('justify-content', newValue);
        }} className="flex-1"/>
        </div>);
});
//# sourceMappingURL=horizontal-align.js.map