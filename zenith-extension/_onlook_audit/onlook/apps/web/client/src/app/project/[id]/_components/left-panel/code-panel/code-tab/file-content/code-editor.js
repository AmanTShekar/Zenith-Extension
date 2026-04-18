"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeEditor = void 0;
const view_1 = require("@codemirror/view");
const utility_1 = require("@onlook/utility");
const react_codemirror_1 = __importDefault(require("@uiw/react-codemirror"));
const react_1 = require("react");
const code_mirror_config_1 = require("./code-mirror-config");
const floating_add_to_chat_button_1 = require("./floating-add-to-chat-button");
const CodeEditor = ({ file, isActive, navigationTarget, editorViewsRef, onSaveFile, onUpdateFileContent, onSelectionChange, onAddSelectionToChat, onFocusChatInput, }) => {
    const [currentSelection, setCurrentSelection] = (0, react_1.useState)(null);
    const [selectionAddedToChat, setSelectionAddedToChat] = (0, react_1.useState)(false);
    const [showButton, setShowButton] = (0, react_1.useState)(false);
    const lastNavigationTargetRef = (0, react_1.useRef)(null);
    const getFileUrl = (file) => {
        const mime = (0, utility_1.getMimeType)(file.path.toLowerCase());
        return (0, utility_1.convertToBase64DataUrl)(file.content, mime);
    };
    const selectionExtension = (0, react_1.useMemo)(() => {
        return [
            view_1.EditorView.updateListener.of((update) => {
                if (update.selectionSet) {
                    const selection = update.state.selection.main;
                    const selectedText = update.state.sliceDoc(selection.from, selection.to);
                    if (selection.from !== selection.to) {
                        const selectionData = {
                            from: selection.from,
                            to: selection.to,
                            text: selectedText
                        };
                        setCurrentSelection(selectionData);
                        setSelectionAddedToChat(false); // Reset the flag for new selection
                        setShowButton(false); // Hide button during selection
                        onSelectionChange?.(selectionData);
                    }
                    else {
                        setCurrentSelection(null);
                        setSelectionAddedToChat(false); // Reset when selection is cleared
                        setShowButton(false); // Hide button when no selection
                        onSelectionChange?.(null);
                    }
                }
            }),
            // Add mousedown listener to hide button when starting selection
            view_1.EditorView.domEventHandlers({
                mousedown: () => {
                    setShowButton(false);
                    return false;
                },
                mouseup: () => {
                    // Show button after mouse release if there's a selection
                    setTimeout(() => {
                        setShowButton(true);
                    }, 0);
                    return false;
                }
            }),
            // Add CMD+L keyboard shortcut
            view_1.keymap.of([
                {
                    key: 'Mod-l',
                    run: (view) => {
                        const selection = view.state.selection.main;
                        if (selection.from !== selection.to) {
                            const selectedText = view.state.sliceDoc(selection.from, selection.to);
                            const selectionData = {
                                from: selection.from,
                                to: selection.to,
                                text: selectedText
                            };
                            onAddSelectionToChat?.(selectionData);
                            setSelectionAddedToChat(true); // Mark as added to chat
                            onFocusChatInput?.(); // Focus chat input
                            return true;
                        }
                        return false;
                    }
                }
            ])
        ];
    }, [onSelectionChange, onAddSelectionToChat, onFocusChatInput]);
    const onCreateEditor = (editor) => {
        editorViewsRef.current?.set(file.path, editor);
        if (navigationTarget && isActive) {
            // Delay navigation to ensure document is fully loaded
            setTimeout(() => {
                handleNavigation(editor, navigationTarget);
            }, 100);
        }
    };
    (0, react_1.useEffect)(() => {
        // Reset last navigation when target is cleared or file changes
        if (!navigationTarget) {
            lastNavigationTargetRef.current = null;
            return;
        }
        if (!isActive || file.type !== 'text')
            return;
        const editor = editorViewsRef.current?.get(file.path);
        if (!editor)
            return;
        // Only navigate if this is a new navigation target (not just a file save)
        const isSameTarget = lastNavigationTargetRef.current &&
            lastNavigationTargetRef.current.filePath === navigationTarget.filePath &&
            lastNavigationTargetRef.current.range.start.line === navigationTarget.range.start.line &&
            lastNavigationTargetRef.current.range.start.column === navigationTarget.range.start.column;
        if (!isSameTarget) {
            lastNavigationTargetRef.current = navigationTarget;
            handleNavigation(editor, navigationTarget);
        }
    }, [navigationTarget, isActive, file.type, file.path, editorViewsRef.current]);
    const handleNavigation = (editor, target) => {
        const { range } = target;
        try {
            (0, code_mirror_config_1.scrollToLineColumn)(editor, range.start.line, range.start.column);
            editor.dispatch({
                effects: (0, code_mirror_config_1.highlightElementRange)(range.start.line, range.start.column, range.end.line, range.end.column)
            });
        }
        catch (error) {
            console.error('[CodeEditor] Navigation error:', error);
        }
    };
    const handleAddToChat = (selection) => {
        onAddSelectionToChat?.(selection);
        setSelectionAddedToChat(true); // Mark as added to chat
        onFocusChatInput?.(); // Focus chat input
    };
    return (<div className="h-full relative" style={{
            display: isActive ? 'block' : 'none',
        }}>
            {file.type === 'binary' && (<>
                    {(0, utility_1.isVideoFile)(file.path) ? (<video src={getFileUrl(file)} controls className="w-full h-full object-contain p-5">
                            Your browser does not support the video tag.
                        </video>) : (<img src={getFileUrl(file)} alt={file.path} className="w-full h-full object-contain p-5"/>)}
                </>)}
            {file.type === 'text' && typeof file.content === 'string' && (<>
                    <react_codemirror_1.default key={file.path} value={file.content} height="100%" theme="dark" extensions={[
                ...(0, code_mirror_config_1.getBasicSetup)(onSaveFile),
                ...(0, code_mirror_config_1.getExtensions)(file.path.split('.').pop() || ''),
                ...selectionExtension,
            ]} onChange={(value) => {
                onUpdateFileContent(file.path, value);
            }} className="h-full overflow-hidden" onCreateEditor={onCreateEditor}/>
                    {currentSelection && showButton && onAddSelectionToChat && editorViewsRef.current?.get(file.path) && !selectionAddedToChat && (<floating_add_to_chat_button_1.FloatingAddToChatButton editor={editorViewsRef.current.get(file.path)} selection={currentSelection} onAddToChat={() => handleAddToChat(currentSelection)}/>)}
                </>)}
        </div>);
};
exports.CodeEditor = CodeEditor;
//# sourceMappingURL=code-editor.js.map