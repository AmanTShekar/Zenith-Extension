"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseAction = exports.BrandTabValue = exports.LeftPanelTabValue = exports.SettingsTabValue = exports.EditorTabValue = exports.EditorMode = void 0;
var EditorMode;
(function (EditorMode) {
    EditorMode["DESIGN"] = "design";
    EditorMode["PREVIEW"] = "preview";
    EditorMode["PAN"] = "pan";
    EditorMode["INSERT_TEXT"] = "insert-text";
    EditorMode["INSERT_DIV"] = "insert-div";
    EditorMode["INSERT_IMAGE"] = "insert-image";
})(EditorMode || (exports.EditorMode = EditorMode = {}));
var EditorTabValue;
(function (EditorTabValue) {
    EditorTabValue["STYLES"] = "styles";
    EditorTabValue["CHAT"] = "chat";
    EditorTabValue["PROPS"] = "properties";
})(EditorTabValue || (exports.EditorTabValue = EditorTabValue = {}));
var SettingsTabValue;
(function (SettingsTabValue) {
    SettingsTabValue["DOMAIN"] = "domain";
    SettingsTabValue["PROJECT"] = "project";
    SettingsTabValue["PREFERENCES"] = "preferences";
    SettingsTabValue["VERSIONS"] = "versions";
    SettingsTabValue["ADVANCED"] = "advanced";
})(SettingsTabValue || (exports.SettingsTabValue = SettingsTabValue = {}));
var LeftPanelTabValue;
(function (LeftPanelTabValue) {
    LeftPanelTabValue["PAGES"] = "pages";
    LeftPanelTabValue["LAYERS"] = "layers";
    LeftPanelTabValue["COMPONENTS"] = "components";
    LeftPanelTabValue["IMAGES"] = "images";
    LeftPanelTabValue["WINDOWS"] = "windows";
    LeftPanelTabValue["BRAND"] = "brand";
    LeftPanelTabValue["APPS"] = "apps";
})(LeftPanelTabValue || (exports.LeftPanelTabValue = LeftPanelTabValue = {}));
var BrandTabValue;
(function (BrandTabValue) {
    BrandTabValue["COLORS"] = "colors";
    BrandTabValue["FONTS"] = "fonts";
})(BrandTabValue || (exports.BrandTabValue = BrandTabValue = {}));
var MouseAction;
(function (MouseAction) {
    MouseAction["MOVE"] = "move";
    MouseAction["MOUSE_DOWN"] = "click";
    MouseAction["DOUBLE_CLICK"] = "double-click";
})(MouseAction || (exports.MouseAction = MouseAction = {}));
//# sourceMappingURL=index.js.map