"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandTabValue = exports.LayersPanelTabValue = exports.SettingsTabValue = exports.EditorTabValue = exports.EditorMode = void 0;
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
    EditorTabValue["DEV"] = "dev";
})(EditorTabValue || (exports.EditorTabValue = EditorTabValue = {}));
var SettingsTabValue;
(function (SettingsTabValue) {
    SettingsTabValue["DOMAIN"] = "domain";
    SettingsTabValue["PROJECT"] = "project";
    SettingsTabValue["PREFERENCES"] = "preferences";
    SettingsTabValue["VERSIONS"] = "versions";
    SettingsTabValue["ADVANCED"] = "advanced";
    SettingsTabValue["SITE"] = "site";
})(SettingsTabValue || (exports.SettingsTabValue = SettingsTabValue = {}));
var LayersPanelTabValue;
(function (LayersPanelTabValue) {
    LayersPanelTabValue["PAGES"] = "pages";
    LayersPanelTabValue["LAYERS"] = "layers";
    LayersPanelTabValue["COMPONENTS"] = "components";
    LayersPanelTabValue["IMAGES"] = "images";
    LayersPanelTabValue["WINDOWS"] = "windows";
    LayersPanelTabValue["BRAND"] = "brand";
    LayersPanelTabValue["APPS"] = "apps";
})(LayersPanelTabValue || (exports.LayersPanelTabValue = LayersPanelTabValue = {}));
var BrandTabValue;
(function (BrandTabValue) {
    BrandTabValue["COLORS"] = "colors";
    BrandTabValue["FONTS"] = "fonts";
})(BrandTabValue || (exports.BrandTabValue = BrandTabValue = {}));
//# sourceMappingURL=models.js.map