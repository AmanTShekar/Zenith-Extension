"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionsTab = void 0;
const Context_1 = require("@/components/Context");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const Versions_1 = require("./Versions");
exports.VersionsTab = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const commits = projectsManager.versions?.commits;
    (0, react_1.useEffect)(() => {
        projectsManager.versions?.listCommits();
    }, []);
    return (<div className="flex flex-col h-full relative text-sm">
            {/* {commits && commits.length > 0 ? (
            <>
                <SavedVersions />
                <Separator />
            </>
        ) : null} */}
            <Versions_1.Versions />
        </div>);
});
//# sourceMappingURL=index.js.map