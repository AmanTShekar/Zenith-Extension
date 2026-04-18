"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEditorPlugins = exports.schema = void 0;
exports.applyStylesToEditor = applyStylesToEditor;
const utility_1 = require("@onlook/utility");
const prosemirror_commands_1 = require("prosemirror-commands");
const prosemirror_history_1 = require("prosemirror-history");
const prosemirror_keymap_1 = require("prosemirror-keymap");
const prosemirror_model_1 = require("prosemirror-model");
const utils_1 = require("../utils");
const use_font_loader_1 = require("@/hooks/use-font-loader");
exports.schema = new prosemirror_model_1.Schema({
    nodes: {
        doc: { content: 'paragraph+' },
        paragraph: {
            content: '(text | hard_break)*',
            toDOM: () => ['p', { style: 'margin: 0; padding: 0;' }, 0],
        },
        text: { inline: true },
        hard_break: {
            inline: true,
            group: 'inline',
            selectable: false,
            toDOM: () => ['br'],
        },
    },
    marks: {
        style: {
            attrs: { style: { default: null } },
            parseDOM: [
                {
                    tag: 'span[style]',
                    getAttrs: (node) => ({
                        style: node.getAttribute('style'),
                    }),
                },
            ],
            toDOM: (mark) => ['span', { style: mark.attrs.style }, 0],
        },
    },
});
function applyStylesToEditor(editorView, styles) {
    const { state, dispatch } = editorView;
    const styleMark = state.schema.marks?.style;
    if (!styleMark) {
        console.error('No style mark found');
        return;
    }
    const tr = state.tr.addMark(0, state.doc.content.size, styleMark.create({ style: styles }));
    const fontSize = (0, utils_1.adaptValueToCanvas)(parseFloat(styles.fontSize ?? ''));
    const lineHeight = (0, utils_1.adaptValueToCanvas)(parseFloat(styles.lineHeight ?? ''));
    const fontFamily = (0, use_font_loader_1.ensureFontLoaded)(styles.fontFamily ?? '');
    Object.assign(editorView.dom.style, {
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeight}px`,
        fontWeight: styles.fontWeight,
        fontStyle: styles.fontStyle,
        color: (0, utility_1.isColorEmpty)(styles.color ?? '') ? 'inherit' : styles.color,
        textAlign: styles.textAlign,
        textDecoration: styles.textDecoration,
        letterSpacing: styles.letterSpacing,
        wordSpacing: styles.wordSpacing,
        alignItems: styles.alignItems,
        justifyContent: styles.justifyContent,
        layout: styles.layout,
        display: styles.display,
        backgroundColor: styles.backgroundColor,
        wordBreak: 'break-word',
        overflow: 'visible',
        height: '100%',
        fontFamily,
        padding: styles.padding,
    });
    dispatch(tr);
}
const createLineBreakHandler = () => (state, dispatch) => {
    if (dispatch) {
        const hardBreakNode = state.schema.nodes.hard_break;
        if (hardBreakNode) {
            dispatch(state.tr.replaceSelectionWith(hardBreakNode.create()));
        }
    }
    return true;
};
const createEnterHandler = (onExit) => (state) => {
    onExit();
    return true;
};
const createEditorPlugins = (onEscape, onEnter) => [
    (0, prosemirror_history_1.history)(),
    (0, prosemirror_keymap_1.keymap)({
        'Mod-z': prosemirror_history_1.undo,
        'Mod-shift-z': prosemirror_history_1.redo,
        Escape: () => {
            onEscape?.();
            return !!onEscape;
        },
        Enter: onEnter ? createEnterHandler(onEnter) : () => false,
        'Shift-Enter': createLineBreakHandler(),
    }),
    (0, prosemirror_keymap_1.keymap)(prosemirror_commands_1.baseKeymap),
];
exports.createEditorPlugins = createEditorPlugins;
//# sourceMappingURL=index.js.map