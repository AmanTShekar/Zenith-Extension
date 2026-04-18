"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextEditor = void 0;
const prosemirror_1 = require("@/lib/editor/engine/overlay/prosemirror/");
const constants_1 = require("@onlook/models/constants");
const tokens_1 = require("@onlook/ui/tokens");
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_view_1 = require("prosemirror-view");
const react_1 = __importStar(require("react"));
const TextEditor = ({ rect, content, styles, onChange, onStop, isComponent, isDisabled = false, }) => {
    const editorRef = (0, react_1.useRef)(null);
    const editorViewRef = (0, react_1.useRef)(null);
    // Initialize ProseMirror
    (0, react_1.useEffect)(() => {
        if (!editorRef.current) {
            return;
        }
        const state = prosemirror_state_1.EditorState.create({
            schema: prosemirror_1.schema,
            plugins: (0, prosemirror_1.createEditorPlugins)(onStop, onStop),
        });
        const view = new prosemirror_view_1.EditorView(editorRef.current, {
            state,
            editable: () => !isDisabled,
            dispatchTransaction: (transaction) => {
                const newState = view.state.apply(transaction);
                view.updateState(newState);
                if (onChange && transaction.docChanged) {
                    onChange(view.state.doc.textContent);
                }
            },
            attributes: {
                style: 'height: 100%; padding: 0; margin: 0; box-sizing: border-box; overflow: hidden;',
            },
        });
        editorViewRef.current = view;
        // Set initial content
        const paragraph = prosemirror_1.schema.node('paragraph', null, content ? [prosemirror_1.schema.text(content)] : []);
        const newDoc = prosemirror_1.schema.node('doc', null, [paragraph]);
        const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, newDoc.content);
        view.dispatch(tr);
        // Apply styles
        (0, prosemirror_1.applyStylesToEditor)(view, styles);
        // Focus the editor if not disabled
        if (!isDisabled) {
            view.focus();
        }
        return () => {
            view.destroy();
        };
    }, [content, styles, isComponent, isDisabled]);
    // Handle blur events
    (0, react_1.useEffect)(() => {
        const handleBlur = (event) => {
            const editorElement = editorRef.current;
            if (editorElement && !editorElement.contains(event.relatedTarget)) {
                onStop?.();
            }
        };
        const editorElement = editorRef.current;
        if (editorElement) {
            editorElement.addEventListener('blur', handleBlur, true);
            return () => {
                editorElement.removeEventListener('blur', handleBlur, true);
            };
        }
    }, [onStop]);
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
};
exports.TextEditor = TextEditor;
//# sourceMappingURL=TextEditor.js.map