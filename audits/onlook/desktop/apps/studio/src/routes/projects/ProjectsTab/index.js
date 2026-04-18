"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const mobx_react_lite_1 = require("mobx-react-lite");
const PromptCreation_1 = require("../PromptCreation");
const Select_1 = __importDefault(require("./Select"));
const ProjectsTab = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    if (projectsManager.projects.length === 0) {
        return <PromptCreation_1.PromptCreation initialScreen={true}/>;
    }
    return <Select_1.default />;
});
exports.default = ProjectsTab;
//# sourceMappingURL=index.js.map