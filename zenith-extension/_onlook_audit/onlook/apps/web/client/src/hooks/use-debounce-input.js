"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDebouncedInput = void 0;
const lodash_1 = require("lodash");
const react_1 = require("react");
const useDebouncedInput = (initialValue, onChange, delay = 500) => {
    const [localValue, setLocalValue] = (0, react_1.useState)(initialValue);
    // Update local value when initial value changes
    (0, react_1.useEffect)(() => {
        setLocalValue(initialValue);
    }, [initialValue]);
    // Create debounced onChange handler
    const debouncedOnChange = (0, react_1.useMemo)(() => (0, lodash_1.debounce)((value) => {
        onChange(value);
    }, delay), [onChange, delay]);
    // Cleanup debounce on unmount
    (0, react_1.useEffect)(() => {
        return () => {
            debouncedOnChange.cancel();
        };
    }, [debouncedOnChange]);
    const handleChange = (0, react_1.useCallback)((e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        debouncedOnChange(newValue);
    }, [debouncedOnChange]);
    return { localValue, handleChange };
};
exports.useDebouncedInput = useDebouncedInput;
//# sourceMappingURL=use-debounce-input.js.map