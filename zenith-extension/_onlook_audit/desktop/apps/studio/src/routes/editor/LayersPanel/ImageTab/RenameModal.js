"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alert_dialog_1 = require("@onlook/ui/alert-dialog");
const button_1 = require("@onlook/ui/button");
const mobx_react_lite_1 = require("mobx-react-lite");
const RenameImageModal = (0, mobx_react_lite_1.observer)(({ isOpen, toggleOpen, onRename, newName, }) => {
    return (<alert_dialog_1.AlertDialog open={isOpen} onOpenChange={toggleOpen}>
                <alert_dialog_1.AlertDialogContent>
                    <alert_dialog_1.AlertDialogHeader>
                        <alert_dialog_1.AlertDialogTitle>Rename Image</alert_dialog_1.AlertDialogTitle>
                        <alert_dialog_1.AlertDialogDescription>
                            {`Rename image to "${newName}"`}
                        </alert_dialog_1.AlertDialogDescription>
                    </alert_dialog_1.AlertDialogHeader>
                    <alert_dialog_1.AlertDialogFooter>
                        <button_1.Button variant={'ghost'} onClick={toggleOpen}>
                            Cancel
                        </button_1.Button>
                        <button_1.Button variant={'default'} onClick={() => onRename(newName)}>
                            Rename
                        </button_1.Button>
                    </alert_dialog_1.AlertDialogFooter>
                </alert_dialog_1.AlertDialogContent>
            </alert_dialog_1.AlertDialog>);
});
exports.default = RenameImageModal;
//# sourceMappingURL=RenameModal.js.map