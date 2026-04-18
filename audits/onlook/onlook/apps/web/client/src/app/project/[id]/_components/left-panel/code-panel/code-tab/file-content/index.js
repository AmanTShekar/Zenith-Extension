"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeEditorArea = void 0;
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const utils_1 = require("../shared/utils");
const code_editor_1 = require("./code-editor");
const unsaved_changes_dialog_1 = require("./unsaved-changes-dialog");
const CodeEditorArea = ({ openedFiles, activeFile, showUnsavedDialog, navigationTarget, editorViewsRef, onSaveFile, onSaveAndCloseFiles, onUpdateFileContent, onDiscardChanges, onCancelUnsaved, fileCountToClose, onSelectionChange, onAddSelectionToChat, onFocusChatInput, }) => {
    const [activeFileIsDirty, setActiveFileIsDirty] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Guard setActiveFileIsDirty being called after 
        // the component is unmounted because isDirty is async
        let isMounted = true;
        async function checkDirty() {
            if (!activeFile) {
                setActiveFileIsDirty(false);
                return;
            }
            const dirty = await (0, utils_1.isDirty)(activeFile);
            if (isMounted) {
                setActiveFileIsDirty(dirty);
            }
        }
        void checkDirty();
        return () => {
            isMounted = false;
        };
    }, [activeFile]);
    return (<div className="flex-1 relative overflow-hidden">
            <div className="h-full">
                {openedFiles.length === 0 || !activeFile ? (<div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-center text-muted-foreground text-base">
                            Open a file or select an element on the page.
                        </div>
                    </div>) : (
        // Codemirror keeps track of editor history
        // having one for each opened file will make a better experience despite the overhead
        openedFiles.map((file) => (<code_editor_1.CodeEditor key={file.path} file={file} isActive={(0, utility_1.pathsEqual)(activeFile?.path, file.path)} navigationTarget={(0, utility_1.pathsEqual)(navigationTarget?.filePath, file.path) ? navigationTarget : null} editorViewsRef={editorViewsRef} onSaveFile={onSaveFile} onUpdateFileContent={onUpdateFileContent} onSelectionChange={(0, utility_1.pathsEqual)(activeFile?.path, file.path) ? onSelectionChange : undefined} onAddSelectionToChat={(0, utility_1.pathsEqual)(activeFile?.path, file.path) ? onAddSelectionToChat : undefined} onFocusChatInput={(0, utility_1.pathsEqual)(activeFile?.path, file.path) ? onFocusChatInput : undefined}/>)))}
            </div>
            {activeFileIsDirty && showUnsavedDialog && (<unsaved_changes_dialog_1.UnsavedChangesDialog onSave={onSaveAndCloseFiles} onDiscard={onDiscardChanges} onCancel={() => { onCancelUnsaved(); }} fileCount={fileCountToClose}/>)}
        </div>);
};
exports.CodeEditorArea = CodeEditorArea;
//# sourceMappingURL=index.js.map