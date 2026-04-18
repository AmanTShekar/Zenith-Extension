"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_i18next_1 = require("react-i18next");
const EditAppButton_1 = require("./EditAppButton");
const ProjectSettingsButton_1 = __importDefault(require("./ProjectSettingsButton"));
const ProjectInfo = (0, mobx_react_lite_1.observer)(({ project, direction }) => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const variants = {
        enter: (direction) => ({
            y: direction > 0 ? 20 : -20,
            opacity: 0,
        }),
        center: {
            y: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            y: direction < 0 ? 20 : -20,
            opacity: 0,
        }),
    };
    return (project && (<>
                <react_1.AnimatePresence mode="wait" custom={direction}>
                    <react_1.motion.p key={project.id} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="inline-block text-foreground-active text-title1">
                        {project.name}
                    </react_1.motion.p>
                </react_1.AnimatePresence>
                <div className="text-foreground-onlook flex flex-col md:flex-row gap-2 md:gap-7 text-small">
                    <p>
                        {t('projects.select.lastEdited', {
            time: (0, utility_1.timeAgo)(new Date(project.updatedAt).toISOString()),
        })}
                    </p>
                    <p>{project.url}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 w-full">
                    <EditAppButton_1.EditAppButton project={project}/>
                    <ProjectSettingsButton_1.default project={project}/>
                </div>
            </>));
});
exports.default = ProjectInfo;
//# sourceMappingURL=Info.js.map