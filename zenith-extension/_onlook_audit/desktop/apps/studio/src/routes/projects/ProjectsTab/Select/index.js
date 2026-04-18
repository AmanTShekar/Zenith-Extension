"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_i18next_1 = require("react-i18next");
const react_1 = require("react");
const Carousel_1 = __importDefault(require("./Carousel"));
const Info_1 = __importDefault(require("./Info"));
const SelectProject = (0, mobx_react_lite_1.observer)(() => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const [projects, setProjects] = (0, react_1.useState)(projectsManager.projects);
    const [currentProjectIndex, setCurrentProjectIndex] = (0, react_1.useState)(0);
    const [direction, setDirection] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        const sortedProjects = projectsManager.projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setProjects(sortedProjects);
    }, [projectsManager.projects]);
    const handleProjectChange = (index) => {
        if (currentProjectIndex === index) {
            return;
        }
        setDirection(index > currentProjectIndex ? 1 : -1);
        setCurrentProjectIndex(index);
    };
    return (<>
            <div className="w-3/5">
                <Carousel_1.default slides={projects} onSlideChange={handleProjectChange}/>
            </div>
            <div className="w-2/5 flex flex-col justify-center items-start p-4 mr-10 gap-6">
                <Info_1.default project={projects[currentProjectIndex]} direction={direction}/>
            </div>
        </>);
});
exports.default = SelectProject;
//# sourceMappingURL=index.js.map