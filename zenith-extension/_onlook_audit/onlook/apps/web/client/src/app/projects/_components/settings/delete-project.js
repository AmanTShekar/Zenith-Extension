"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteProject = DeleteProject;
const keys_1 = require("@/i18n/keys");
const react_1 = require("@/trpc/react");
const alert_dialog_1 = require("@onlook/ui/alert-dialog");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const next_intl_1 = require("next-intl");
const react_2 = require("react");
function DeleteProject({ project, refetch }) {
    const t = (0, next_intl_1.useTranslations)();
    const { mutateAsync: deleteProject } = react_1.api.project.delete.useMutation();
    const [showDeleteDialog, setShowDeleteDialog] = (0, react_2.useState)(false);
    const handleDeleteProject = async () => {
        await deleteProject({ id: project.id });
        setShowDeleteDialog(false);
        refetch();
    };
    return (<>
            <dropdown_menu_1.DropdownMenuItem onSelect={(event) => {
            event.preventDefault();
            setShowDeleteDialog(true);
        }} className="gap-2 text-red-400 hover:!bg-red-200/80 hover:!text-red-700 dark:text-red-200 dark:hover:!bg-red-800 dark:hover:!text-red-100">
                <icons_1.Icons.Trash className="w-4 h-4"/>
                {t(keys_1.transKeys.projects.actions.deleteProject)}
            </dropdown_menu_1.DropdownMenuItem>
            <alert_dialog_1.AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <alert_dialog_1.AlertDialogContent>
                    <alert_dialog_1.AlertDialogHeader>
                        <alert_dialog_1.AlertDialogTitle>{t(keys_1.transKeys.projects.dialogs.delete.title)}</alert_dialog_1.AlertDialogTitle>
                        <alert_dialog_1.AlertDialogDescription>
                            {t(keys_1.transKeys.projects.dialogs.delete.description)}
                        </alert_dialog_1.AlertDialogDescription>
                    </alert_dialog_1.AlertDialogHeader>
                    <alert_dialog_1.AlertDialogFooter>
                        <button_1.Button variant={'ghost'} onClick={() => setShowDeleteDialog(false)}>
                            {t(keys_1.transKeys.projects.actions.cancel)}
                        </button_1.Button>
                        <button_1.Button variant={'destructive'} className="rounded-md text-sm" onClick={(e) => {
            e.stopPropagation();
            handleDeleteProject();
        }}>
                            {t(keys_1.transKeys.projects.actions.delete)}
                        </button_1.Button>
                    </alert_dialog_1.AlertDialogFooter>
                </alert_dialog_1.AlertDialogContent>
            </alert_dialog_1.AlertDialog>
        </>);
}
//# sourceMappingURL=delete-project.js.map