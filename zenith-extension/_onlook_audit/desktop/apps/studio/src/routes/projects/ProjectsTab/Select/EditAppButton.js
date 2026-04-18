"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditAppButton = void 0;
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/utils");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_i18next_1 = require("react-i18next");
const ButtonMotion = react_1.motion.create(button_1.Button);
exports.EditAppButton = (0, mobx_react_lite_1.observer)(({ project, ...props }) => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const selectProject = (project) => {
        projectsManager.project = project;
        projectsManager.runner?.startIfPortAvailable();
        (0, utils_1.sendAnalytics)('open project', { id: project.id, url: project.url });
    };
    return (<ButtonMotion size="default" variant={'outline'} className="gap-2 bg-background-active border-[0.5px] border-border-active w-full lg:w-auto" onClick={() => selectProject(project)} {...props}>
            <icons_1.Icons.PencilPaper />
            <p>{t('projects.actions.editApp')}</p>
        </ButtonMotion>);
});
//# sourceMappingURL=EditAppButton.js.map