"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDimensionControl = void 0;
const editor_1 = require("@/components/store/editor");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const createDefaultState = (dimension) => {
    const capitalized = (dimension.charAt(0).toUpperCase() + dimension.slice(1));
    return {
        [dimension]: {
            num: undefined,
            unit: 'px',
            value: 'auto',
            dropdownValue: 'Hug',
        },
        [`min${capitalized}`]: {
            num: undefined,
            unit: 'px',
            value: '--',
            dropdownValue: 'Fixed',
        },
        [`max${capitalized}`]: {
            num: undefined,
            unit: 'px',
            value: '--',
            dropdownValue: 'Fixed',
        },
    };
};
const useDimensionControl = (dimension) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const getInitialState = (0, react_1.useCallback)(() => {
        // Use defined styles because computed styles always return px
        const definedStyles = editorEngine.style.selectedStyle?.styles.defined;
        if (!definedStyles) {
            return createDefaultState(dimension);
        }
        const dimensionValue = definedStyles[dimension]?.toString() ?? '--';
        const { num, unit } = (0, utility_1.stringToParsedValue)(dimensionValue);
        const maxDimensionKey = `max-${dimension}`;
        const maxDimensionValue = definedStyles[maxDimensionKey]?.toString() ?? '--';
        const { num: maxNum, unit: maxUnit } = (0, utility_1.stringToParsedValue)(maxDimensionValue);
        const minDimensionKey = `min-${dimension}`;
        const minDimensionValue = definedStyles[minDimensionKey]?.toString() ?? '--';
        const { num: minNum, unit: minUnit } = (0, utility_1.stringToParsedValue)(minDimensionValue);
        const defaultState = createDefaultState(dimension);
        const capitalized = (dimension.charAt(0).toUpperCase() + dimension.slice(1));
        const getDropdownValue = (value) => {
            const { mode } = (0, utility_1.parseModeAndValue)(value);
            switch (mode) {
                case utility_1.LayoutMode.Fit:
                    return 'Hug';
                case utility_1.LayoutMode.Fill:
                    return 'Fill';
                case utility_1.LayoutMode.Relative:
                    return 'Relative';
                case utility_1.LayoutMode.Fixed:
                    return 'Fixed';
                default:
                    return 'Fixed';
            }
        };
        return {
            ...defaultState,
            [dimension]: {
                num: num,
                unit: unit,
                value: num ? `${num}${unit}` : 'auto',
                dropdownValue: getDropdownValue(dimensionValue),
            },
            [`max${capitalized}`]: {
                num: maxNum,
                unit: maxUnit,
                value: maxNum ? `${maxNum}${maxUnit}` : '--',
                dropdownValue: getDropdownValue(maxDimensionValue),
            },
            [`min${capitalized}`]: {
                num: minNum,
                unit: minUnit,
                value: minNum ? `${minNum}${minUnit}` : '--',
                dropdownValue: getDropdownValue(minDimensionValue),
            },
        };
    }, [dimension, editorEngine.style.selectedStyle]);
    const [dimensionState, setDimensionState] = (0, react_1.useState)(getInitialState());
    (0, react_1.useEffect)(() => {
        setDimensionState(getInitialState());
    }, [getInitialState]);
    const handleDimensionChange = (0, react_1.useCallback)((property, value) => {
        const parsedValue = value;
        const currentState = dimensionState[property];
        if (!currentState)
            return;
        editorEngine.style.update(property, `${parsedValue}${currentState.unit}`);
    }, [dimensionState, editorEngine.style]);
    const handleUnitChange = (0, react_1.useCallback)((property, unit) => {
        const currentState = dimensionState[property];
        if (!currentState)
            return;
        if (currentState.num !== undefined) {
            editorEngine.style.update(property, `${currentState.num}${unit}`);
        }
    }, [dimensionState, editorEngine.style]);
    const handleLayoutChange = (0, react_1.useCallback)((property, value) => {
        const { layoutValue } = (0, utility_1.parseModeAndValue)(value);
        const selectedStyle = editorEngine.style.selectedStyle;
        if (!selectedStyle) {
            console.error('No style record found');
            return;
        }
        const newLayoutValue = (0, utility_1.getAutolayoutStyles)(utility_1.LayoutProperty[property], utility_1.LayoutMode[value], layoutValue, selectedStyle.rect, selectedStyle.parentRect);
        const { num, unit } = (0, utility_1.stringToParsedValue)(newLayoutValue);
        if (num !== undefined) {
            editorEngine.style.update(property, `${num}${unit}`);
        }
    }, [editorEngine.style]);
    return {
        dimensionState,
        handleDimensionChange,
        handleUnitChange,
        handleLayoutChange,
    };
};
exports.useDimensionControl = useDimensionControl;
//# sourceMappingURL=use-dimension-control.js.map