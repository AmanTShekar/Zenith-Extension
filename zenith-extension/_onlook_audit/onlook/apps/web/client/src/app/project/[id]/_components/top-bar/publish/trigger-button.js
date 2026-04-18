"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerButton = void 0;
const editor_1 = require("@/components/store/editor");
const hosting_1 = require("@/components/store/hosting");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.TriggerButton = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { deployment: previewDeployment, isDeploying: isPreviewDeploying } = (0, hosting_1.useHostingType)(models_1.DeploymentType.PREVIEW);
    const { deployment: customDeployment, isDeploying: isCustomDeploying } = (0, hosting_1.useHostingType)(models_1.DeploymentType.CUSTOM);
    const isPreviewCompleted = previewDeployment?.status === models_1.DeploymentStatus.COMPLETED;
    const isCustomCompleted = customDeployment?.status === models_1.DeploymentStatus.COMPLETED;
    const isPreviewFailed = previewDeployment?.status === models_1.DeploymentStatus.FAILED;
    const isCustomFailed = customDeployment?.status === models_1.DeploymentStatus.FAILED;
    const isCompleted = isPreviewCompleted || isCustomCompleted;
    const isFailed = isPreviewFailed || isCustomFailed;
    const isDeploying = isPreviewDeploying || isCustomDeploying;
    let colorClasses = 'border-input bg-background hover:bg-background-onlook text-foreground-primary';
    let icon = <icons_1.Icons.Globe className="mr-1 h-4 w-4"/>;
    let text = 'Publish';
    if (isCompleted) {
        colorClasses =
            'border-teal-300 bg-teal-400/90 hover:bg-teal-400 dark:border-teal-300 dark:bg-teal-700 dark:hover:bg-teal-500/20 dark:text-teal-100 text-white hover:text-background';
        text = editorEngine.history.length > 0 ? 'Update' : 'Live';
        icon = <icons_1.Icons.Globe className="mr-1 h-4 w-4"/>;
    }
    else if (isDeploying) {
        icon = <icons_1.Icons.LoadingSpinner className="mr-1 h-4 w-4 animate-spin"/>;
        text = 'Publishing';
    }
    else if (isFailed) {
        colorClasses =
            'border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 hover:border-red-500';
        icon = <icons_1.Icons.ExclamationTriangle className="mr-1 h-4 w-4"/>;
    }
    else {
        colorClasses = 'border-input bg-background hover:bg-background-onlook text-foreground-primary hover:border-foreground-primary';
    }
    return (<dropdown_menu_1.DropdownMenuTrigger asChild>
            <button_1.Button variant="default" size="sm" className={(0, utils_1.cn)('px-3 flex items-center border-[0.5px] text-xs justify-center shadow-sm h-8 rounded-md transition-all duration-300 ease-in-out', colorClasses)}>
                {icon}
                {text}
            </button_1.Button>
        </dropdown_menu_1.DropdownMenuTrigger>);
});
//# sourceMappingURL=trigger-button.js.map