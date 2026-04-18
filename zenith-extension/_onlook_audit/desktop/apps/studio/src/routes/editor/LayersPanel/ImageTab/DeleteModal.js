"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DeleteImageModal;
const Context_1 = require("@/components/Context");
const alert_dialog_1 = require("@onlook/ui/alert-dialog");
const button_1 = require("@onlook/ui/button");
const models_1 = require("@/lib/models");
function DeleteImageModal({ onDelete, isOpen, toggleOpen, }) {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const handleDelete = () => {
        onDelete();
        toggleOpen();
    };
    const handleClose = () => {
        // Reset pointer-events and editor mode when modal is closed
        for (const webview of editorEngine.webviews.webviews.values()) {
            webview.webview.style.pointerEvents = 'auto';
        }
        editorEngine.mode = models_1.EditorMode.DESIGN;
        editorEngine.overlay.clear();
        toggleOpen();
    };
    return (<alert_dialog_1.AlertDialog open={isOpen} onOpenChange={handleClose}>
            <alert_dialog_1.AlertDialogContent>
                <alert_dialog_1.AlertDialogHeader>
                    <alert_dialog_1.AlertDialogTitle>{'Delete this image?'}</alert_dialog_1.AlertDialogTitle>
                    <alert_dialog_1.AlertDialogDescription>
                        {"This will delete the image from the project. You can't undo this action."}
                    </alert_dialog_1.AlertDialogDescription>
                </alert_dialog_1.AlertDialogHeader>
                <alert_dialog_1.AlertDialogFooter>
                    <button_1.Button variant={'ghost'} onClick={handleClose}>
                        Cancel
                    </button_1.Button>
                    <button_1.Button variant={'destructive'} className="rounded-md text-sm" onClick={handleDelete}>
                        Delete
                    </button_1.Button>
                </alert_dialog_1.AlertDialogFooter>
            </alert_dialog_1.AlertDialogContent>
        </alert_dialog_1.AlertDialog>);
}
//# sourceMappingURL=DeleteModal.js.map