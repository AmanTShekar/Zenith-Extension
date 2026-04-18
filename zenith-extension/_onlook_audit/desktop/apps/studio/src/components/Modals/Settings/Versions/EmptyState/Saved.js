"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoSavedVersions = void 0;
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.NoSavedVersions = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const handleSaveLatestCommit = async () => {
        projectsManager.versions?.saveLatestCommit();
    };
    return (<div className="flex flex-col items-center gap-2 border border-dashed rounded p-12">
            <div className="">No saved versions</div>
            <div className="text-muted-foreground text-center">
                Your saved backups will appear here
            </div>
            <button_1.Button variant="outline" size="sm" onClick={handleSaveLatestCommit}>
                <index_1.Icons.Plus className="h-4 w-4 mr-2"/>
                Add current version
            </button_1.Button>
        </div>);
});
//# sourceMappingURL=Saved.js.map