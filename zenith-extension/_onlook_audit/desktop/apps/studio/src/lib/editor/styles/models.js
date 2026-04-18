"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyleGroupKey = exports.CompoundStyleKey = exports.StyleType = void 0;
var StyleType;
(function (StyleType) {
    StyleType["Text"] = "text";
    StyleType["Dimensions"] = "dimensions";
    StyleType["Number"] = "number";
    StyleType["Select"] = "select";
    StyleType["Color"] = "color";
    StyleType["Image"] = "image";
    StyleType["Font"] = "font";
})(StyleType || (exports.StyleType = StyleType = {}));
var CompoundStyleKey;
(function (CompoundStyleKey) {
    CompoundStyleKey["Margin"] = "Margin";
    CompoundStyleKey["Padding"] = "Padding";
    CompoundStyleKey["Corners"] = "Corners";
    CompoundStyleKey["Border"] = "Border";
    CompoundStyleKey["Display"] = "Display";
    CompoundStyleKey["Fill"] = "Fill";
    CompoundStyleKey["Position"] = "Position";
})(CompoundStyleKey || (exports.CompoundStyleKey = CompoundStyleKey = {}));
var StyleGroupKey;
(function (StyleGroupKey) {
    StyleGroupKey["Position"] = "position";
    StyleGroupKey["Layout"] = "layout";
    StyleGroupKey["Style"] = "style";
    StyleGroupKey["Text"] = "text";
})(StyleGroupKey || (exports.StyleGroupKey = StyleGroupKey = {}));
//# sourceMappingURL=models.js.map