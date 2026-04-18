"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectTab = void 0;
const editor_1 = require("@/components/store/editor");
const react_1 = require("@/trpc/react");
const constants_1 = require("@onlook/constants");
const db_1 = require("@onlook/db");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const separator_1 = require("@onlook/ui/separator");
const sonner_1 = require("@onlook/ui/sonner");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_2 = require("react");
exports.ProjectTab = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const utils = react_1.api.useUtils();
    const { data: project } = react_1.api.project.get.useQuery({ projectId: editorEngine.projectId });
    const { mutateAsync: updateProject } = react_1.api.project.update.useMutation();
    const { data: projectSettings } = react_1.api.settings.get.useQuery({ projectId: editorEngine.projectId });
    const { mutateAsync: updateProjectSettings } = react_1.api.settings.upsert.useMutation();
    const installCommand = projectSettings?.commands?.install ?? constants_1.DefaultSettings.COMMANDS.install;
    const runCommand = projectSettings?.commands?.run ?? constants_1.DefaultSettings.COMMANDS.run;
    const buildCommand = projectSettings?.commands?.build ?? constants_1.DefaultSettings.COMMANDS.build;
    const name = project?.name ?? '';
    // Form state
    const [formData, setFormData] = (0, react_2.useState)({
        name: '',
        install: '',
        run: '',
        build: ''
    });
    const [isSaving, setIsSaving] = (0, react_2.useState)(false);
    // Initialize and sync form data
    (0, react_2.useEffect)(() => {
        setFormData({
            name,
            install: installCommand,
            run: runCommand,
            build: buildCommand
        });
    }, [name, installCommand, runCommand, buildCommand]);
    // Check if form has changes
    const isDirty = (0, react_2.useMemo)(() => {
        return (formData.name !== name ||
            formData.install !== installCommand ||
            formData.run !== runCommand ||
            formData.build !== buildCommand);
    }, [formData, name, installCommand, runCommand, buildCommand]);
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Update project name if changed
            if (formData.name !== name) {
                await updateProject({
                    id: editorEngine.projectId,
                    name: formData.name,
                });
                // Invalidate queries to refresh UI
                await Promise.all([
                    utils.project.list.invalidate(),
                    utils.project.get.invalidate({ projectId: editorEngine.projectId }),
                ]);
            }
            // Update commands if any changed
            if (formData.install !== installCommand || formData.run !== runCommand || formData.build !== buildCommand) {
                await updateProjectSettings({
                    projectId: editorEngine.projectId,
                    settings: (0, db_1.toDbProjectSettings)(editorEngine.projectId, {
                        commands: {
                            install: formData.install,
                            run: formData.run,
                            build: formData.build,
                        },
                    }),
                });
            }
            sonner_1.toast.success('Project settings updated successfully.');
        }
        catch (error) {
            console.error('Failed to update project settings:', error);
            sonner_1.toast.error('Failed to update project settings. Please try again.');
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDiscard = () => {
        setFormData({
            name,
            install: installCommand,
            run: runCommand,
            build: buildCommand
        });
    };
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    return (<div className="text-sm flex flex-col h-full">
            <div className="flex flex-col gap-4 p-6 pb-24 overflow-y-auto flex-1">
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg">Metadata</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Name</p>
                            <input_1.Input id="name" value={formData.name} onChange={(e) => updateField('name', e.target.value)} className="w-2/3" disabled={isSaving}/>
                        </div>
                    </div>
                </div>
                <separator_1.Separator />

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg">Commands</h2>
                        <p className="text-small text-foreground-secondary">
                            {"Only update these if you know what you're doing!"}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Install</p>
                            <input_1.Input id="install" value={formData.install} onChange={(e) => updateField('install', e.target.value)} className="w-2/3" disabled={isSaving}/>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Run</p>
                            <input_1.Input id="run" value={formData.run} onChange={(e) => updateField('run', e.target.value)} className="w-2/3" disabled={isSaving}/>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Build</p>
                            <input_1.Input id="build" value={formData.build} onChange={(e) => updateField('build', e.target.value)} className="w-2/3" disabled={isSaving}/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save/Discard buttons matching site tab pattern */}
            <div className="sticky bottom-0 bg-background border-t border-border/50 p-6" style={{ borderTopWidth: '0.5px' }}>
                <div className="flex justify-end gap-4">
                    <button_1.Button variant="outline" className="flex items-center gap-2 px-4 py-2 bg-background border border-border/50" type="button" onClick={handleDiscard} disabled={!isDirty || isSaving}>
                        <span>Discard changes</span>
                    </button_1.Button>
                    <button_1.Button variant="secondary" className="flex items-center gap-2 px-4 py-2" type="button" onClick={handleSave} disabled={!isDirty || isSaving}>
                        {isSaving && <icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin"/>}
                        <span>{isSaving ? 'Saving...' : 'Save changes'}</span>
                    </button_1.Button>
                </div>
            </div>
        </div>);
});
//# sourceMappingURL=index.js.map