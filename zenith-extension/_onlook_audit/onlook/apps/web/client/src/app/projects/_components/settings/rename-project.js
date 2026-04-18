"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameProject = RenameProject;
const keys_1 = require("@/i18n/keys");
const react_1 = require("@/trpc/react");
const dialog_1 = require("@onlook/ui/dialog");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const label_1 = require("@onlook/ui/label");
const utils_1 = require("@onlook/ui/utils");
const next_intl_1 = require("next-intl");
const react_2 = require("react");
function RenameProject({ project, refetch }) {
    const t = (0, next_intl_1.useTranslations)();
    const utils = react_1.api.useUtils();
    const { mutateAsync: updateProject } = react_1.api.project.update.useMutation();
    const [showRenameDialog, setShowRenameDialog] = (0, react_2.useState)(false);
    const [projectName, setProjectName] = (0, react_2.useState)(project.name);
    const isProjectNameEmpty = (0, react_2.useMemo)(() => projectName.length === 0, [projectName]);
    (0, react_2.useEffect)(() => {
        setProjectName(project.name);
    }, [project.name]);
    const handleRenameProject = async () => {
        await updateProject({
            id: project.id,
            name: projectName,
            updatedAt: new Date()
        });
        // Invalidate queries to refresh UI
        await Promise.all([
            utils.project.list.invalidate(),
            utils.project.get.invalidate({ projectId: project.id })
        ]);
        // Optimistically update list ordering and title immediately
        window.dispatchEvent(new CustomEvent('onlook_project_updated', {
            detail: {
                id: project.id,
                name: projectName,
                metadata: {
                    updatedAt: new Date().toISOString(),
                    description: project.metadata?.description,
                },
            },
        }));
        window.dispatchEvent(new CustomEvent('onlook_project_modified', { detail: { id: project.id } }));
        setShowRenameDialog(false);
        refetch();
    };
    return (<>
            <dropdown_menu_1.DropdownMenuItem onSelect={(event) => {
            event.preventDefault();
            setShowRenameDialog(true);
        }} className="text-foreground-active hover:!bg-background-onlook hover:!text-foreground-active gap-2">
                <icons_1.Icons.Pencil className="w-4 h-4"/>
                {t(keys_1.transKeys.projects.actions.renameProject)}
            </dropdown_menu_1.DropdownMenuItem>

            <dialog_1.Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
                <dialog_1.DialogContent>
                    <dialog_1.DialogHeader>
                        <dialog_1.DialogTitle>{t(keys_1.transKeys.projects.dialogs.rename.title)}</dialog_1.DialogTitle>
                    </dialog_1.DialogHeader>
                    <div className="flex flex-col w-full gap-2">
                        <label_1.Label htmlFor="text">{t(keys_1.transKeys.projects.dialogs.rename.label)}</label_1.Label>
                        <input_1.Input minLength={0} type="text" value={projectName || ''} onInput={(e) => setProjectName(e.currentTarget.value)}/>
                        <p className={(0, utils_1.cn)('text-xs text-red-500 transition-opacity', isProjectNameEmpty ? 'opacity-100' : 'opacity-0')}>
                            {t(keys_1.transKeys.projects.dialogs.rename.error)}
                        </p>
                    </div>
                    <dialog_1.DialogFooter>
                        <button_1.Button variant={'ghost'} onClick={() => setShowRenameDialog(false)}>
                            {t(keys_1.transKeys.projects.actions.cancel)}
                        </button_1.Button>
                        <button_1.Button disabled={isProjectNameEmpty} className="rounded-md text-sm" onClick={handleRenameProject}>
                            {t(keys_1.transKeys.projects.actions.rename)}
                        </button_1.Button>
                    </dialog_1.DialogFooter>
                </dialog_1.DialogContent>
            </dialog_1.Dialog>
        </>);
}
//# sourceMappingURL=rename-project.js.map