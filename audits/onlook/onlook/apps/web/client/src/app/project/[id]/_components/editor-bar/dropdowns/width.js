"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Width = void 0;
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const use_dimension_control_1 = require("../hooks/use-dimension-control");
const use_dropdown_manager_1 = require("../hooks/use-dropdown-manager");
const hover_tooltip_1 = require("../hover-tooltip");
const input_dropdown_1 = require("../inputs/input-dropdown");
const toolbar_button_1 = require("../toolbar-button");
exports.Width = (0, mobx_react_lite_1.observer)(() => {
    const { dimensionState, handleDimensionChange, handleUnitChange, handleLayoutChange } = (0, use_dimension_control_1.useDimensionControl)('width');
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'width-dropdown'
    });
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <hover_tooltip_1.HoverOnlyTooltip content="Width" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <toolbar_button_1.ToolbarButton isOpen={isOpen} className="flex items-center gap-1">
                        <icons_1.Icons.Width className="h-4 w-4 min-h-4 min-w-4"/>
                        <span className="text-small">
                            {dimensionState.width.value}
                        </span>
                    </toolbar_button_1.ToolbarButton>
                </dropdown_menu_1.DropdownMenuTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent align="start" className="w-[260px] mt-1 p-3 rounded-lg space-y-3">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-white">Width</span>
                        <input_dropdown_1.InputDropdown value={dimensionState.width.num ?? 0} unit={dimensionState.width.unit} dropdownValue={dimensionState.width.dropdownValue} dropdownOptions={Object.values(utility_1.LayoutMode)} onChange={(value) => handleDimensionChange('width', value)} onUnitChange={(value) => handleUnitChange('width', value)} onDropdownChange={(value) => handleLayoutChange('width', value)}/>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Min</span>
                        <input_dropdown_1.InputDropdown value={dimensionState.minWidth.num ?? 0} unit={dimensionState.minWidth.unit} dropdownValue={dimensionState.minWidth.dropdownValue} dropdownOptions={Object.values(utility_1.LayoutMode)} onChange={(value) => handleDimensionChange('minWidth', value)} onUnitChange={(value) => handleUnitChange('minWidth', value)} onDropdownChange={(value) => handleLayoutChange('minWidth', value)}/>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Max</span>
                        <input_dropdown_1.InputDropdown value={dimensionState.maxWidth.num ?? 0} unit={dimensionState.maxWidth.unit} dropdownValue={dimensionState.maxWidth.dropdownValue} dropdownOptions={Object.values(utility_1.LayoutMode)} onChange={(value) => handleDimensionChange('maxWidth', value)} onUnitChange={(value) => handleUnitChange('maxWidth', value)} onDropdownChange={(value) => handleLayoutChange('maxWidth', value)}/>
                    </div>
                </div>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=width.js.map