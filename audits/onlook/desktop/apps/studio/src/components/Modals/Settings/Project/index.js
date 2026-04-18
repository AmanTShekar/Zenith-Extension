"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const separator_1 = require("@onlook/ui/separator");
const mobx_react_lite_1 = require("mobx-react-lite");
const ReinstallButon_1 = require("./ReinstallButon");
const ProjectTab = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const project = projectsManager.project;
    const installCommand = project?.commands?.install || constants_1.DefaultSettings.COMMANDS.install;
    const runCommand = project?.commands?.run || constants_1.DefaultSettings.COMMANDS.run;
    const buildCommand = project?.commands?.build || constants_1.DefaultSettings.COMMANDS.build;
    const folderPath = project?.folderPath || '';
    const name = project?.name || '';
    const url = project?.url || '';
    const handleUpdatePath = async () => {
        const path = (await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.PICK_COMPONENTS_DIRECTORY));
        if (!path) {
            console.error('No path selected');
            return;
        }
        projectsManager.updatePartialProject({
            folderPath: path,
        });
    };
    const handleUpdateUrl = (url) => {
        projectsManager.updatePartialProject({
            url,
        });
        projectsManager.editorEngine?.canvas.saveFrames(projectsManager.editorEngine?.canvas.frames.map((frame) => ({
            ...frame,
            url,
        })));
    };
    return (<div className="text-sm">
            <div className="flex flex-col gap-4 p-6">
                <h2 className="text-lg">Metadata</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className=" text-muted-foreground">Name</p>
                        <input_1.Input id="name" value={name} onChange={(e) => projectsManager.updatePartialProject({
            name: e.target.value,
        })} className="w-2/3"/>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className=" text-muted-foreground">URL</p>
                        <input_1.Input id="url" value={url} onChange={(e) => handleUpdateUrl(e.target.value)} className="w-2/3"/>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className=" text-muted-foreground">Path</p>
                        <div className="flex items-center gap-2 w-2/3">
                            <input_1.Input id="folderPath" value={folderPath} readOnly={true} onChange={(e) => projectsManager.updatePartialProject({
            folderPath: e.target.value,
        })}/>
                            <button_1.Button size={'icon'} variant={'outline'} onClick={handleUpdatePath}>
                                <icons_1.Icons.Directory />
                            </button_1.Button>
                        </div>
                    </div>
                </div>
            </div>

            <separator_1.Separator />

            <div className="flex flex-col gap-4 p-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg">Commands</h2>
                    <p className="text-small text-foreground-secondary">
                        {"Only update these if you know what you're doing!"}
                    </p>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Install</p>
                        <input_1.Input id="install" value={installCommand} className="w-2/3" onChange={(e) => projectsManager.updatePartialProject({
            commands: {
                ...project?.commands,
                install: e.target.value,
            },
        })}/>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className=" text-muted-foreground">Run</p>
                        <input_1.Input id="run" value={runCommand} className="w-2/3" onChange={(e) => projectsManager.updatePartialProject({
            commands: {
                ...project?.commands,
                run: e.target.value,
            },
        })}/>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className=" text-muted-foreground">Build</p>
                        <input_1.Input id="build" value={buildCommand} onChange={(e) => projectsManager.updatePartialProject({
            commands: {
                ...project?.commands,
                build: e.target.value,
            },
        })} className="w-2/3"/>
                    </div>
                </div>
            </div>
            <separator_1.Separator />

            <div className="flex justify-between items-center p-6">
                <div className="flex flex-col gap-2">
                    <p className="text-largePlus">Reinstall Dependencies</p>
                    <p className="text-foreground-onlook text-small">
                        For when project failed to install dependencies
                    </p>
                </div>
                <ReinstallButon_1.ReinstallButton />
            </div>
        </div>);
});
exports.default = ProjectTab;
//# sourceMappingURL=index.js.map