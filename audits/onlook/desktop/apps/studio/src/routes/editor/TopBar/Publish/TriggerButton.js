"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishButton = void 0;
const Context_1 = require("@/components/Context");
const hosting_1 = require("@onlook/models/hosting");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const index_1 = require("@onlook/ui/icons/index");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.PublishButton = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const baseStatus = projectsManager.domains?.base?.state.status;
    const customStatus = projectsManager.domains?.custom?.state.status;
    const computeStatus = () => {
        if (!baseStatus && !customStatus) {
            return hosting_1.PublishStatus.UNPUBLISHED;
        }
        if (baseStatus === hosting_1.PublishStatus.ERROR || customStatus === hosting_1.PublishStatus.ERROR) {
            return hosting_1.PublishStatus.ERROR;
        }
        if (baseStatus === hosting_1.PublishStatus.LOADING || customStatus === hosting_1.PublishStatus.LOADING) {
            return hosting_1.PublishStatus.LOADING;
        }
        if (baseStatus === hosting_1.PublishStatus.PUBLISHED || customStatus === hosting_1.PublishStatus.PUBLISHED) {
            return hosting_1.PublishStatus.PUBLISHED;
        }
        return hosting_1.PublishStatus.UNPUBLISHED;
    };
    const status = computeStatus();
    let colorClasses = 'border-input bg-background hover:bg-background-onlook text-foreground';
    let icon = <index_1.Icons.Globe className="mr-2 h-4 w-4"/>;
    let text = 'Publish';
    if (status === hosting_1.PublishStatus.PUBLISHED) {
        colorClasses =
            'border-teal-300 bg-teal-400/90 hover:bg-teal-400 dark:border-teal-300 dark:bg-teal-700 dark:hover:bg-teal-500/20 dark:text-teal-100 text-white hover:text-background';
        text = editorEngine.history.length > 0 ? 'Update' : 'Live';
        icon = <index_1.Icons.Globe className="mr-2 h-4 w-4"/>;
    }
    else if (status === hosting_1.PublishStatus.LOADING) {
        icon = <index_1.Icons.Shadow className="mr-2 h-4 w-4 animate-spin"/>;
        text = 'Publishing';
    }
    else if (status === hosting_1.PublishStatus.UNPUBLISHED) {
        colorClasses = 'border-input bg-background hover:bg-background-onlook text-foreground';
    }
    else if (status === hosting_1.PublishStatus.ERROR) {
        colorClasses =
            'border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 hover:border-red-500';
        icon = <index_1.Icons.ExclamationTriangle className="mr-2 h-4 w-4"/>;
    }
    return (<dropdown_menu_1.DropdownMenuTrigger asChild>
            <button_1.Button variant="outline" size="sm" className={(0, utils_1.cn)('px-3 flex items-center border-[0.5px] text-xs justify-center shadow-sm h-8 rounded-md transition-all duration-300 ease-in-out', colorClasses)}>
                {icon}
                {text}
            </button_1.Button>
        </dropdown_menu_1.DropdownMenuTrigger>);
});
//# sourceMappingURL=TriggerButton.js.map