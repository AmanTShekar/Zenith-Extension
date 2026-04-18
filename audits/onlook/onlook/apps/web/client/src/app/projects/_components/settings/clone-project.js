"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneProject = CloneProject;
const keys_1 = require("@/i18n/keys");
const react_1 = require("@/trpc/react");
const alert_dialog_1 = require("@onlook/ui/alert-dialog");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const label_1 = require("@onlook/ui/label");
const utils_1 = require("@onlook/ui/utils");
const next_intl_1 = require("next-intl");
const react_2 = require("react");
const sonner_1 = require("sonner");
function CloneProject({ project, refetch }) {
    const t = (0, next_intl_1.useTranslations)();
    const utils = react_1.api.useUtils();
    const { mutateAsync: forkProject } = react_1.api.project.fork.useMutation();
    const [showCloneDialog, setShowCloneDialog] = (0, react_2.useState)(false);
    const [cloneProjectName, setCloneProjectName] = (0, react_2.useState)(`${project.name} (Clone)`);
    const [isCloningProject, setIsCloningProject] = (0, react_2.useState)(false);
    const isCloneProjectNameEmpty = (0, react_2.useMemo)(() => cloneProjectName.trim().length === 0, [cloneProjectName]);
    (0, react_2.useEffect)(() => {
        setCloneProjectName(`${project.name} (Clone)`);
    }, [project.name]);
    const handleCloneProject = async () => {
        setIsCloningProject(true);
        try {
            const clonedProject = await forkProject({
                projectId: project.id,
                name: cloneProjectName,
            });
            // Invalidate and refetch project lists
            await Promise.all([
                utils.project.list.invalidate(),
            ]);
            sonner_1.toast.success('Project cloned successfully');
            setShowCloneDialog(false);
            refetch();
        }
        catch (error) {
            console.error('Error cloning project:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('502') || errorMessage.includes('sandbox')) {
                sonner_1.toast.error('Sandbox service temporarily unavailable', {
                    description: 'Please try again in a few moments. Our servers may be experiencing high load.',
                });
            }
            else {
                sonner_1.toast.error('Failed to clone project', {
                    description: errorMessage,
                });
            }
        }
        finally {
            setIsCloningProject(false);
        }
    };
    return (<>
            <dropdown_menu_1.DropdownMenuItem onSelect={(event) => {
            event.preventDefault();
            setShowCloneDialog(true);
        }} className="text-foreground-active hover:!bg-background-onlook hover:!text-foreground-active gap-2">
                <icons_1.Icons.Copy className="w-4 h-4"/>
                Clone Project
            </dropdown_menu_1.DropdownMenuItem>

            <alert_dialog_1.AlertDialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
                <alert_dialog_1.AlertDialogContent>
                    <alert_dialog_1.AlertDialogHeader>
                        <alert_dialog_1.AlertDialogTitle>Clone Project</alert_dialog_1.AlertDialogTitle>
                    </alert_dialog_1.AlertDialogHeader>
                    <div className="flex flex-col w-full gap-2">
                        <label_1.Label htmlFor="clone-name">Project Name</label_1.Label>
                        <input_1.Input id="clone-name" minLength={0} type="text" placeholder="Enter name for cloned project" value={cloneProjectName || ''} onInput={(e) => setCloneProjectName(e.currentTarget.value)}/>
                        <p className={(0, utils_1.cn)('text-xs text-red-500 transition-opacity', isCloneProjectNameEmpty ? 'opacity-100' : 'opacity-0')}>
                            Project name can't be empty
                        </p>
                    </div>
                    <alert_dialog_1.AlertDialogFooter>
                        <button_1.Button variant={'ghost'} onClick={() => setShowCloneDialog(false)} disabled={isCloningProject}>
                            {t(keys_1.transKeys.projects.actions.cancel)}
                        </button_1.Button>
                        <button_1.Button disabled={isCloneProjectNameEmpty || isCloningProject} className="rounded-md text-sm" onClick={handleCloneProject}>
                            {isCloningProject ? (<>
                                    <icons_1.Icons.LoadingSpinner className="mr-2 h-4 w-4 animate-spin"/>
                                    Cloning...
                                </>) : ('Clone')}
                        </button_1.Button>
                    </alert_dialog_1.AlertDialogFooter>
                </alert_dialog_1.AlertDialogContent>
            </alert_dialog_1.AlertDialog>
        </>);
}
//# sourceMappingURL=clone-project.js.map