"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditAppButton = void 0;
const keys_1 = require("@/i18n/keys");
const constants_1 = require("@/utils/constants");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const next_intl_1 = require("next-intl");
const navigation_1 = require("next/navigation");
const react_2 = require("posthog-js/react");
const react_3 = require("react");
const ButtonMotion = react_1.motion.create(button_1.Button);
exports.EditAppButton = (0, mobx_react_lite_1.observer)(({ project, onClick, ...props }) => {
    const t = (0, next_intl_1.useTranslations)();
    const posthog = (0, react_2.usePostHog)();
    const [isLoading, setIsLoading] = (0, react_3.useState)(false);
    const selectProject = (project) => {
        setIsLoading(true);
        posthog.capture('open_project', { id: project.id });
        (0, navigation_1.redirect)(`${constants_1.Routes.PROJECT}/${project.id}`);
    };
    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
        }
        selectProject(project);
    };
    return (<ButtonMotion size="default" className={(0, utils_1.cn)('gap-2 border border-gray-300 w-auto cursor-pointer', isLoading
            ? 'bg-gray-200 text-gray-800'
            : 'bg-white text-black hover:bg-gray-100')} {...props} 
    // Prevent consumer from overriding these props
    onClick={handleClick} disabled={isLoading}>
            {isLoading ? (<icons_1.Icons.LoadingSpinner className="w-4 h-4 animate-spin"/>) : (<icons_1.Icons.PencilPaper />)}
            <p>{t(keys_1.transKeys.projects.actions.editApp)}</p>
        </ButtonMotion>);
});
//# sourceMappingURL=edit-app.js.map