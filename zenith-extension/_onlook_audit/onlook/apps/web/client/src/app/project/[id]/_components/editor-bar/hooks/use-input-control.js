"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInputControl = void 0;
const react_1 = require("react");
const lodash_1 = require("lodash");
const useInputControl = (value, onChange) => {
    const [localValue, setLocalValue] = (0, react_1.useState)(String(value));
    (0, react_1.useEffect)(() => {
        setLocalValue(String(value));
    }, [value]);
    const handleIncrement = (step) => {
        const currentValue = Number(localValue);
        if (!isNaN(currentValue)) {
            const newValue = currentValue + step;
            setLocalValue(String(newValue));
            debouncedOnChange(newValue);
        }
    };
    const handleChange = (inputValue) => {
        setLocalValue(inputValue);
        const numValue = Number(inputValue);
        if (!isNaN(numValue)) {
            debouncedOnChange(numValue);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            const direction = e.key === 'ArrowUp' ? 1 : -1;
            handleIncrement(step * direction);
        }
    };
    const debouncedOnChange = (0, react_1.useMemo)(() => (0, lodash_1.debounce)((newValue) => {
        onChange?.(newValue);
    }, 500), [onChange]);
    (0, react_1.useEffect)(() => {
        return () => {
            debouncedOnChange.cancel();
        };
    }, [debouncedOnChange]);
    return { localValue, handleKeyDown, handleChange };
};
exports.useInputControl = useInputControl;
//# sourceMappingURL=use-input-control.js.map