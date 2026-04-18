"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projects = void 0;
const Context_1 = require("@/components/Context");
const projects_1 = require("@/lib/projects");
const mobx_react_lite_1 = require("mobx-react-lite");
const ProjectsTab_1 = __importDefault(require("./ProjectsTab"));
const Create_1 = __importDefault(require("./ProjectsTab/Create"));
const PromptCreation_1 = __importDefault(require("./PromptCreation"));
const TopBar_1 = require("./TopBar");
const helpers_1 = require("./helpers");
exports.Projects = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const renderTab = () => {
        switch (projectsManager.projectsTab) {
            case projects_1.ProjectTabs.PROJECTS:
                return <ProjectsTab_1.default />;
            case projects_1.ProjectTabs.PROMPT_CREATE:
                return <PromptCreation_1.default />;
            case projects_1.ProjectTabs.IMPORT_PROJECT:
                return (<Create_1.default createMethod={helpers_1.CreateMethod.LOAD} setCreateMethod={() => {
                        projectsManager.projectsTab = projects_1.ProjectTabs.PROJECTS;
                    }}/>);
            default:
                return null;
        }
    };
    return (<div className="w-full h-[calc(100vh-2.5rem)]">
            <TopBar_1.TopBar />
            <div className="flex h-[calc(100vh-5.5rem)] justify-center overflow-hidden w-full">
                {renderTab()}
            </div>
        </div>);
});
//# sourceMappingURL=index.js.map