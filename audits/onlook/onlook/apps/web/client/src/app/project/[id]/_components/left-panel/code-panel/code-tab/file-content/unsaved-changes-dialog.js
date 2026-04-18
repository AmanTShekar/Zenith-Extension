"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsavedChangesDialog = UnsavedChangesDialog;
const button_1 = require("@onlook/ui/button");
function UnsavedChangesDialog({ onSave, onDiscard, onCancel, fileCount = 1 }) {
    const isMultiple = fileCount > 1;
    return (<div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 bg-white dark:bg-zinc-800 border dark:border-zinc-700 shadow-lg rounded-lg p-4 w-[320px]">
            <div className="text-sm text-gray-800 dark:text-gray-100 mb-4">
                You have unsaved changes. Are you sure you want to close {isMultiple ? `${fileCount} files` : 'this file'}?
            </div>
            <div className="flex justify-end gap-1">
                <button_1.Button onClick={onDiscard} variant="ghost" className="text-red hover:text-red">
                    Discard
                </button_1.Button>
                <button_1.Button onClick={onSave} variant="ghost" className="text-sm text-blue-500 hover:text-blue-500">
                    Save
                </button_1.Button>
                <button_1.Button variant="ghost" onClick={onCancel}>
                    Cancel
                </button_1.Button>
            </div>
        </div>);
}
//# sourceMappingURL=unsaved-changes-dialog.js.map