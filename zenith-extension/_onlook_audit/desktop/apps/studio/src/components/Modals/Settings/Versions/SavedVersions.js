"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedVersions = void 0;
const Context_1 = require("@/components/Context");
const separator_1 = require("@onlook/ui/separator");
const mobx_react_lite_1 = require("mobx-react-lite");
const Saved_1 = require("./EmptyState/Saved");
const VersionRow_1 = require("./VersionRow");
exports.SavedVersions = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const commits = projectsManager.versions?.savedCommits;
    return (<div className="flex flex-col gap-4 p-4">
            <h2 className="pl-2">Saved Versions</h2>
            <separator_1.Separator />
            {commits && commits.length > 0 ? (<div className="flex flex-col gap-2">
                    {commits?.map((commit) => (<VersionRow_1.VersionRow key={commit.oid} commit={commit} type={VersionRow_1.VersionRowType.SAVED}/>))}
                </div>) : (<Saved_1.NoSavedVersions />)}
        </div>);
});
//# sourceMappingURL=SavedVersions.js.map