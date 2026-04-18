"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoVersions = void 0;
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.NoVersions = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    return (<div className="flex flex-col items-center gap-2 border border-dashed rounded p-12 mt-4">
            <div className="">No backups</div>
            <div className="text-muted-foreground text-center">
                Create your first backup with the <br /> current version
            </div>
            <button_1.Button variant="outline" size="sm" onClick={() => projectsManager.versions?.initializeRepo()} disabled={projectsManager.versions?.isSaving}>
                {projectsManager.versions?.isSaving ? (<index_1.Icons.Shadow className="h-4 w-4 mr-2 animate-spin"/>) : (<index_1.Icons.Plus className="h-4 w-4 mr-2"/>)}
                {projectsManager.versions?.isSaving ? 'Saving...' : 'Create backup'}
            </button_1.Button>
        </div>);
});
//# sourceMappingURL=Version.js.map