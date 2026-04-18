"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextSelected = exports.TEXT_SELECTED_GROUPS = void 0;
const react_1 = __importDefault(require("react"));
const border_1 = require("./dropdowns/border");
const border_color_1 = require("./dropdowns/border-color");
const color_background_1 = require("./dropdowns/color-background");
const display_1 = require("./dropdowns/display");
const height_1 = require("./dropdowns/height");
const margin_1 = require("./dropdowns/margin");
const opacity_1 = require("./dropdowns/opacity");
const padding_1 = require("./dropdowns/padding");
const radius_1 = require("./dropdowns/radius");
const width_1 = require("./dropdowns/width");
const use_dropdown_manager_1 = require("./hooks/use-dropdown-manager");
const use_measure_group_1 = require("./hooks/use-measure-group");
const overflow_menu_1 = require("./overflow-menu");
const separator_1 = require("./separator");
const advanced_typography_1 = require("./text-inputs/advanced-typography");
const font_family_selector_1 = require("./text-inputs/font/font-family-selector");
const font_size_1 = require("./text-inputs/font/font-size");
const font_weight_1 = require("./text-inputs/font/font-weight");
const text_align_1 = require("./text-inputs/text-align");
const text_color_1 = require("./text-inputs/text-color");
// Group definitions for the text-selected toolbar
exports.TEXT_SELECTED_GROUPS = [
    {
        key: 'text-base',
        label: 'Base',
        components: [<color_background_1.ColorBackground />, <border_1.Border />, <border_color_1.BorderColor />, <radius_1.Radius />],
    },
    {
        key: 'text-layout',
        label: 'Layout',
        components: [<display_1.Display />, <padding_1.Padding />, <margin_1.Margin />],
    },
    {
        key: 'text-font',
        label: 'Font',
        components: [
            <font_family_selector_1.FontFamilySelector />,
            <separator_1.InputSeparator />,
            <font_weight_1.FontWeightSelector />,
            <separator_1.InputSeparator />,
            <font_size_1.FontSizeSelector />,
        ],
    },
    {
        key: 'text-typography',
        label: 'Typography',
        components: [<text_color_1.TextColor />, <text_align_1.TextAlignSelector />, <advanced_typography_1.AdvancedTypography />],
    },
    {
        key: 'text-opacity',
        label: 'Opacity',
        components: [<opacity_1.Opacity />],
    },
];
const MUST_EXTEND_GROUPS = [
    {
        key: 'text-dimensions',
        label: 'Dimensions',
        components: [<width_1.Width />, <height_1.Height />],
    },
];
const TextSelected = ({ availableWidth = 0 }) => {
    const { visibleCount } = (0, use_measure_group_1.useMeasureGroup)({
        availableWidth,
        count: exports.TEXT_SELECTED_GROUPS.length,
    });
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'text-selected-overflow-dropdown',
        isOverflow: true
    });
    const visibleGroups = exports.TEXT_SELECTED_GROUPS.slice(0, visibleCount);
    const overflowGroups = [...exports.TEXT_SELECTED_GROUPS.slice(visibleCount), ...MUST_EXTEND_GROUPS];
    return (<div className="flex items-center justify-center gap-0.5 w-full overflow-hidden">
            {visibleGroups.map((group, groupIdx) => (<react_1.default.Fragment key={group.key}>
                    {groupIdx > 0 && <separator_1.InputSeparator />}
                    <div className="flex items-center justify-center gap-0.5">
                        {group.components.map((comp, idx) => (<react_1.default.Fragment key={idx}>{comp}</react_1.default.Fragment>))}
                    </div>
                </react_1.default.Fragment>))}
            <overflow_menu_1.OverflowMenu isOpen={isOpen} onOpenChange={onOpenChange} overflowGroups={overflowGroups} visibleCount={visibleCount}/>
        </div>);
};
exports.TextSelected = TextSelected;
//# sourceMappingURL=text-selected.js.map