"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneProjectDialog = void 0;
const editor_1 = require("@/components/store/editor");
const react_1 = require("@/trpc/react");
const constants_1 = require("@/utils/constants");
const alert_dialog_1 = require("@onlook/ui/alert-dialog");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const label_1 = require("@onlook/ui/label");
const sonner_1 = require("@onlook/ui/sonner");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const navigation_1 = require("next/navigation");
const react_2 = require("react");
exports.CloneProjectDialog = (0, mobx_react_lite_1.observer)(({ isOpen, onClose, projectName }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const router = (0, navigation_1.useRouter)();
    const { mutateAsync: cloneProject } = react_1.api.project.fork.useMutation();
    const [cloneProjectName, setCloneProjectName] = (0, react_2.useState)(projectName ? `${projectName} (Clone)` : '');
    const [isCloningCurrentProject, setIsCloningCurrentProject] = (0, react_2.useState)(false);
    // Generate default clone name
    const defaultCloneName = (0, react_2.useMemo)(() => {
        if (projectName) {
            return `${projectName} (Clone)`;
        }
        return 'Cloned Project';
    }, [projectName]);
    const isCloneProjectNameEmpty = (0, react_2.useMemo)(() => cloneProjectName.trim().length === 0, [cloneProjectName]);
    // Reset the form when dialog opens
    const handleOpenChange = (open) => {
        if (open && isOpen) {
            setCloneProjectName(defaultCloneName);
        }
        else if (!open) {
            onClose();
            // Reset form after closing
            setTimeout(() => {
                setCloneProjectName('');
                setIsCloningCurrentProject(false);
            }, 200);
        }
    };
    const handleCloneCurrentProject = async () => {
        if (!editorEngine.projectId) {
            sonner_1.toast.error('No project to clone');
            return;
        }
        setIsCloningCurrentProject(true);
        try {
            // Capture screenshot of current project before navigation
            try {
                editorEngine.screenshot.captureScreenshot();
            }
            catch (error) {
                console.error('Failed to capture screenshot:', error);
            }
            const clonedProject = await cloneProject({
                projectId: editorEngine.projectId,
                name: cloneProjectName.trim(),
            });
            if (clonedProject) {
                sonner_1.toast.success('Project cloned successfully');
                onClose();
                router.push(`${constants_1.Routes.PROJECT}/${clonedProject.id}`);
            }
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
            setIsCloningCurrentProject(false);
        }
    };
    return (<alert_dialog_1.AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <alert_dialog_1.AlertDialogContent>
                <alert_dialog_1.AlertDialogHeader>
                    <alert_dialog_1.AlertDialogTitle>Clone Project</alert_dialog_1.AlertDialogTitle>
                    <alert_dialog_1.AlertDialogDescription>
                        Create a copy of this project with all branches and settings preserved.
                    </alert_dialog_1.AlertDialogDescription>
                </alert_dialog_1.AlertDialogHeader>
                <div className="flex flex-col w-full gap-2">
                    <label_1.Label htmlFor="clone-name">Project Name</label_1.Label>
                    <input_1.Input id="clone-name" type="text" placeholder="Enter name for cloned project" value={cloneProjectName} onChange={(e) => setCloneProjectName(e.target.value)}/>
                    <p className={(0, utils_1.cn)('text-xs text-red-500 transition-opacity', isCloneProjectNameEmpty ? 'opacity-100' : 'opacity-0')}>
                        Project name can't be empty
                    </p>
                </div>
                <alert_dialog_1.AlertDialogFooter>
                    <button_1.Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={isCloningCurrentProject}>
                        Cancel
                    </button_1.Button>
                    <button_1.Button disabled={isCloneProjectNameEmpty || isCloningCurrentProject} onClick={handleCloneCurrentProject}>
                        {isCloningCurrentProject ? (<>
                                <icons_1.Icons.LoadingSpinner className="mr-2 h-4 w-4 animate-spin"/>
                                Cloning...
                            </>) : ('Clone Project')}
                    </button_1.Button>
                </alert_dialog_1.AlertDialogFooter>
            </alert_dialog_1.AlertDialogContent>
        </alert_dialog_1.AlertDialog>);
});
//# sourceMappingURL=clone-project-dialog.js.map