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
exports.schema = new prosemirror_model_1.Schema({
    nodes: {
        doc: { content: 'paragraph+' },
        paragraph: {
            content: 'text*',
            toDOM: () => ['p', { style: 'margin: 0; padding: 0;' }, 0],
        },
        text: { inline: true },
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
    const { tr } = state;
    tr.addMark(0, state.doc.content.size, state.schema.marks.style.create({ style: styles }));
    // Apply container styles
    const fontSize = (0, utils_1.adaptValueToCanvas)(parseFloat(styles.fontSize));
    const lineHeight = (0, utils_1.adaptValueToCanvas)(parseFloat(styles.lineHeight));
    Object.assign(editorView.dom.style, {
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeight}px`,
        fontWeight: styles.fontWeight,
        fontStyle: styles.fontStyle,
        color: (0, utility_1.isColorEmpty)(styles.color) ? 'inherit' : styles.color,
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
    });
    editorView.dom.style.height = '100%';
    dispatch(tr);
}
// Export common plugins configuration
const createEditorPlugins = (onEscape, onEnter) => [
    (0, prosemirror_history_1.history)(),
    (0, prosemirror_keymap_1.keymap)({
        'Mod-z': prosemirror_history_1.undo,
        'Mod-shift-z': prosemirror_history_1.redo,
        Escape: () => {
            if (onEscape) {
                onEscape();
                return true;
            }
            return false;
        },
        Enter: () => {
            if (onEnter) {
                onEnter();
                return true;
            }
            return false;
        },
    }),
    (0, prosemirror_keymap_1.keymap)(prosemirror_commands_1.baseKeymap),
];
exports.createEditorPlugins = createEditorPlugins;
//# sourceMappingURL=index.js.map