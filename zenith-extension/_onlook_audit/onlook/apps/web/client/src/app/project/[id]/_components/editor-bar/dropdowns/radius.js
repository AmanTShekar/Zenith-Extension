"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Radius = void 0;
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
exports.Radius = (0, mobx_react_lite_1.observer)(() => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('all');
    const { boxState, handleBoxChange, handleUnitChange, handleIndividualChange } = (0, use_box_control_1.useBoxControl)('radius');
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'radius-dropdown'
    });
    const getRadiusIcon = () => {
        const topLeft = boxState.borderTopLeftRadius.num ?? 0;
        const topRight = boxState.borderTopRightRadius.num ?? 0;
        const bottomRight = boxState.borderBottomRightRadius.num ?? 0;
        const bottomLeft = boxState.borderBottomLeftRadius.num ?? 0;
        // No radius on any corner
        if (!topLeft && !topRight && !bottomRight && !bottomLeft) {
            return icons_1.Icons.RadiusEmpty;
        }
        // All corners have the same non-zero radius
        const allSame = topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft && topLeft;
        if (allSame) {
            return icons_1.Icons.RadiusFull;
        }
        // All corners have some radius but values differ
        if (topLeft && topRight && bottomRight && bottomLeft) {
            return icons_1.Icons.RadiusFull;
        }
        // Three corners
        if (!topLeft && topRight && bottomRight && bottomLeft)
            return icons_1.Icons.RadiusTRBRBL;
        if (topLeft && !topRight && bottomRight && bottomLeft)
            return icons_1.Icons.RadiusBRBLTL;
        if (topLeft && topRight && !bottomRight && bottomLeft)
            return icons_1.Icons.RadiusTRBLTL;
        if (topLeft && topRight && bottomRight && !bottomLeft)
            return icons_1.Icons.RadiusTRBRTL;
        // Two corners
        if (topRight && bottomRight && !topLeft && !bottomLeft)
            return icons_1.Icons.RadiusTRBR;
        if (topRight && topLeft && !bottomRight && !bottomLeft)
            return icons_1.Icons.RadiusTRTL;
        if (topLeft && bottomRight && !topRight && !bottomLeft)
            return icons_1.Icons.RadiusBRTL;
        if (bottomRight && bottomLeft && !topLeft && !topRight)
            return icons_1.Icons.RadiusBRBL;
        if (bottomLeft && topLeft && !topRight && !bottomRight)
            return icons_1.Icons.RadiusBLTL;
        if (topRight && bottomLeft && !topLeft && !bottomRight)
            return icons_1.Icons.RadiusTRBL;
        // Single corner
        if (topLeft)
            return icons_1.Icons.RadiusTL;
        if (topRight)
            return icons_1.Icons.RadiusTR;
        if (bottomRight)
            return icons_1.Icons.RadiusBR;
        if (bottomLeft)
            return icons_1.Icons.RadiusBL;
        return icons_1.Icons.RadiusFull;
    };
    const getRadiusDisplay = () => {
        const topLeft = boxState.borderTopLeftRadius.num ?? 0;
        const topRight = boxState.borderTopRightRadius.num ?? 0;
        const bottomRight = boxState.borderBottomRightRadius.num ?? 0;
        const bottomLeft = boxState.borderBottomLeftRadius.num ?? 0;
        if (boxState.borderRadius.num === 9999) {
            return 'Full';
        }
        // If all are zero, return null
        if (topLeft === 0 && topRight === 0 && bottomRight === 0 && bottomLeft === 0) {
            return null;
        }
        // Get all non-zero values
        const nonZeroValues = [topLeft, topRight, bottomRight, bottomLeft].filter(val => val !== 0);
        // If all non-zero values are the same
        if (nonZeroValues.length > 0 && nonZeroValues.every(val => val === nonZeroValues[0])) {
            return boxState.borderRadius.unit === 'px' ? `${nonZeroValues[0]}` : `${boxState.borderRadius.value}`;
        }
        // If values are different
        return 'Mixed';
    };
    const RadiusIcon = getRadiusIcon();
    const radiusValue = getRadiusDisplay();
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <hover_tooltip_1.HoverOnlyTooltip content="Radius" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <toolbar_button_1.ToolbarButton isOpen={isOpen} className={(0, utils_1.cn)('gap-1 flex items-center min-w-9', radiusValue && '!text-foreground-primary [&_*]:!text-foreground-primary')}>
                        <RadiusIcon className="h-4 min-h-4 w-4 min-w-4"/>
                        {radiusValue && (<span className="text-small !text-foreground-primary data-[state=open]:!text-foreground-primary">{radiusValue}</span>)}
                    </toolbar_button_1.ToolbarButton>
                </dropdown_menu_1.DropdownMenuTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent align="start" className="w-[280px] mt-1 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => setActiveTab('all')} className={(0, utils_1.cn)('flex-1 text-sm px-4 py-1.5 rounded-md transition-colors cursor-pointer', activeTab === 'all'
            ? 'text-foreground-primary bg-background-active/50'
            : 'text-muted-foreground hover:bg-background-tertiary/20 hover:text-foreground-hover')}>
                        All sides
                    </button>
                    <button onClick={() => setActiveTab('individual')} className={(0, utils_1.cn)('flex-1 text-sm px-4 py-1.5 rounded-md transition-colors cursor-pointer', activeTab === 'individual'
            ? 'text-foreground-primary bg-background-active/50'
            : 'text-muted-foreground hover:bg-background-tertiary/20 hover:text-foreground-hover')}>
                        Individual
                    </button>
                </div>
                {activeTab === 'all' ? (<input_range_1.InputRange value={boxState.borderRadius.num ?? 0} onChange={(value) => handleBoxChange('borderRadius', value.toString())} unit={boxState.borderRadius.unit} onUnitChange={(unit) => handleUnitChange('borderRadius', unit)} min={0} max={32} step={2}/>) : (<spacing_inputs_1.SpacingInputs type="radius" values={{
                topLeft: boxState.borderTopLeftRadius.num ?? 0,
                topRight: boxState.borderTopRightRadius.num ?? 0,
                bottomRight: boxState.borderBottomRightRadius.num ?? 0,
                bottomLeft: boxState.borderBottomLeftRadius.num ?? 0,
            }} onChange={handleIndividualChange}/>)}
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=radius.js.map