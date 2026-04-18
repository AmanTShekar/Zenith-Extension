"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Border = exports.BorderTab = void 0;
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const use_box_control_1 = require("../hooks/use-box-control");
const use_dropdown_manager_1 = require("../hooks/use-dropdown-manager");
const hover_tooltip_1 = require("../hover-tooltip");
const input_range_1 = require("../inputs/input-range");
const spacing_inputs_1 = require("../inputs/spacing-inputs");
const toolbar_button_1 = require("../toolbar-button");
var BorderTab;
(function (BorderTab) {
    BorderTab["ALL"] = "all";
    BorderTab["INDIVIDUAL"] = "individual";
})(BorderTab || (exports.BorderTab = BorderTab = {}));
exports.Border = (0, mobx_react_lite_1.observer)(() => {
    const { boxState, handleBoxChange, handleUnitChange, handleIndividualChange, borderExists } = (0, use_box_control_1.useBoxControl)('border');
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'border-dropdown',
    });
    const areAllBordersEqual = (0, react_1.useMemo)(() => {
        const borders = {
            top: boxState.borderTopWidth.num ?? 0,
            right: boxState.borderRightWidth.num ?? 0,
            bottom: boxState.borderBottomWidth.num ?? 0,
            left: boxState.borderLeftWidth.num ?? 0,
        };
        const values = Object.values(borders);
        return values.every(val => val === values[0]);
    }, [boxState.borderTopWidth.num, boxState.borderRightWidth.num, boxState.borderBottomWidth.num, boxState.borderLeftWidth.num]);
    const [activeTab, setActiveTab] = (0, react_1.useState)(areAllBordersEqual ? BorderTab.ALL : BorderTab.INDIVIDUAL);
    const getBorderDisplay = () => {
        const top = boxState.borderTopWidth.num ?? 0;
        const right = boxState.borderRightWidth.num ?? 0;
        const bottom = boxState.borderBottomWidth.num ?? 0;
        const left = boxState.borderLeftWidth.num ?? 0;
        if (top === 0 && right === 0 && bottom === 0 && left === 0) {
            return null;
        }
        const nonZeroValues = [top, right, bottom, left].filter(val => val !== 0);
        if (nonZeroValues.length === 4 && nonZeroValues.every((val) => val === nonZeroValues[0])) {
            return boxState.borderWidth.unit === 'px'
                ? `${boxState.borderWidth.num}`
                : `${boxState.borderWidth.value}`;
        }
        return "Mixed";
    };
    const borderValue = getBorderDisplay();
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <hover_tooltip_1.HoverOnlyTooltip content="Border" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <toolbar_button_1.ToolbarButton isOpen={isOpen} className={(0, utils_1.cn)('flex items-center gap-1 min-w-9', borderValue && '!text-foreground-primary [&_*]:!text-foreground-primary')}>
                        <icons_1.Icons.BorderEdit className={(0, utils_1.cn)('h-4 w-4 min-h-4 min-w-4', borderExists && 'text-white')}/>
                        {borderValue && (<span className="text-xs !text-white data-[state=open]:!text-foreground-primary">
                                {borderValue}
                            </span>)}
                    </toolbar_button_1.ToolbarButton>
                </dropdown_menu_1.DropdownMenuTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent align="center" side="bottom" className="w-[280px] mt-1 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => setActiveTab(BorderTab.ALL)} className={`flex-1 text-sm px-4 py-1.5 rounded-md transition-colors cursor-pointer ${activeTab === BorderTab.ALL
            ? 'text-foreground-primary bg-background-active/50'
            : 'text-muted-foreground hover:bg-background-tertiary/20 hover:text-foreground-hover'}`}>
                        All sides
                    </button>
                    <button onClick={() => setActiveTab(BorderTab.INDIVIDUAL)} className={`flex-1 text-sm px-4 py-1.5 rounded-md transition-colors cursor-pointer ${activeTab === BorderTab.INDIVIDUAL
            ? 'text-foreground-primary bg-background-active/50'
            : 'text-muted-foreground hover:bg-background-tertiary/20 hover:text-foreground-hover'}`}>
                        Individual
                    </button>
                </div>
                {activeTab === BorderTab.ALL ? (<input_range_1.InputRange value={boxState.borderWidth.num ?? 0} onChange={(value) => handleBoxChange('borderWidth', value.toString())} unit={boxState.borderWidth.unit} onUnitChange={(unit) => handleUnitChange('borderWidth', unit)} min={0} max={16} step={0.25}/>) : (<spacing_inputs_1.SpacingInputs type="border" values={{
                top: boxState.borderTopWidth.num ?? 0,
                right: boxState.borderRightWidth.num ?? 0,
                bottom: boxState.borderBottomWidth.num ?? 0,
                left: boxState.borderLeftWidth.num ?? 0,
            }} onChange={handleIndividualChange}/>)}
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=border.js.map