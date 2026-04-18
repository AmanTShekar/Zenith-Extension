"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Padding = exports.SIDE_ORDER = exports.PaddingTab = void 0;
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const use_box_control_1 = require("../hooks/use-box-control");
const use_dropdown_manager_1 = require("../hooks/use-dropdown-manager");
const hover_tooltip_1 = require("../hover-tooltip");
const input_range_1 = require("../inputs/input-range");
const spacing_inputs_1 = require("../inputs/spacing-inputs");
const toolbar_button_1 = require("../toolbar-button");
var PaddingTab;
(function (PaddingTab) {
    PaddingTab["ALL"] = "all";
    PaddingTab["INDIVIDUAL"] = "individual";
})(PaddingTab || (exports.PaddingTab = PaddingTab = {}));
exports.SIDE_ORDER = ['top', 'right', 'bottom', 'left']; // !!!! DO NOT CHANGE THE ORDER !!!!
const PADDING_ICON_MAP = {
    'TRBL': icons_1.Icons.PaddingFull,
    'TRB': icons_1.Icons.PaddingTRB,
    'TRL': icons_1.Icons.PaddingTRL,
    'TBL': icons_1.Icons.PaddingTBL,
    'RBL': icons_1.Icons.PaddingRBL,
    'TR': icons_1.Icons.PaddingTR,
    'TB': icons_1.Icons.PaddingTB,
    'TL': icons_1.Icons.PaddingTL,
    'RB': icons_1.Icons.PaddingRB,
    'RL': icons_1.Icons.PaddingRL,
    'BL': icons_1.Icons.PaddingBL,
    'T': icons_1.Icons.PaddingTop,
    'R': icons_1.Icons.PaddingRight,
    'B': icons_1.Icons.PaddingBottom,
    'L': icons_1.Icons.PaddingLeft,
};
exports.Padding = (0, mobx_react_lite_1.observer)(() => {
    const { boxState, handleBoxChange, handleUnitChange, handleIndividualChange } = (0, use_box_control_1.useBoxControl)('padding');
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'padding-dropdown'
    });
    const areAllPaddingsEqual = (0, react_1.useMemo)(() => {
        const paddings = {
            top: boxState.paddingTop.num ?? 0,
            right: boxState.paddingRight.num ?? 0,
            bottom: boxState.paddingBottom.num ?? 0,
            left: boxState.paddingLeft.num ?? 0,
        };
        const values = Object.values(paddings);
        return values.every(val => val === values[0]);
    }, [boxState.paddingTop.num, boxState.paddingRight.num, boxState.paddingBottom.num, boxState.paddingLeft.num]);
    const [activeTab, setActiveTab] = (0, react_1.useState)(areAllPaddingsEqual ? PaddingTab.ALL : PaddingTab.INDIVIDUAL);
    const getPaddingIcon = () => {
        const paddings = {
            top: boxState.paddingTop.num ?? 0,
            right: boxState.paddingRight.num ?? 0,
            bottom: boxState.paddingBottom.num ?? 0,
            left: boxState.paddingLeft.num ?? 0,
        };
        const values = Object.values(paddings);
        const nonZeroValues = values.filter(val => val > 0);
        // All zero
        if (nonZeroValues.length === 0) {
            return icons_1.Icons.PaddingEmpty;
        }
        // All same non-zero values
        const allSame = nonZeroValues.length === 4 &&
            nonZeroValues.every(val => val === nonZeroValues[0]) &&
            nonZeroValues[0] !== 0;
        if (allSame) {
            return icons_1.Icons.PaddingFull;
        }
        // Create a pattern string for active sides in consistent order (T-R-B-L)
        const activeSides = exports.SIDE_ORDER
            .filter(side => paddings[side] > 0)
            .map(side => side.charAt(0).toUpperCase())
            .join('');
        return PADDING_ICON_MAP[activeSides] ?? icons_1.Icons.PaddingEmpty;
    };
    const getPaddingDisplay = () => {
        const top = boxState.paddingTop.num ?? 0;
        const right = boxState.paddingRight.num ?? 0;
        const bottom = boxState.paddingBottom.num ?? 0;
        const left = boxState.paddingLeft.num ?? 0;
        // If all are zero, return null
        if (top === 0 && right === 0 && bottom === 0 && left === 0) {
            return null;
        }
        // Get all non-zero values
        const nonZeroValues = [top, right, bottom, left].filter(val => val !== 0);
        // If all non-zero values are the same
        if (nonZeroValues.length > 0 && nonZeroValues.every(val => val === nonZeroValues[0])) {
            return boxState.padding.unit === 'px' ? `${nonZeroValues[0]}` : `${boxState.padding.value}`;
        }
        // If values are different
        return 'Mixed';
    };
    const PaddingIcon = getPaddingIcon();
    const paddingValue = getPaddingDisplay();
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <hover_tooltip_1.HoverOnlyTooltip content="Padding" side="bottom">
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <toolbar_button_1.ToolbarButton isOpen={isOpen} className={`gap-1 flex items-center min-w-9 ${paddingValue ? '!text-foreground-primary [&_*]:!text-foreground-primary' : ''}`}>
                        <PaddingIcon className="h-4 min-h-4 w-4 min-w-4"/>
                        {paddingValue && (<span className="text-small text-foreground-primary">{paddingValue}</span>)}
                    </toolbar_button_1.ToolbarButton>
                </dropdown_menu_1.DropdownMenuTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent align="start" className="w-[280px] mt-1 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => setActiveTab(PaddingTab.ALL)} className={`flex-1 text-sm px-4 py-1.5 rounded-md transition-colors cursor-pointer ${activeTab === PaddingTab.ALL
            ? 'text-foreground-primary bg-background-active/50'
            : 'text-muted-foreground hover:bg-background-tertiary/20 hover:text-foreground-hover'}`}>
                        {areAllPaddingsEqual ? "All sides" : "Mixed"}
                    </button>
                    <button onClick={() => setActiveTab(PaddingTab.INDIVIDUAL)} className={`flex-1 text-sm px-4 py-1.5 rounded-md transition-colors cursor-pointer ${activeTab === PaddingTab.INDIVIDUAL
            ? 'text-foreground-primary bg-background-active/50'
            : 'text-muted-foreground hover:bg-background-tertiary/20 hover:text-foreground-hover'}`}>
                        Individual
                    </button>
                </div>
                {activeTab === PaddingTab.ALL ? (<input_range_1.InputRange value={boxState.padding.num ?? 0} onChange={(value) => handleBoxChange('padding', value.toString())} unit={boxState.padding.unit} onUnitChange={(unit) => handleUnitChange('padding', unit)} min={0} max={384} step={16}/>) : (<spacing_inputs_1.SpacingInputs type="padding" values={{
                top: boxState.paddingTop.num ?? 0,
                right: boxState.paddingRight.num ?? 0,
                bottom: boxState.paddingBottom.num ?? 0,
                left: boxState.paddingLeft.num ?? 0,
            }} onChange={handleIndividualChange}/>)}
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=padding.js.map