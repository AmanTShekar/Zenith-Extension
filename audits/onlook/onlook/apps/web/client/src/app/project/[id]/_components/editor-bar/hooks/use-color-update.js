"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useColorUpdate = void 0;
const editor_1 = require("@/components/store/editor");
const constants_1 = require("@onlook/constants");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const useColorUpdate = ({ elementStyleKey, initialColor, onValueChange, }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [tempColor, setTempColor] = (0, react_1.useState)(utility_1.Color.from(initialColor ?? '#000000'));
    (0, react_1.useEffect)(() => {
        setTempColor(utility_1.Color.from(initialColor ?? '#000000'));
    }, [initialColor]);
    const handleColorUpdateEnd = (0, react_1.useCallback)((newValue) => {
        try {
            if (newValue instanceof utility_1.Color) {
                const valueString = newValue.toHex();
                editorEngine.style.update(elementStyleKey, valueString);
                onValueChange?.(elementStyleKey, valueString);
            }
            else {
                let colorValue = newValue.originalKey;
                if (colorValue.endsWith(constants_1.DEFAULT_COLOR_NAME)) {
                    colorValue = colorValue.split(`-${constants_1.DEFAULT_COLOR_NAME}`)?.[0] ?? '';
                }
                editorEngine.style.updateCustom(elementStyleKey, colorValue);
                onValueChange?.(elementStyleKey, newValue.lightColor);
            }
        }
        catch (error) {
            console.error('Error updating color:', error);
        }
    }, [editorEngine.style, elementStyleKey, onValueChange]);
    const handleColorUpdate = (0, react_1.useCallback)((newColor) => {
        try {
            setTempColor(newColor instanceof utility_1.Color ? newColor : utility_1.Color.from(newColor.lightColor));
        }
        catch (error) {
            console.error('Error converting color:', error);
        }
    }, []);
    return {
        tempColor,
        handleColorUpdate,
        handleColorUpdateEnd,
    };
};
exports.useColorUpdate = useColorUpdate;
//# sourceMappingURL=use-color-update.js.map