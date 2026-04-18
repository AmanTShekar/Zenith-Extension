"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTextControl = void 0;
const editor_1 = require("@/components/store/editor");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const DefaultState = {
    fontFamily: '--',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'left',
    textColor: '#000000',
    letterSpacing: '0',
    capitalization: 'none',
    textDecorationLine: 'none',
    lineHeight: '1.5',
};
const useTextControl = () => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const getInitialState = () => {
        return {
            fontFamily: (0, utility_1.convertFontString)(editorEngine.style.selectedStyle?.styles.computed.fontFamily ??
                DefaultState.fontFamily),
            fontSize: parseInt(editorEngine.style.selectedStyle?.styles.computed.fontSize?.toString() ??
                DefaultState.fontSize.toString()),
            fontWeight: editorEngine.style.selectedStyle?.styles.computed.fontWeight?.toString() ??
                DefaultState.fontWeight,
            textAlign: (editorEngine.style.selectedStyle?.styles.computed.textAlign ??
                DefaultState.textAlign),
            textColor: editorEngine.style.selectedStyle?.styles.computed.color ?? DefaultState.textColor,
            letterSpacing: editorEngine.style.selectedStyle?.styles.computed.letterSpacing?.toString() ??
                DefaultState.letterSpacing,
            capitalization: editorEngine.style.selectedStyle?.styles.computed.textTransform?.toString() ??
                DefaultState.capitalization,
            textDecorationLine: editorEngine.style.selectedStyle?.styles.computed.textDecorationLine?.toString() ??
                DefaultState.textDecorationLine,
            lineHeight: editorEngine.style.selectedStyle?.styles.computed.lineHeight?.toString() ??
                DefaultState.lineHeight,
        };
    };
    const [textState, setTextState] = (0, react_1.useState)(getInitialState());
    (0, react_1.useEffect)(() => {
        setTextState(getInitialState());
    }, [editorEngine.style.selectedStyle]);
    const handleFontFamilyChange = (fontFamily) => {
        editorEngine.style.updateFontFamily('fontFamily', fontFamily);
        // Reload all views after a delay to ensure the font is applied
        setTimeout(async () => {
            await editorEngine.frames.reloadAllViews();
        }, 500);
    };
    const handleFontSizeChange = (fontSize) => {
        setTextState((prev) => ({
            ...prev,
            fontSize,
        }));
        editorEngine.style.update('fontSize', `${fontSize}px`);
    };
    const handleFontWeightChange = (fontWeight) => {
        setTextState((prev) => ({
            ...prev,
            fontWeight,
        }));
        editorEngine.style.update('fontWeight', fontWeight);
    };
    const handleTextAlignChange = (textAlign) => {
        setTextState((prev) => ({
            ...prev,
            textAlign,
        }));
        editorEngine.style.update('textAlign', textAlign);
    };
    const handleTextColorChange = (textColor) => {
        setTextState((prev) => ({
            ...prev,
            textColor,
        }));
    };
    const handleLetterSpacingChange = (letterSpacing) => {
        setTextState((prev) => ({
            ...prev,
            letterSpacing,
        }));
        editorEngine.style.update('letterSpacing', `${letterSpacing}px`);
    };
    const handleCapitalizationChange = (capitalization) => {
        setTextState((prev) => ({
            ...prev,
            capitalization,
        }));
        editorEngine.style.update('textTransform', capitalization);
    };
    const handleTextDecorationChange = (textDecorationLine) => {
        setTextState((prev) => ({
            ...prev,
            textDecorationLine,
        }));
        editorEngine.style.update('textDecorationLine', textDecorationLine);
    };
    const handleLineHeightChange = (lineHeight) => {
        setTextState((prev) => ({
            ...prev,
            lineHeight,
        }));
        editorEngine.style.update('lineHeight', lineHeight);
    };
    return {
        textState,
        handleFontFamilyChange,
        handleFontSizeChange,
        handleFontWeightChange,
        handleTextAlignChange,
        handleTextColorChange,
        handleLetterSpacingChange,
        handleCapitalizationChange,
        handleTextDecorationChange,
        handleLineHeightChange,
    };
};
exports.useTextControl = useTextControl;
//# sourceMappingURL=use-text-control.js.map