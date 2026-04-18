"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextEditor = void 0;
const editor_1 = require("@/components/store/editor");
const prosemirror_1 = require("@/components/store/editor/overlay/prosemirror");
const constants_1 = require("@onlook/constants");
const tokens_1 = require("@onlook/ui/tokens");
const mobx_react_lite_1 = require("mobx-react-lite");
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_view_1 = require("prosemirror-view");
const react_1 = require("react");
const contentHelpers = {
    // Convert content with newlines to ProseMirror nodes
    createNodesFromContent: (content) => {
        if (!content)
            return [];
        const lines = content.split('\n');
        const nodes = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i] || i === 0) {
                nodes.push(prosemirror_1.schema.text(lines[i] || ''));
            }
            if (i < lines.length - 1) {
                const hardBreakNode = prosemirror_1.schema.nodes.hard_break;
                if (hardBreakNode) {
                    nodes.push(hardBreakNode.create());
                }
            }
        }
        return nodes;
    },
    // Convert ProseMirror document to text with newlines
    extractContentWithNewlines: (view) => {
        let content = '';
        view.state.doc.descendants((node) => {
            if (node.type.name === 'text' && node.text) {
                content += node.text || '';
            }
            else if (node.type.name === 'hard_break') {
                content += '\n';
            }
        });
        return content;
    }
};
exports.TextEditor = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const overlayState = editorEngine.overlay.state;
    const isDisabled = false;
    const editorRef = (0, react_1.useRef)(null);
    const editorViewRef = (0, react_1.useRef)(null);
    const onChangeRef = (0, react_1.useRef)(undefined);
    const onStopRef = (0, react_1.useRef)(undefined);
    if (!overlayState.textEditor) {
        return null;
    }
    const { rect, styles, onChange, onStop, isComponent, content } = overlayState.textEditor;
    // Update callback refs
    onChangeRef.current = onChange;
    onStopRef.current = onStop;
    // Initialize ProseMirror (only when component mounts)
    (0, react_1.useEffect)(() => {
        if (!editorRef.current) {
            return;
        }
        const state = prosemirror_state_1.EditorState.create({
            schema: prosemirror_1.schema,
            plugins: (0, prosemirror_1.createEditorPlugins)(() => onStopRef.current?.(), () => onStopRef.current?.()),
        });
        const view = new prosemirror_view_1.EditorView(editorRef.current, {
            state,
            editable: () => !isDisabled,
            dispatchTransaction: (transaction) => {
                const newState = view.state.apply(transaction);
                view.updateState(newState);
                if (onChangeRef.current && transaction.docChanged) {
                    const textContent = contentHelpers.extractContentWithNewlines(view);
                    onChangeRef.current(textContent);
                }
            },
            attributes: {
                style: 'height: 100%; padding: 0; margin: 0; box-sizing: border-box; overflow: hidden;',
            },
        });
        editorViewRef.current = view;
        // Set initial content with proper line break handling
        const nodes = contentHelpers.createNodesFromContent(content);
        const paragraph = prosemirror_1.schema.node('paragraph', null, nodes);
        const newDoc = prosemirror_1.schema.node('doc', null, [paragraph]);
        const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, newDoc.content);
        view.dispatch(tr);
        // Apply styles
        (0, prosemirror_1.applyStylesToEditor)(view, styles);
        // Focus the editor if not disabled
        if (!isDisabled) {
            view.focus();
        }
        // Attach blur handler directly to ProseMirror's contenteditable
        const handleBlur = (event) => {
            if (onStopRef.current && !editorRef.current?.contains(event.relatedTarget)) {
                onStopRef.current();
            }
        };
        view.dom.addEventListener('blur', handleBlur, true);
        return () => {
            view.dom.removeEventListener('blur', handleBlur, true);
            view.destroy();
        };
    }, []); // Only run on mount
    // Update content when it changes (but preserve cursor position and avoid disrupting ongoing edits)
    (0, react_1.useEffect)(() => {
        const view = editorViewRef.current;
        if (!view)
            return;
        const currentContent = contentHelpers.extractContentWithNewlines(view);
        if (currentContent !== content) {
            // Only update if the editor doesn't have focus (to avoid disrupting user typing)
            // or if the content change is significant (not just from user typing)
            if (!view.hasFocus() || Math.abs(currentContent.length - content.length) > 1) {
                const selection = view.state.selection;
                const nodes = contentHelpers.createNodesFromContent(content);
                const paragraph = prosemirror_1.schema.node('paragraph', null, nodes);
                const newDoc = prosemirror_1.schema.node('doc', null, [paragraph]);
                const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, newDoc.content);
                // Try to preserve cursor position if possible
                const targetPos = Math.min(selection.from, tr.doc.content.size);
                const newSelection = targetPos < tr.doc.content.size
                    ? prosemirror_state_1.Selection.near(tr.doc.resolve(targetPos))
                    : prosemirror_state_1.Selection.atEnd(tr.doc);
                tr.setSelection(newSelection);
                view.dispatch(tr);
            }
        }
    }, [content]);
    // Update styles when they change
    (0, react_1.useEffect)(() => {
        const view = editorViewRef.current;
        if (view) {
            (0, prosemirror_1.applyStylesToEditor)(view, styles);
        }
    }, [styles]);
    // Update editor state when disabled state changes
    (0, react_1.useEffect)(() => {
        const view = editorViewRef.current;
        if (view) {
            view.setProps({ editable: () => !isDisabled });
        }
    }, [isDisabled]);
    return (<div ref={editorRef} style={{
            position: 'absolute',
            width: `${Math.max(rect.width, 10)}px`,
            height: `${Math.max(rect.height, 10)}px`,
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            pointerEvents: isDisabled ? 'none' : 'auto',
            overflow: 'visible',
            transformOrigin: 'top left',
            outline: `2px solid ${isComponent ? tokens_1.colors.purple[500] : tokens_1.colors.red[500]}`,
            outlineOffset: '-1px',
            borderRadius: '1px',
        }} data-onlook-ignore={constants_1.EditorAttributes.DATA_ONLOOK_IGNORE} id={constants_1.EditorAttributes.ONLOOK_RECT_ID}/>);
});
//# sourceMappingURL=text.js.map