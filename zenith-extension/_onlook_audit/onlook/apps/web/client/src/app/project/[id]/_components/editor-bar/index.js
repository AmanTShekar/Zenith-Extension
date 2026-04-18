"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorBar = void 0;
const editor_1 = require("@/components/store/editor");
const models_1 = require("@onlook/models");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const div_selected_1 = require("./div-selected");
const frame_selected_1 = require("./frame-selected");
const use_dropdown_manager_1 = require("./hooks/use-dropdown-manager");
const text_selected_1 = require("./text-selected");
var TAG_CATEGORIES;
(function (TAG_CATEGORIES) {
    TAG_CATEGORIES["TEXT"] = "text";
    TAG_CATEGORIES["DIV"] = "div";
    TAG_CATEGORIES["IMG"] = "img";
    TAG_CATEGORIES["VIDEO"] = "video";
})(TAG_CATEGORIES || (TAG_CATEGORIES = {}));
const TAG_TYPES = {
    [TAG_CATEGORIES.TEXT]: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'span',
        'a',
        'strong',
        'b',
        'em',
        'i',
        'mark',
        'code',
        'small',
        'blockquote',
        'pre',
        'time',
        'sub',
        'sup',
        'del',
        'ins',
        'u',
        'abbr',
        'cite',
        'q',
    ],
    [TAG_CATEGORIES.DIV]: ['div'],
    // TODO: Add img and video tag support
    [TAG_CATEGORIES.IMG]: [],
    [TAG_CATEGORIES.VIDEO]: [],
};
const getSelectedTag = (selected) => {
    if (selected.length === 0) {
        return TAG_CATEGORIES.DIV;
    }
    const tag = selected[0]?.tagName;
    if (!tag) {
        return TAG_CATEGORIES.DIV;
    }
    for (const [key, value] of Object.entries(TAG_TYPES)) {
        if (value.includes(tag.toLowerCase())) {
            return key;
        }
    }
    return TAG_CATEGORIES.DIV;
};
exports.EditorBar = (0, mobx_react_lite_1.observer)(({ availableWidth }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const selectedElement = editorEngine.elements.selected[0];
    const selectedTag = selectedElement ? getSelectedTag(editorEngine.elements.selected) : null;
    const selectedFrame = editorEngine.frames.selected?.[0];
    const windowSelected = selectedFrame && !selectedElement;
    const getTopBar = () => {
        if (windowSelected) {
            return <frame_selected_1.FrameSelected availableWidth={availableWidth}/>;
        }
        if (selectedTag === TAG_CATEGORIES.TEXT) {
            return <text_selected_1.TextSelected availableWidth={availableWidth}/>;
        }
        return <div_selected_1.DivSelected availableWidth={availableWidth}/>;
    };
    if (!selectedElement && !selectedFrame) {
        return null;
    }
    return (<use_dropdown_manager_1.DropdownManagerProvider>
            <react_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={(0, utils_1.cn)('flex flex-col border-[0.5px] border-border p-1 px-1 bg-background rounded-xl backdrop-blur drop-shadow-xl z-50 overflow-hidden', editorEngine.state.editorMode !== models_1.EditorMode.DESIGN && !windowSelected && 'hidden')} transition={{
            type: 'spring',
            bounce: 0.1,
            duration: 0.4,
            stiffness: 200,
            damping: 25,
        }}>
                {getTopBar()}
            </react_1.motion.div>
        </use_dropdown_manager_1.DropdownManagerProvider>);
});
//# sourceMappingURL=index.js.map