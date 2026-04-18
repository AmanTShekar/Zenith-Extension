"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGradientUpdate = void 0;
const editor_1 = require("@/components/store/editor");
const color_picker_1 = require("@onlook/ui/color-picker");
const react_1 = require("react");
const useGradientUpdate = ({ onValueChange } = {}) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const handleGradientUpdateEnd = (0, react_1.useCallback)((gradient) => {
        try {
            const cssValue = (0, color_picker_1.generateGradientCSS)(gradient);
            editorEngine.style.updateMultiple({
                backgroundColor: 'transparent',
                backgroundImage: cssValue
            });
            onValueChange?.('backgroundColor', 'transparent');
            onValueChange?.('backgroundImage', cssValue);
        }
        catch (error) {
            console.error('Error updating gradient:', error);
        }
    }, [editorEngine.style, onValueChange]);
    return {
        handleGradientUpdateEnd,
    };
};
exports.useGradientUpdate = useGradientUpdate;
//# sourceMappingURL=use-gradient-update.js.map