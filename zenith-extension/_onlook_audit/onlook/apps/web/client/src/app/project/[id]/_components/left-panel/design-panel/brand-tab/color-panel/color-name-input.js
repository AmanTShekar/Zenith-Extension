"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorNameInput = void 0;
const editor_1 = require("@/components/store/editor");
const tooltip_1 = require("@onlook/ui/tooltip");
const utility_1 = require("@onlook/utility");
const lodash_1 = require("lodash");
const react_1 = require("react");
const ColorNameInput = ({ initialName, onSubmit, onCancel, existingNames = [], autoFocus = true, disabled = false, onBlur, }) => {
    const [inputValue, setInputValue] = (0, react_1.useState)((0, utility_1.toNormalCase)(initialName));
    const [error, setError] = (0, react_1.useState)(null);
    const editorEngine = (0, editor_1.useEditorEngine)();
    const themeManager = editorEngine.theme;
    (0, react_1.useEffect)(() => {
        setInputValue((0, utility_1.toNormalCase)(initialName));
    }, [initialName]);
    const validateName = (value) => {
        if (value === '') {
            return 'Color name cannot be empty';
        }
        // Allow full numbers (e.g. "123") but not allow names starting with numbers (e.g. "1abc")
        if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
            return 'Color name can only contain text, numbers, and spaces';
        }
        if (/^[0-9]/.test(value) && !/^[0-9\s]+$/.test(value)) {
            return 'Color name cannot start with a number';
        }
        // Skip this check if we're editing the same name
        if ((0, lodash_1.camelCase)(value) === (0, lodash_1.camelCase)(initialName)) {
            return null;
        }
        // Check if name already exists in theme manager or in provided list
        // Check in provided list first
        if (existingNames.length > 0) {
            if (existingNames.includes((0, lodash_1.camelCase)(value))) {
                return 'Color name already exists';
            }
        }
        else {
            // Check in theme manager
            const themeManagerNames = Object.keys(themeManager.colorGroups);
            if (themeManagerNames.includes((0, lodash_1.camelCase)(value))) {
                return 'Color name already exists';
            }
        }
        return null;
    };
    const handleChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setError(validateName(newValue.trim()));
    };
    const handleSubmit = () => {
        if (!error && inputValue.trim() && (0, lodash_1.camelCase)(inputValue) !== initialName) {
            onSubmit((0, lodash_1.camelCase)(inputValue));
        }
        else {
            onCancel();
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !error) {
            handleSubmit();
        }
        else if (e.key === 'Escape') {
            onCancel();
        }
    };
    return (<tooltip_1.Tooltip open={!!error}>
            <tooltip_1.TooltipTrigger asChild>
                <input type="text" value={inputValue} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={() => onBlur?.(inputValue)} className={`text-sm font-normal w-full rounded-md border ${error ? 'border-red-500' : 'border-white/10'} bg-background-secondary px-2 py-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="Enter color name" autoFocus={autoFocus} disabled={disabled}/>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipPortal>
                <tooltip_1.TooltipContent side="top" className="text-white bg-red-500 max-w-xs">
                    {error}
                </tooltip_1.TooltipContent>
            </tooltip_1.TooltipPortal>
        </tooltip_1.Tooltip>);
};
exports.ColorNameInput = ColorNameInput;
//# sourceMappingURL=color-name-input.js.map