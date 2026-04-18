"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteKey = void 0;
const Context_1 = require("@/components/Context");
const alert_dialog_1 = require("@onlook/ui/alert-dialog");
const button_1 = require("@onlook/ui/button");
const checkbox_1 = require("@onlook/ui/checkbox");
const react_1 = require("react");
const react_hotkeys_hook_1 = require("react-hotkeys-hook");
const hotkeys_1 = require("/common/hotkeys");
const DeleteKey = () => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const userManager = (0, Context_1.useUserManager)();
    const [showDeleteDialog, setShowDeleteDialog] = (0, react_1.useState)(false);
    const [shouldWarnDelete, setShouldWarnDelete] = (0, react_1.useState)(userManager.settings.settings?.editor?.shouldWarnDelete ?? true);
    (0, react_hotkeys_hook_1.useHotkeys)([hotkeys_1.Hotkey.BACKSPACE.command, hotkeys_1.Hotkey.DELETE.command], () => {
        if (editorEngine.isWindowSelected) {
            editorEngine.deleteWindow();
        }
        else {
            if (shouldWarnDelete) {
                setShowDeleteDialog(true);
            }
            else {
                editorEngine.elements.delete();
            }
        }
    });
    function disableWarning(disable) {
        userManager.settings.updateEditor({ shouldWarnDelete: disable });
        setShouldWarnDelete(disable);
    }
    const handleDelete = () => {
        editorEngine.elements.delete();
        setShowDeleteDialog(false);
    };
    return (<alert_dialog_1.AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <alert_dialog_1.AlertDialogContent>
                <alert_dialog_1.AlertDialogHeader>
                    <alert_dialog_1.AlertDialogTitle>{'Delete this element?'}</alert_dialog_1.AlertDialogTitle>
                    <alert_dialog_1.AlertDialogDescription>
                        {'This will delete the element in code. You can undo this action.'}
                    </alert_dialog_1.AlertDialogDescription>
                </alert_dialog_1.AlertDialogHeader>
                <div className="flex items-center space-x-2">
                    <checkbox_1.Checkbox id="disable-warning" onCheckedChange={(checked) => disableWarning(checked !== true)}/>
                    <label htmlFor="disable-warning" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {"Don't show this warning again"}
                    </label>
                </div>
                <alert_dialog_1.AlertDialogFooter>
                    <button_1.Button variant={'ghost'} onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                    </button_1.Button>
                    <button_1.Button variant={'destructive'} className="rounded-md text-sm" onClick={handleDelete}>
                        Delete
                    </button_1.Button>
                </alert_dialog_1.AlertDialogFooter>
            </alert_dialog_1.AlertDialogContent>
        </alert_dialog_1.AlertDialog>);
};
exports.DeleteKey = DeleteKey;
//# sourceMappingURL=Delete.js.map