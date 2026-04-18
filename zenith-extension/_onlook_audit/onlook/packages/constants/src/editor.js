"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COLOR_NAME = exports.DefaultSettings = exports.EditorAttributes = exports.MAX_NAME_LENGTH = exports.HOSTING_DOMAIN = exports.APP_SCHEMA = exports.APP_NAME = void 0;
const frame_1 = require("./frame");
exports.APP_NAME = 'Onlook';
exports.APP_SCHEMA = 'onlook';
exports.HOSTING_DOMAIN = 'onlook.live';
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
    EditorAttributes["STYLESHEET_ID"] = "onlook-default-stylesheet";
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
})(EditorAttributes || (exports.EditorAttributes = EditorAttributes = {}));
exports.DefaultSettings = {
    SCALE: 0.7,
    PAN_POSITION: { x: 175, y: 100 },
    URL: 'http://localhost:3000/',
    ASPECT_RATIO_LOCKED: false,
    DEVICE: 'Custom:Custom',
    THEME: frame_1.Theme.System,
    ORIENTATION: frame_1.Orientation.Portrait,
    MIN_DIMENSIONS: { width: '280px', height: '360px' },
    COMMANDS: {
        run: 'bun run dev',
        build: 'bun run build',
        install: 'bun install',
    },
    IMAGE_FOLDER: 'public',
    IMAGE_DIMENSION: { width: '100px', height: '100px' },
    FONT_FOLDER: 'fonts',
    FONT_CONFIG: 'app/fonts.ts',
    TAILWIND_CONFIG: 'tailwind.config.ts',
    CHAT_SETTINGS: {
        showSuggestions: true,
        autoApplyCode: true,
        expandCodeBlocks: false,
        showMiniChat: false,
        maxImages: 5,
    },
    EDITOR_SETTINGS: {
        shouldWarnDelete: false,
        enableBunReplace: true,
        buildFlags: '--no-lint',
    },
};
exports.DEFAULT_COLOR_NAME = 'DEFAULT';
//# sourceMappingURL=editor.js.map