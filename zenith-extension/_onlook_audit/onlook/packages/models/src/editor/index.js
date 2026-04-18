"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseAction = exports.BranchTabValue = exports.BrandTabValue = exports.LeftPanelTabValue = exports.SettingsTabValue = exports.InsertMode = exports.EditorMode = void 0;
var EditorMode;
(function (EditorMode) {
    EditorMode["DESIGN"] = "design";
    EditorMode["CODE"] = "code";
    EditorMode["PREVIEW"] = "preview";
    EditorMode["PAN"] = "pan";
})(EditorMode || (exports.EditorMode = EditorMode = {}));
var InsertMode;
(function (InsertMode) {
    InsertMode["INSERT_TEXT"] = "insert-text";
    InsertMode["INSERT_DIV"] = "insert-div";
    InsertMode["INSERT_IMAGE"] = "insert-image";
})(InsertMode || (exports.InsertMode = InsertMode = {}));
var SettingsTabValue;
(function (SettingsTabValue) {
    SettingsTabValue["SITE"] = "site";
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
    LeftPanelTabValue["BRANCHES"] = "branches";
    LeftPanelTabValue["APPS"] = "apps";
})(LeftPanelTabValue || (exports.LeftPanelTabValue = LeftPanelTabValue = {}));
var BrandTabValue;
(function (BrandTabValue) {
    BrandTabValue["COLORS"] = "colors";
    BrandTabValue["FONTS"] = "fonts";
})(BrandTabValue || (exports.BrandTabValue = BrandTabValue = {}));
var BranchTabValue;
(function (BranchTabValue) {
    BranchTabValue["MANAGE"] = "manage";
})(BranchTabValue || (exports.BranchTabValue = BranchTabValue = {}));
var MouseAction;
(function (MouseAction) {
    MouseAction["MOVE"] = "move";
    MouseAction["MOUSE_DOWN"] = "click";
    MouseAction["DOUBLE_CLICK"] = "double-click";
})(MouseAction || (exports.MouseAction = MouseAction = {}));
//# sourceMappingURL=index.js.map