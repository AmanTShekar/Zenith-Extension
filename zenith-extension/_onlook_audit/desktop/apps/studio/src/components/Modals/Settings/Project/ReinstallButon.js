"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReinstallButton = void 0;
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const run_1 = require("@onlook/models/run");
const alert_dialog_1 = require("@onlook/ui/alert-dialog");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const use_toast_1 = require("@onlook/ui/use-toast");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
exports.ReinstallButton = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const project = projectsManager.project;
    const isTerminalRunning = projectsManager.runner?.state === run_1.RunState.RUNNING;
    const installCommand = project?.commands?.install || constants_1.DefaultSettings.COMMANDS.install;
    const [isReinstalling, setIsReinstalling] = (0, react_1.useState)(false);
    const [showReinstallDialog, setShowReinstallDialog] = (0, react_1.useState)(false);
    const reinstallDependencies = async () => {
        if (!project?.folderPath) {
            (0, use_toast_1.toast)({
                title: 'Error',
                description: 'Project path is not defined',
                variant: 'destructive',
            });
            return;
        }
        setIsReinstalling(true);
        try {
            await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.REINSTALL_PROJECT_DEPENDENCIES, {
                folderPath: project.folderPath,
                installCommand: installCommand,
            });
            (0, use_toast_1.toast)({
                title: 'Dependencies reinstalled',
                description: 'Project dependencies have been reinstalled successfully',
            });
        }
        catch (error) {
            (0, use_toast_1.toast)({
                title: 'Failed to reinstall dependencies',
                description: error instanceof Error ? error.message : 'Unknown error occurred',
                variant: 'destructive',
            });
        }
        finally {
            setIsReinstalling(false);
            setShowReinstallDialog(false);
        }
    };
    const reinstall = () => {
        if (isTerminalRunning) {
            setShowReinstallDialog(true);
        }
        else {
            reinstallDependencies();
        }
    };
    const stopAndReinstall = async () => {
        setShowReinstallDialog(false);
        await projectsManager.runner?.stop();
        await reinstallDependencies();
        projectsManager.runner?.start();
    };
    return (<>
            <div className="pt-4 justify-end flex">
                <button_1.Button variant="outline" className="gap-2" onClick={reinstall} disabled={isReinstalling}>
                    {isReinstalling ? (<icons_1.Icons.Shadow className="h-4 w-4 animate-spin"/>) : (<icons_1.Icons.Reload className="h-4 w-4"/>)}
                    {isReinstalling ? 'Reinstalling...' : 'Reinstall'}
                </button_1.Button>
            </div>
            <alert_dialog_1.AlertDialog open={showReinstallDialog} onOpenChange={setShowReinstallDialog}>
                <alert_dialog_1.AlertDialogContent>
                    <alert_dialog_1.AlertDialogHeader>
                        <alert_dialog_1.AlertDialogTitle>Reinstall Dependencies</alert_dialog_1.AlertDialogTitle>
                        <alert_dialog_1.AlertDialogDescription>
                            Your app is currently running. Reinstalling dependencies will stop the
                            running instance. Do you want to continue?
                        </alert_dialog_1.AlertDialogDescription>
                    </alert_dialog_1.AlertDialogHeader>
                    <alert_dialog_1.AlertDialogFooter>
                        <button_1.Button variant="ghost" onClick={() => setShowReinstallDialog(false)}>
                            Cancel
                        </button_1.Button>
                        <button_1.Button variant="outline" onClick={stopAndReinstall}>
                            Stop and Reinstall
                        </button_1.Button>
                    </alert_dialog_1.AlertDialogFooter>
                </alert_dialog_1.AlertDialogContent>
            </alert_dialog_1.AlertDialog>
        </>);
});
//# sourceMappingURL=ReinstallButon.js.map