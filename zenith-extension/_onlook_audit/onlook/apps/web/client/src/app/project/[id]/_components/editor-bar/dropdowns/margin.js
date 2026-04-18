"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Margin = exports.MarginSide = exports.MarginTab = void 0;
const editor_1 = require("@/components/store/editor");
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
var MarginTab;
(function (MarginTab) {
    MarginTab["ALL"] = "all";
    MarginTab["INDIVIDUAL"] = "individual";
})(MarginTab || (exports.MarginTab = MarginTab = {}));
var MarginSide;
(function (MarginSide) {
    MarginSide["TOP"] = "top";
    MarginSide["RIGHT"] = "right";
    MarginSide["BOTTOM"] = "bottom";
    MarginSide["LEFT"] = "left";
    MarginSide["AUTO"] = "auto";
})(MarginSide || (exports.MarginSide = MarginSide = {}));
const SIDE_ORDER = ['top', 'right', 'bottom', 'left']; // !!!! DO NOT CHANGE THE ORDER !!!!
const MARGIN_ICON_MAP = {
    'TRBL': icons_1.Icons.MarginFull,
    'TRB': icons_1.Icons.MarginTRB,
    'TRL': icons_1.Icons.MarginTRL,
    'TBL': icons_1.Icons.MarginBLT,
    'RBL': icons_1.Icons.MarginRBL,
    'TR': icons_1.Icons.MarginTR,
    'TB': icons_1.Icons.MarginTB,
    'TL': icons_1.Icons.MarginTL,
    'RB': icons_1.Icons.MarginRB,
    'RL': icons_1.Icons.MarginRL,
    'BL': icons_1.Icons.MarginBL,
    'T': icons_1.Icons.MarginT,
    'R': icons_1.Icons.MarginR,
    'B': icons_1.Icons.MarginB,
    'L': icons_1.Icons.MarginL,
};
exports.Margin = (0, mobx_react_lite_1.observer)(() => {
    const { boxState, handleBoxChange, handleUnitChange, handleIndividualChange } = (0, use_box_control_1.useBoxControl)('margin');
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'margin-dropdown'
    });
    const areAllMarginsEqual = (0, react_1.useMemo)(() => {
        const margins = {
            top: boxState.marginTop.num ?? 0,
            right: boxState.marginRight.num ?? 0,
            bottom: boxState.marginBottom.num ?? 0,
            left: boxState.marginLeft.num ?? 0,
        };
        const values = Object.values(margins);
        return values.every(val => val === values[0]);
    }, [boxState.marginTop.num, boxState.marginRight.num, boxState.marginBottom.num, boxState.marginLeft.num]);
    const [activeTab, setActiveTab] = (0, react_1.useState)(areAllMarginsEqual ? MarginTab.ALL : MarginTab.INDIVIDUAL);
    const getMarginIcon = () => {
        const margins = {
            top: boxState.marginTop.num ?? 0,
            right: boxState.marginRight.num ?? 0,
            bottom: boxState.marginBottom.num ?? 0,
            left: boxState.marginLeft.num ?? 0,
        };
        const values = Object.values(margins);
        const nonZeroValues = values.filter(val => val > 0);
        if (nonZeroValues.length === 0) {
            return icons_1.Icons.MarginEmpty;
        }
        const allSame = nonZeroValues.length === 4 &&
            nonZeroValues.every(val => val === nonZeroValues[0]);
        if (allSame) {
            return icons_1.Icons.MarginFull;
        }
        // Create a pattern string for active sides in consistent order (T-R-B-L)
        const activeSides = SIDE_ORDER
            .filter(side => margins[side] > 0)
            .map(side => side.charAt(0).toUpperCase())
            .join('');
        return MARGIN_ICON_MAP[activeSides] ?? icons_1.Icons.MarginEmpty;
    };
    const getMarginDisplay = () => {
        const top = boxState.marginTop.num ?? 0;
        const right = boxState.marginRight.num ?? 0;
        const bottom = boxState.marginBottom.num ?? 0;
        const left = boxState.marginLeft.num ?? 0;
        // If all are zero, return null
        if (top === 0 && right === 0 && bottom === 0 && left === 0) {
            return null;
        }
        const definedStyles = editorEngine.style.selectedStyle?.styles.defined;
        // Get all non-zero values
        const nonZeroValues = [top, right, bottom, left].filter(val => val !== 0);
        const isAuto = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'margin']
            .some(key => definedStyles?.[key] === 'auto');
        if (isAuto && top == bottom && left == right) {
            return 'auto';
        }
        // If all non-zero values are the same
        if (nonZeroValues.length > 0 && nonZeroValues.every(val => val === nonZeroValues[0])) {
            if (isAuto) {
                return 'auto';
            }
            return boxState.margin.unit === 'px' ? `${nonZeroValues[0]}` : `${boxState.margin.value}`;
        }
        // If values are different
        return 'Mixed';
    };
    const MarginIcon = getMarginIcon();
    const marginValue = getMarginDisplay();
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <hover_tooltip_1.HoverOnlyTooltip content="Margin" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <toolbar_button_1.ToolbarButton isOpen={isOpen} className={`gap-1 flex items-center min-w-9 ${marginValue ? '!text-foreground-primary [&_*]:!text-foreground-primary' : ''}`}>
                        <MarginIcon className="h-4 min-h-4 w-4 min-w-4"/>
                        {marginValue && (<span className="text-small !text-foreground-primary data-[state=open]:!text-white">{marginValue}</span>)}
                    </toolbar_button_1.ToolbarButton>
                </dropdown_menu_1.DropdownMenuTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent align="start" className="mt-1 w-[280px] rounded-lg p-3">
                <div className="mb-3 flex items-center gap-2">
                    <button onClick={() => setActiveTab(MarginTab.ALL)} className={`flex-1 cursor-pointer rounded-md px-4 py-1.5 text-sm transition-colors ${activeTab === MarginTab.ALL
            ? "bg-background-active/50 text-foreground-primary"
            : "text-muted-foreground hover:bg-background-tertiary/20 hover:text-foreground-hover"}`}>
                        {areAllMarginsEqual ? "All sides" : "Mixed"}
                    </button>
                    <button onClick={() => setActiveTab(MarginTab.INDIVIDUAL)} className={`flex-1 cursor-pointer rounded-md px-4 py-1.5 text-sm transition-colors ${activeTab === MarginTab.INDIVIDUAL
            ? "bg-background-active/50 text-foreground-primary"
            : "text-muted-foreground hover:bg-background-tertiary/20 hover:text-foreground-hover"}`}>
                        Individual
                    </button>
                </div>
                {activeTab === MarginTab.ALL ? (<input_range_1.InputRange value={boxState.margin.num ?? 0} onChange={(value) => handleBoxChange('margin', value.toString())} unit={boxState.margin.unit} onUnitChange={(unit) => handleUnitChange('margin', unit)} min={0} max={384} step={16}/>) : (<spacing_inputs_1.SpacingInputs type="margin" values={{
                top: boxState.marginTop.num ?? 0,
                right: boxState.marginRight.num ?? 0,
                bottom: boxState.marginBottom.num ?? 0,
                left: boxState.marginLeft.num ?? 0
            }} onChange={handleIndividualChange}/>)}
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=margin.js.map