"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutMode = exports.LayoutProperty = void 0;
exports.parseModeAndValue = parseModeAndValue;
exports.getRelativeValue = getRelativeValue;
exports.getAutolayoutStyles = getAutolayoutStyles;
exports.getRowColumnCount = getRowColumnCount;
exports.generateRowColumnTemplate = generateRowColumnTemplate;
var LayoutProperty;
(function (LayoutProperty) {
    LayoutProperty["width"] = "width";
    LayoutProperty["height"] = "height";
})(LayoutProperty || (exports.LayoutProperty = LayoutProperty = {}));
var LayoutMode;
(function (LayoutMode) {
    LayoutMode["Fit"] = "Fit";
    LayoutMode["Fill"] = "Fill";
    LayoutMode["Relative"] = "Relative";
    LayoutMode["Fixed"] = "Fixed";
})(LayoutMode || (exports.LayoutMode = LayoutMode = {}));
function parseModeAndValue(value) {
    if (value === 'fit-content' || value === 'auto' || value === '') {
        return { mode: LayoutMode.Fit, layoutValue: '' };
    }
    if (value === '100%' || value === 'auto') {
        return { mode: LayoutMode.Fill, layoutValue: '100%' };
    }
    if (value.includes('%')) {
        return { mode: LayoutMode.Relative, layoutValue: value };
    }
    return { mode: LayoutMode.Fixed, layoutValue: value };
}
function getRelativeValue(property, childRect, parentRect) {
    const parentDimension = property === LayoutProperty.width ? parentRect.width : parentRect.height;
    const childDimension = property === LayoutProperty.width ? childRect.width : childRect.height;
    return `${((childDimension / parentDimension) * 100).toFixed(0)}%`;
}
function getAutolayoutStyles(property, mode, value, childRect, parentRect) {
    const MODE_PROPERTIES = {
        [LayoutMode.Fit]: 'fit-content',
        [LayoutMode.Fill]: '100%',
        [LayoutMode.Relative]: getRelativeValue(property, childRect, parentRect),
        [LayoutMode.Fixed]: `${property === LayoutProperty.width ? childRect.width : childRect.height}px`,
    };
    return MODE_PROPERTIES[mode] || value;
}
function getRowColumnCount(value) {
    return value.split(' ').length;
}
function generateRowColumnTemplate(value) {
    return `repeat(${value}, 1fr)`;
}
//# sourceMappingURL=autolayout.js.map