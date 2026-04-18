"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBoxControl = void 0;
const editor_1 = require("@/components/store/editor");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const CORNERS_RADIUS = [
    'TopLeftRadius',
    'TopRightRadius',
    'BottomRightRadius',
    'BottomLeftRadius',
];
const SIDES = ['Top', 'Right', 'Bottom', 'Left'];
const createBoxState = (num, unit = 'px') => ({
    num,
    unit,
    value: num ? `${num}${unit}` : '--',
});
const createDefaultState = (type) => {
    const state = {};
    if (type === 'radius') {
        state.borderRadius = createBoxState();
        CORNERS_RADIUS.forEach((corner) => {
            state[`border${corner}`] = createBoxState();
        });
    }
    else if (type === 'border') {
        state.borderWidth = createBoxState();
        SIDES.forEach((side) => {
            state[`border${side}Width`] = createBoxState();
            state[`border${side}Color`] = {
                num: undefined,
                unit: '',
                value: '#000000',
            };
        });
    }
    else {
        state[type] = createBoxState();
        SIDES.forEach((side) => {
            state[`${type}${side}`] = createBoxState();
        });
    }
    return state;
};
const hasBorderWidth = (borderState) => {
    if (!borderState)
        return false;
    if (borderState.unit === 'px') {
        return typeof borderState.num === 'number' && borderState.num > 0;
    }
    return borderState.value !== '--' && borderState.value !== '' && borderState.value !== '0px';
};
const useBoxControl = (type) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const getInitialState = (0, react_1.useMemo)(() => {
        const defaultState = createDefaultState(type);
        const computedStyles = editorEngine.style.selectedStyle?.styles.computed;
        if (!computedStyles)
            return defaultState;
        if (type === 'radius') {
            const radiusValue = computedStyles.borderRadius?.toString() ?? '--';
            const { num, unit } = (0, utility_1.stringToParsedValue)(radiusValue);
            defaultState.borderRadius = createBoxState(num, unit);
            CORNERS_RADIUS.forEach((corner) => {
                const cssProperty = `border${corner}`;
                const { num, unit } = (0, utility_1.stringToParsedValue)(computedStyles[cssProperty]?.toString() ?? radiusValue);
                defaultState[cssProperty] = createBoxState(num, unit);
            });
        }
        else if (type === 'border') {
            const borderValue = computedStyles.borderWidth?.toString() ?? '--';
            const { num, unit } = (0, utility_1.stringToParsedValue)(borderValue);
            defaultState.borderWidth = createBoxState(num, unit);
            SIDES.forEach((side) => {
                const widthProperty = `border${side}Width`;
                const { num, unit } = (0, utility_1.stringToParsedValue)(computedStyles[widthProperty]?.toString() ?? borderValue);
                defaultState[widthProperty] = createBoxState(num, unit);
                const colorProperty = `border${side}Color`;
                defaultState[colorProperty] = {
                    num: undefined,
                    unit: '',
                    value: computedStyles[colorProperty]?.toString() ?? '#000000',
                };
            });
        }
        else {
            const value = computedStyles[type]?.toString() ?? '--';
            const { num, unit } = (0, utility_1.stringToParsedValue)(value);
            defaultState[type] = createBoxState(num, unit);
            SIDES.forEach((side) => {
                const cssProperty = `${type}${side}`;
                const { num, unit } = (0, utility_1.stringToParsedValue)(computedStyles[cssProperty]?.toString() ?? value);
                defaultState[cssProperty] = createBoxState(num, unit);
            });
        }
        return defaultState;
    }, [editorEngine.style.selectedStyle, type]);
    const [boxState, setBoxState] = (0, react_1.useState)(getInitialState);
    const [borderExists, setBorderExists] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setBorderExists(hasBorderWidth(boxState.borderWidth));
    }, [boxState.borderWidth]);
    (0, react_1.useEffect)(() => {
        setBoxState(getInitialState);
    }, [getInitialState]);
    const handleBoxChange = (0, react_1.useCallback)((property, value) => {
        const parsedValue = value === '--' ? undefined : value;
        const currentState = boxState[property];
        if (!currentState)
            return;
        const cssValue = parsedValue ? `${parsedValue}${currentState.unit}` : '';
        const updates = new Map();
        updates.set(property, cssValue);
        if (type === 'radius' && property === 'borderRadius') {
            CORNERS_RADIUS.forEach((corner) => {
                updates.set(`border${corner}`, cssValue);
            });
        }
        else if (type === 'border' && property === 'borderWidth') {
            SIDES.forEach((side) => {
                updates.set(`border${side}Width`, cssValue);
            });
        }
        else if ((type === 'margin' || type === 'padding') && property === type) {
            SIDES.forEach((side) => {
                updates.set(`${type}${side}`, cssValue);
            });
        }
        editorEngine.style.updateMultiple(Object.fromEntries(updates));
    }, [boxState, editorEngine.style, type]);
    const handleUnitChange = (0, react_1.useCallback)((property, unit) => {
        const currentState = boxState[property];
        if (!currentState)
            return;
        if (currentState.num !== undefined) {
            editorEngine.style.update(property, `${currentState.num}${unit}`);
        }
    }, [boxState, editorEngine.style]);
    const handleIndividualChange = (0, react_1.useCallback)((value, side) => {
        const property = type === 'radius'
            ? `border${(0, utility_1.capitalizeFirstLetter)(side)}Radius`
            : type === 'border'
                ? `border${(0, utility_1.capitalizeFirstLetter)(side)}Width`
                : `${type}${(0, utility_1.capitalizeFirstLetter)(side)}`;
        const currentState = boxState[property];
        if (!currentState)
            return;
        const newValue = `${value}${currentState.unit}`;
        // Update CSS
        editorEngine.style.update(property, newValue);
    }, [boxState, editorEngine.style, type]);
    return {
        boxState,
        borderExists,
        handleBoxChange,
        handleUnitChange,
        handleIndividualChange,
    };
};
exports.useBoxControl = useBoxControl;
//# sourceMappingURL=use-box-control.js.map