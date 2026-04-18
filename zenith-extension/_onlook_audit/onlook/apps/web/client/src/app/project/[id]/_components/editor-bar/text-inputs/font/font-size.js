"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontSizeSelector = void 0;
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const react_1 = require("react");
const use_dropdown_manager_1 = require("../../hooks/use-dropdown-manager");
const use_text_control_1 = require("../../hooks/use-text-control");
const hover_tooltip_1 = require("../../hover-tooltip");
const toolbar_button_1 = require("../../toolbar-button");
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96];
const FontSizeSelector = () => {
    const inputRef = (0, react_1.useRef)(null);
    const { handleFontSizeChange, textState } = (0, use_text_control_1.useTextControl)();
    const [inputValue, setInputValue] = (0, react_1.useState)(textState.fontSize.toString());
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'font-size-dropdown'
    });
    // Update local input value when textState.fontSize changes externally
    (0, react_1.useEffect)(() => {
        setInputValue(textState.fontSize.toString());
    }, [textState.fontSize]);
    const adjustFontSize = (amount) => {
        const newSize = Math.max(1, textState.fontSize + amount);
        handleFontSizeChange(newSize);
    };
    const handleInputClick = () => {
        onOpenChange(true);
        // Use setTimeout to ensure the input is focused after the dropdown opens
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 0);
    };
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            const value = parseInt(inputValue);
            if (!isNaN(value) && value > 0) {
                handleFontSizeChange(value);
            }
            else {
                // Reset to current value if invalid
                setInputValue(textState.fontSize.toString());
            }
            onOpenChange(false);
            inputRef.current?.blur();
        }
        else if (e.key === 'Escape') {
            // Reset to current value and close
            setInputValue(textState.fontSize.toString());
            onOpenChange(false);
            inputRef.current?.blur();
        }
    };
    const handleInputBlur = () => {
        // When input loses focus, validate and apply the value or reset
        const value = parseInt(inputValue);
        if (!isNaN(value) && value > 0) {
            handleFontSizeChange(value);
        }
        else {
            // Reset to current value if invalid
            setInputValue(textState.fontSize.toString());
        }
    };
    const handleSizeSelect = (size) => {
        handleFontSizeChange(size);
        onOpenChange(false);
        inputRef.current?.blur();
    };
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <hover_tooltip_1.HoverOnlyTooltip content="Font Size" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                <div className="flex items-center gap-0.5">
                    <toolbar_button_1.ToolbarButton onClick={() => adjustFontSize(-1)} className="px-2 min-w-9">
                        <icons_1.Icons.Minus className="h-4 w-4"/>
                    </toolbar_button_1.ToolbarButton>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <toolbar_button_1.ToolbarButton isOpen={isOpen} className="min-w-[40px] px-1 w-11" onClick={handleInputClick}>
                            <input ref={inputRef} type="number" value={inputValue} onChange={handleInputChange} onKeyDown={handleInputKeyDown} onBlur={handleInputBlur} onClick={(e) => e.stopPropagation()} className="w-full bg-transparent text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"/>
                        </toolbar_button_1.ToolbarButton>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <toolbar_button_1.ToolbarButton onClick={() => adjustFontSize(1)} className="px-2 min-w-9">
                        <icons_1.Icons.Plus className="h-4 w-4"/>
                    </toolbar_button_1.ToolbarButton>
                </div>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent align="center" className="mt-1 w-[48px] min-w-[48px] rounded-lg p-1">
                <div className="grid grid-cols-1 gap-1">
                    {FONT_SIZES.map((size) => (<button key={size} onClick={() => handleSizeSelect(size)} className={`cursor-pointer text-muted-foreground data-[highlighted]:bg-background-tertiary/10 border-border/0 data-[highlighted]:border-border justify-center rounded-md border px-2 py-1 text-sm data-[highlighted]:text-white ${size === textState.fontSize
                ? 'bg-background-tertiary/20 border-border border text-white'
                : ''}`}>
                            {size}
                        </button>))}
                </div>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
};
exports.FontSizeSelector = FontSizeSelector;
//# sourceMappingURL=font-size.js.map