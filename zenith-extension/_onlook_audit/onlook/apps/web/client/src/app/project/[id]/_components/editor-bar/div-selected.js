"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivSelected = exports.DIV_SELECTED_GROUPS = void 0;
const react_1 = __importStar(require("react"));
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
const font_family_selector_1 = require("./text-inputs/font/font-family-selector");
const font_size_1 = require("./text-inputs/font/font-size");
const font_weight_1 = require("./text-inputs/font/font-weight");
const text_color_1 = require("./text-inputs/text-color");
const text_align_1 = require("./text-inputs/text-align");
const input_image_1 = require("./inputs/input-image");
const advanced_typography_1 = require("./text-inputs/advanced-typography");
// Group definitions for the div-selected toolbar
exports.DIV_SELECTED_GROUPS = [
    {
        key: 'base',
        label: 'Base',
        components: [<color_background_1.ColorBackground />, <input_image_1.InputImage />, <border_1.Border />, <border_color_1.BorderColor />, <radius_1.Radius />],
    },
    {
        key: 'layout',
        label: 'Layout',
        components: [<display_1.Display />, <padding_1.Padding />, <margin_1.Margin />],
    },
    {
        key: 'font',
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
        key: 'opacity',
        label: 'Opacity',
        components: [<opacity_1.Opacity />],
    },
];
const MUST_EXTEND_GROUPS = [
    {
        key: 'dimensions',
        label: 'Dimensions',
        components: [<width_1.Width />, <height_1.Height />],
    },
];
exports.DivSelected = (0, react_1.memo)(({ availableWidth = 0 }) => {
    const { visibleCount } = (0, use_measure_group_1.useMeasureGroup)({ availableWidth, count: exports.DIV_SELECTED_GROUPS.length });
    const { isOpen, onOpenChange } = (0, use_dropdown_manager_1.useDropdownControl)({
        id: 'div-selected-overflow-dropdown',
        isOverflow: true
    });
    const visibleGroups = exports.DIV_SELECTED_GROUPS.slice(0, visibleCount);
    const overflowGroups = [...exports.DIV_SELECTED_GROUPS.slice(visibleCount), ...MUST_EXTEND_GROUPS];
    return (<div className="flex items-center justify-center gap-0.5 w-full overflow-hidden">
            {visibleGroups.map((group, groupIdx) => (<react_1.default.Fragment key={group.key}>
                    {groupIdx > 0 && <separator_1.InputSeparator />}
                    <div className="flex items-center justify-center gap-0.5">
                        {group.components.map((comp, idx) => (<react_1.default.Fragment key={idx}>{comp}</react_1.default.Fragment>))}
                    </div>
                </react_1.default.Fragment>))}
            <overflow_menu_1.OverflowMenu isOpen={isOpen} onOpenChange={onOpenChange} overflowGroups={overflowGroups} visibleCount={visibleCount}/>
        </div>);
});
//# sourceMappingURL=div-selected.js.map