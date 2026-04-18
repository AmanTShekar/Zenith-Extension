"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProjectSettingsButton;
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/utils");
const helpers_1 = require("@/routes/projects/helpers");
const constants_1 = require("@onlook/models/constants");
const alert_dialog_1 = require("@onlook/ui/alert-dialog");
const button_1 = require("@onlook/ui/button");
const checkbox_1 = require("@onlook/ui/checkbox");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const label_1 = require("@onlook/ui/label");
const utils_2 = require("@onlook/ui/utils");
const react_i18next_1 = require("react-i18next");
const react_1 = require("react");
function ProjectSettingsButton({ project }) {
    const { t } = (0, react_i18next_1.useTranslation)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const [showDeleteDialog, setShowDeleteDialog] = (0, react_1.useState)(false);
    const [deleteProjectFolder, setDeleteProjectFolder] = (0, react_1.useState)(false);
    const [showRenameDialog, setShowRenameDialog] = (0, react_1.useState)(false);
    const [projectName, setProjectName] = (0, react_1.useState)(project.name);
    const isProjectNameEmpty = (0, react_1.useMemo)(() => projectName.length === 0, [projectName]);
    const [isDirectoryHovered, setIsDirectoryHovered] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setProjectName(project.name);
    }, [project.name]);
    const handleDeleteProject = () => {
        projectsManager.deleteProject(project, deleteProjectFolder);
        setShowDeleteDialog(false);
    };
    const handleRenameProject = () => {
        projectsManager.updateProject({ ...project, name: projectName });
        setShowRenameDialog(false);
    };
    const handleOpenProjectFolder = () => {
        if (project.folderPath) {
            (0, utils_1.invokeMainChannel)(constants_1.MainChannels.OPEN_IN_EXPLORER, project.folderPath);
        }
    };
    return (<>
            <dropdown_menu_1.DropdownMenu>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <button_1.Button size="default" variant="ghost" className="gap-2 w-full lg:w-auto">
                        <icons_1.Icons.DotsVertical />
                        <p>{t('projects.actions.projectSettings')}</p>
                    </button_1.Button>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent>
                    <dropdown_menu_1.DropdownMenuItem onSelect={handleOpenProjectFolder} onMouseEnter={() => setIsDirectoryHovered(true)} onMouseLeave={() => setIsDirectoryHovered(false)} className="text-foreground-active hover:!bg-background-onlook hover:!text-foreground-active gap-2">
                        {isDirectoryHovered ? (<icons_1.Icons.DirectoryOpen className="w-4 h-4"/>) : (<icons_1.Icons.Directory className="w-4 h-4"/>)}
                        {t('projects.actions.showInExplorer')}
                    </dropdown_menu_1.DropdownMenuItem>
                    <dropdown_menu_1.DropdownMenuItem onSelect={() => setShowRenameDialog(true)} className="text-foreground-active hover:!bg-background-onlook hover:!text-foreground-active gap-2">
                        <icons_1.Icons.Pencil className="w-4 h-4"/>
                        {t('projects.actions.renameProject')}
                    </dropdown_menu_1.DropdownMenuItem>
                    <dropdown_menu_1.DropdownMenuItem onSelect={() => setShowDeleteDialog(true)} className="gap-2 text-red-400 hover:!bg-red-200/80 hover:!text-red-700 dark:text-red-200 dark:hover:!bg-red-800 dark:hover:!text-red-100">
                        <icons_1.Icons.Trash className="w-4 h-4"/>
                        {t('projects.actions.deleteProject')}
                    </dropdown_menu_1.DropdownMenuItem>
                </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>

            <alert_dialog_1.AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <alert_dialog_1.AlertDialogContent>
                    <alert_dialog_1.AlertDialogHeader>
                        <alert_dialog_1.AlertDialogTitle>{t('projects.dialogs.delete.title')}</alert_dialog_1.AlertDialogTitle>
                        <alert_dialog_1.AlertDialogDescription>
                            {t('projects.dialogs.delete.description')}
                        </alert_dialog_1.AlertDialogDescription>
                    </alert_dialog_1.AlertDialogHeader>
                    <div className="flex items-center space-x-2">
                        <checkbox_1.Checkbox id="deleteFolder" checked={deleteProjectFolder} onCheckedChange={(checked) => setDeleteProjectFolder(checked)}/>
                        <label_1.Label htmlFor="deleteFolder">
                            {t('projects.dialogs.delete.moveToTrash')}
                        </label_1.Label>
                    </div>
                    <alert_dialog_1.AlertDialogFooter>
                        <button_1.Button variant={'ghost'} onClick={() => setShowDeleteDialog(false)}>
                            {t('projects.actions.cancel')}
                        </button_1.Button>
                        <button_1.Button variant={'destructive'} className="rounded-md text-sm" onClick={handleDeleteProject}>
                            {t('projects.actions.delete')}
                        </button_1.Button>
                    </alert_dialog_1.AlertDialogFooter>
                </alert_dialog_1.AlertDialogContent>
            </alert_dialog_1.AlertDialog>
            <alert_dialog_1.AlertDialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
                <alert_dialog_1.AlertDialogContent>
                    <alert_dialog_1.AlertDialogHeader>
                        <alert_dialog_1.AlertDialogTitle>{t('projects.dialogs.rename.title')}</alert_dialog_1.AlertDialogTitle>
                    </alert_dialog_1.AlertDialogHeader>
                    <div className="flex flex-col w-full gap-2">
                        <label_1.Label htmlFor="text">{t('projects.dialogs.rename.label')}</label_1.Label>
                        <input_1.Input minLength={0} type="text" placeholder={(0, helpers_1.getRandomPlaceholder)()} value={projectName || ''} onInput={(e) => setProjectName(e.currentTarget.value)}/>
                        <p className={(0, utils_2.cn)('text-xs text-red-500 transition-opacity', isProjectNameEmpty ? 'opacity-100' : 'opacity-0')}>
                            {t('projects.dialogs.rename.error')}
                        </p>
                    </div>
                    <alert_dialog_1.AlertDialogFooter>
                        <button_1.Button variant={'ghost'} onClick={() => setShowRenameDialog(false)}>
                            {t('projects.actions.cancel')}
                        </button_1.Button>
                        <button_1.Button disabled={isProjectNameEmpty} className="rounded-md text-sm" onClick={handleRenameProject}>
                            {t('projects.actions.rename')}
                        </button_1.Button>
                    </alert_dialog_1.AlertDialogFooter>
                </alert_dialog_1.AlertDialogContent>
            </alert_dialog_1.AlertDialog>
        </>);
}
//# sourceMappingURL=ProjectSettingsButton.js.map