"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COLOR_NAME = exports.DefaultSettings = exports.Theme = exports.Orientation = exports.Links = exports.EditorAttributes = exports.MAX_NAME_LENGTH = exports.CUSTOM_OUTPUT_DIR = exports.HOSTING_DOMAIN = exports.APP_SCHEMA = exports.APP_NAME = void 0;
const index_ts_1 = require("../ide/index.ts");
exports.APP_NAME = 'Onlook';
exports.APP_SCHEMA = 'onlook';
exports.HOSTING_DOMAIN = 'onlook.live';
exports.CUSTOM_OUTPUT_DIR = '.next-prod';
exports.MAX_NAME_LENGTH = 50;
var EditorAttributes;
(function (EditorAttributes) {
    // DOM attributes
    EditorAttributes["ONLOOK_TOOLBAR"] = "onlook-toolbar";
    EditorAttributes["ONLOOK_RECT_ID"] = "onlook-rect";
    EditorAttributes["ONLOOK_STYLESHEET_ID"] = "onlook-stylesheet";
    EditorAttributes["ONLOOK_STUB_ID"] = "onlook-drag-stub";
    EditorAttributes["ONLOOK_MOVE_KEY_PREFIX"] = "olk-";
    EditorAttributes["OVERLAY_CONTAINER_ID"] = "overlay-container";
    EditorAttributes["CANVAS_CONTAINER_ID"] = "canvas-container";
    // IDs
    EditorAttributes["DATA_ONLOOK_ID"] = "data-oid";
    EditorAttributes["DATA_ONLOOK_INSTANCE_ID"] = "data-oiid";
    EditorAttributes["DATA_ONLOOK_DOM_ID"] = "data-odid";
    EditorAttributes["DATA_ONLOOK_COMPONENT_NAME"] = "data-ocname";
    // Data attributes
    EditorAttributes["DATA_ONLOOK_IGNORE"] = "data-onlook-ignore";
    EditorAttributes["DATA_ONLOOK_INSERTED"] = "data-onlook-inserted";
    EditorAttributes["DATA_ONLOOK_DRAG_SAVED_STYLE"] = "data-onlook-drag-saved-style";
    EditorAttributes["DATA_ONLOOK_DRAGGING"] = "data-onlook-dragging";
    EditorAttributes["DATA_ONLOOK_DRAG_DIRECTION"] = "data-onlook-drag-direction";
    EditorAttributes["DATA_ONLOOK_DRAG_START_POSITION"] = "data-onlook-drag-start-position";
    EditorAttributes["DATA_ONLOOK_NEW_INDEX"] = "data-onlook-new-index";
    EditorAttributes["DATA_ONLOOK_EDITING_TEXT"] = "data-onlook-editing-text";
    EditorAttributes["DATA_ONLOOK_DYNAMIC_TYPE"] = "data-onlook-dynamic-type";
    EditorAttributes["DATA_ONLOOK_CORE_ELEMENT_TYPE"] = "data-onlook-core-element-type";
    EditorAttributes["ONLOOK_DEFAULT_STYLESHEET_ID"] = "onlook-default-stylesheet";
})(EditorAttributes || (exports.EditorAttributes = EditorAttributes = {}));
var Links;
(function (Links) {
    Links["DISCORD"] = "https://discord.gg/hERDfFZCsH";
    Links["GITHUB"] = "https://github.com/onlook-dev/desktop";
    Links["USAGE_DOCS"] = "https://github.com/onlook-dev/desktop/wiki/How-to-set-up-my-project%3F";
    Links["WIKI"] = "https://github.com/onlook-dev/desktop/wiki";
    Links["OPEN_ISSUE"] = "https://github.com/onlook-dev/desktop/issues/new/choose";
})(Links || (exports.Links = Links = {}));
var Orientation;
(function (Orientation) {
    Orientation["Portrait"] = "Portrait";
    Orientation["Landscape"] = "Landscape";
})(Orientation || (exports.Orientation = Orientation = {}));
var Theme;
(function (Theme) {
    Theme["Light"] = "light";
    Theme["Dark"] = "dark";
    Theme["System"] = "system";
})(Theme || (exports.Theme = Theme = {}));
exports.DefaultSettings = {
    SCALE: 0.7,
    PAN_POSITION: { x: 175, y: 100 },
    URL: 'http://localhost:3000/',
    FRAME_POSITION: { x: 0, y: 0 },
    FRAME_DIMENSION: { width: 1536, height: 960 },
    ASPECT_RATIO_LOCKED: false,
    DEVICE: 'Custom:Custom',
    THEME: Theme.System,
    ORIENTATION: Orientation.Portrait,
    MIN_DIMENSIONS: { width: '280px', height: '360px' },
    COMMANDS: {
        run: 'npm run dev',
        build: 'npm run build',
        install: 'npm install',
    },
    IMAGE_FOLDER: 'public/images',
    IMAGE_DIMENSION: { width: '100px', height: '100px' },
    FONT_FOLDER: 'public/fonts',
    FONT_CONFIG: 'app/fonts.ts',
    CHAT_SETTINGS: {
        showSuggestions: true,
        autoApplyCode: true,
        expandCodeBlocks: false,
        showMiniChat: true,
    },
    EDITOR_SETTINGS: {
        shouldWarnDelete: true,
        ideType: index_ts_1.DEFAULT_IDE,
        enableBunReplace: true,
        buildFlags: '--no-lint',
    },
};
exports.DEFAULT_COLOR_NAME = 'DEFAULT';
//# sourceMappingURL=editor.js.map