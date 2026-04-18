"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvVars = void 0;
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const use_toast_1 = require("@onlook/ui/use-toast");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
exports.EnvVars = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const project = projectsManager.project;
    const [newVarKey, setNewVarKey] = (0, react_1.useState)('');
    const [newVarValue, setNewVarValue] = (0, react_1.useState)('');
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [editValue, setEditValue] = (0, react_1.useState)('');
    const envVars = project?.env || {};
    const handleAddEnvVar = () => {
        if (!newVarKey) {
            (0, use_toast_1.toast)({
                title: 'Error',
                description: 'Variable name cannot be empty',
                variant: 'destructive',
            });
            return;
        }
        if (envVars[newVarKey]) {
            (0, use_toast_1.toast)({
                title: 'Error',
                description: `Variable "${newVarKey}" already exists`,
                variant: 'destructive',
            });
            return;
        }
        projectsManager.updatePartialProject({
            env: {
                ...envVars,
                [newVarKey]: newVarValue,
            },
        });
        setNewVarKey('');
        setNewVarValue('');
        (0, use_toast_1.toast)({
            title: 'Environment variable added',
            description: `Added "${newVarKey}" to environment variables`,
        });
    };
    const handleEditEnvVar = (key) => {
        projectsManager.updatePartialProject({
            env: {
                ...envVars,
                [key]: editValue,
            },
        });
        setEditing(null);
        setEditValue('');
        (0, use_toast_1.toast)({
            title: 'Environment variable updated',
            description: `Updated "${key}" environment variable`,
        });
    };
    const handleDeleteEnvVar = (key) => {
        const updatedEnvVars = { ...envVars };
        delete updatedEnvVars[key];
        projectsManager.updatePartialProject({
            env: updatedEnvVars,
        });
        (0, use_toast_1.toast)({
            title: 'Environment variable removed',
            description: `Removed "${key}" from environment variables`,
        });
    };
    const startEditing = (key, value) => {
        setEditing(key);
        setEditValue(value);
    };
    return (<div className="flex flex-col gap-4 text-sm">
            <div className="flex flex-col gap-2">
                <h2 className="text-lg">Environment Variables</h2>
                <p className="text-sm text-foreground-secondary">
                    Environment variables to use when running your project
                </p>
            </div>

            <div className="space-y-4">
                {Object.entries(envVars).length > 0 && (<div className="border rounded p-2 grid grid-cols-10 gap-2 items-center">
                        <div className="col-span-4">KEY</div>
                        <div className="col-span-4">VALUE</div>
                        {Object.entries(envVars).map(([key, value]) => (<>
                                <div className="truncate col-span-4">{key}</div>

                                <div className="flex items-center gap-2 col-span-6">
                                    <input_1.Input value={editing === key ? editValue : value} onChange={(e) => setEditValue(e.target.value)} placeholder="Value" className={(0, utils_1.cn)('h-8', {
                    'border-none p-0 disabled:opacity-100': editing !== key,
                })} disabled={editing !== key}/>

                                    {editing === key ? (<>
                                            <button_1.Button size="sm" onClick={() => handleEditEnvVar(key)} className="h-8">
                                                Save
                                            </button_1.Button>
                                            <button_1.Button size="sm" variant="ghost" onClick={() => {
                        setEditing(null);
                        setEditValue('');
                    }} className="h-8">
                                                Cancel
                                            </button_1.Button>
                                        </>) : (<>
                                            <button_1.Button size="icon" variant="ghost" onClick={() => startEditing(key, value)} className="h-8 w-8">
                                                <icons_1.Icons.Pencil className="h-4 w-4"/>
                                            </button_1.Button>
                                            <button_1.Button size="icon" variant="ghost" onClick={() => handleDeleteEnvVar(key)} className="h-8 w-8 text-red-500">
                                                <icons_1.Icons.Trash className="h-4 w-4"/>
                                            </button_1.Button>
                                        </>)}
                                </div>
                            </>))}
                    </div>)}

                {/* Add new environment variable */}
                <div className="pt-2">
                    <div className="grid grid-cols-10 gap-2">
                        <input_1.Input placeholder="KEY" value={newVarKey} onChange={(e) => setNewVarKey(e.target.value)} className="col-span-4"/>
                        <input_1.Input placeholder="VALUE" value={newVarValue} onChange={(e) => setNewVarValue(e.target.value)} className="col-span-5"/>
                        <button_1.Button onClick={handleAddEnvVar} className="col-span-1" variant="outline">
                            <icons_1.Icons.Plus className="h-4 w-4"/>
                            Add
                        </button_1.Button>
                    </div>
                </div>
            </div>
        </div>);
});
//# sourceMappingURL=EnvVars.js.map