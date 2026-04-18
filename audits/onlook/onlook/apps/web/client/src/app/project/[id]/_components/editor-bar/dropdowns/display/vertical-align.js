"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerticalAlignInput = void 0;
const editor_1 = require("@/components/store/editor");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const input_radio_1 = require("../../inputs/input-radio");
const verticalAlignOptions = {
    'flex-start': {
        value: 'flex-start',
        label: 'Top',
        icon: <icons_1.Icons.AlignTop className="h-4 w-4"/>,
    },
    center: {
        value: 'center',
        label: 'Center',
        icon: <icons_1.Icons.AlignCenterVertically className="h-4 w-4"/>,
    },
    'flex-end': {
        value: 'flex-end',
        label: 'Bottom',
        icon: <icons_1.Icons.AlignBottom className="h-4 w-4"/>,
    },
    stretch: {
        value: 'stretch',
        label: 'Stretch',
        icon: <icons_1.Icons.SpaceBetweenVertically className="h-4 w-4"/>,
    },
};
exports.VerticalAlignInput = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [value, setValue] = (0, react_1.useState)(editorEngine.style.selectedStyle?.styles.computed.alignItems ?? 'flex-start');
    (0, react_1.useEffect)(() => {
        setValue(editorEngine.style.selectedStyle?.styles.computed.alignItems ?? 'flex-start');
    }, [editorEngine.style.selectedStyle?.styles.computed.alignItems]);
    // Check if flexbox is active
    const displayValue = editorEngine.style.selectedStyle?.styles.computed.display;
    const isFlexboxActive = displayValue === 'flex' || displayValue === 'inline-flex';
    // Don't render if flexbox is not active
    if (!isFlexboxActive) {
        return null;
    }
    return (<div className="flex items-center gap-0">
            <span className="text-sm text-muted-foreground w-20">Vertical</span>
            <input_radio_1.InputRadio options={Object.values(verticalAlignOptions)} value={value} onChange={(newValue) => {
            setValue(newValue);
            editorEngine.style.update('align-items', newValue);
        }} className="flex-1"/>
        </div>);
});
//# sourceMappingURL=vertical-align.js.map