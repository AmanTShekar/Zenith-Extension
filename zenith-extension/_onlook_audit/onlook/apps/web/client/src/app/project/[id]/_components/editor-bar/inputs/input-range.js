"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputRange = void 0;
const constants_1 = require("@onlook/constants");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const lodash_1 = require("lodash");
const react_1 = require("react");
const InputRange = ({ value, icon, unit = 'px', min = 0, max = 500, step = 1, onChange, onUnitChange, }) => {
    const [localValue, setLocalValue] = (0, react_1.useState)(String(value));
    const rangeRef = (0, react_1.useRef)(null);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    // Create debounced onChange handler
    const debouncedOnChange = (0, react_1.useMemo)(() => (0, lodash_1.debounce)((newValue) => {
        onChange?.(newValue);
    }, 500), [onChange]);
    // Cleanup debounce on unmount
    (0, react_1.useEffect)(() => {
        return () => {
            debouncedOnChange.cancel();
        };
    }, [debouncedOnChange]);
    // Only update localValue when value prop changes and we're not currently editing
    (0, react_1.useEffect)(() => {
        if (!document.activeElement?.classList.contains('input-range-text')) {
            setLocalValue(String(value));
        }
    }, [value]);
    const handleChange = (e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
    };
    const handleBlur = () => {
        const numValue = Number(localValue);
        if (!isNaN(numValue)) {
            setLocalValue(String(numValue));
            debouncedOnChange(numValue);
        }
        else {
            setLocalValue(String(value));
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const stepValue = e.shiftKey ? step * 10 : step;
            const direction = e.key === 'ArrowUp' ? 1 : -1;
            const currentValue = Number(localValue);
            if (!isNaN(currentValue)) {
                const newValue = currentValue + (stepValue * direction);
                setLocalValue(String(newValue));
                debouncedOnChange(newValue);
            }
        }
        else if (e.key === 'Enter') {
            handleBlur();
        }
    };
    const handleMouseDown = (e) => {
        if (rangeRef.current) {
            setIsDragging(true);
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    };
    const handleMouseMove = (e) => {
        if (isDragging && rangeRef.current) {
            const rect = rangeRef.current.getBoundingClientRect();
            const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const newValue = Math.round((percentage * (max - min) + min) / step) * step;
            setLocalValue(String(newValue));
            debouncedOnChange(newValue);
        }
    };
    const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
    return (<div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
                <input ref={rangeRef} type="range" min={min} max={max} step={step} value={Number(localValue)} onChange={(e) => {
            const newValue = Number(e.target.value);
            setLocalValue(String(newValue));
            debouncedOnChange(newValue);
        }} onMouseDown={handleMouseDown} className="flex-1 h-3 bg-background-tertiary/50 rounded-full appearance-none cursor-pointer relative
                        [&::-webkit-slider-runnable-track]:bg-background-tertiary/50 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:h-3
                        [&::-moz-range-track]:bg-background-tertiary/50 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:h-3
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:mt-[-2px] [&::-webkit-slider-thumb]:cursor-grab hover:[&::-webkit-slider-thumb]:bg-white/90 active:[&::-webkit-slider-thumb]:cursor-grabbing
                        [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-grab hover:[&::-moz-range-thumb]:bg-white/90 active:[&::-moz-range-thumb]:cursor-grabbing
                        [&::-ms-thumb]:appearance-none [&::-ms-thumb]:w-4 [&::-ms-thumb]:h-4 [&::-ms-thumb]:rounded-full [&::-ms-thumb]:bg-white [&::-ms-thumb]:cursor-grab hover:[&::-ms-thumb]:bg-white/90 active:[&::-ms-thumb]:cursor-grabbing"/>
                <div className="flex items-center bg-background-tertiary/50 justify-between rounded-md px-3 h-[36px]">
                    <input type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*" value={localValue} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="min-w-[40px] max-w-[40px] bg-transparent text-sm text-white focus:outline-none uppercase input-range-text"/>

                    <dropdown_menu_1.DropdownMenu modal={false}>
                        <dropdown_menu_1.DropdownMenuTrigger className="text-[12px] text-muted-foreground focus:outline-none cursor-pointer">
                            {unit === 'px' ? '' : unit}
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="start" className="min-w-0 w-[64px]">
                            {constants_1.UNITS.map((unitOption) => (<dropdown_menu_1.DropdownMenuItem key={unitOption} onClick={() => onUnitChange?.(unitOption)} className="text-[12px] text-center px-2">
                                    {unitOption.toUpperCase()}
                                </dropdown_menu_1.DropdownMenuItem>))}
                        </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>
                </div>
            </div>
        </div>);
};
exports.InputRange = InputRange;
//# sourceMappingURL=input-range.js.map