"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Height = void 0;
const toolbar_button_1 = require("../toolbar-button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const use_dimension_control_1 = require("../hooks/use-dimension-control");
const use_dropdown_manager_1 = require("../hooks/use-dropdown-manager");
const hover_tooltip_1 = require("../hover-tooltip");
const input_dropdown_1 = require("../inputs/input-dropdown");
exports.Height = (0, mobx_react_lite_1.observer)(() => {
    const { dimensionState, handleDimensionChange, handleUnitChange, handleLayoutChange } = (0, use_dimension_control_1.useDimensionControl)('height');
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'height-dropdown'
    });
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={onOpenChange} modal={false}>
            <hover_tooltip_1.HoverOnlyTooltip content="Height" side="bottom" className="mt-1" hideArrow disabled={isOpen}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <toolbar_button_1.ToolbarButton isOpen={isOpen} className="flex items-center gap-1">
                        <icons_1.Icons.Height className="h-4 min-h-4 w-4 min-w-4"/>
                        <span className="text-small">
                            {dimensionState.height.value}
                        </span>
                    </toolbar_button_1.ToolbarButton>
                </dropdown_menu_1.DropdownMenuTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent align="start" className="mt-1 w-[280px] space-y-3 rounded-lg p-3">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-white text-sm">Height</span>
                        <input_dropdown_1.InputDropdown value={dimensionState.height.num ?? 0} unit={dimensionState.height.unit} dropdownValue={dimensionState.height.dropdownValue} dropdownOptions={Object.values(utility_1.LayoutMode)} onChange={(value) => handleDimensionChange('height', value)} onUnitChange={(value) => handleUnitChange('height', value)} onDropdownChange={(value) => handleLayoutChange('height', value)}/>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Min</span>
                        <input_dropdown_1.InputDropdown value={dimensionState.minHeight.num ?? 0} unit={dimensionState.minHeight.unit} dropdownValue={dimensionState.minHeight.dropdownValue} dropdownOptions={Object.values(utility_1.LayoutMode)} onChange={(value) => handleDimensionChange('minHeight', value)} onUnitChange={(value) => handleUnitChange('minHeight', value)} onDropdownChange={(value) => handleLayoutChange('minHeight', value)}/>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Max</span>
                        <input_dropdown_1.InputDropdown value={dimensionState.maxHeight.num ?? 0} unit={dimensionState.maxHeight.unit} dropdownValue={dimensionState.maxHeight.dropdownValue} dropdownOptions={Object.values(utility_1.LayoutMode)} onChange={(value) => handleDimensionChange('maxHeight', value)} onUnitChange={(value) => handleUnitChange('maxHeight', value)} onDropdownChange={(value) => handleLayoutChange('maxHeight', value)}/>
                    </div>
                </div>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=height.js.map