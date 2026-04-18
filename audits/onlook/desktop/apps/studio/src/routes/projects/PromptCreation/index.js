"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptCreation = void 0;
const dunes_create_dark_png_1 = __importDefault(require("@/assets/dunes-create-dark.png"));
const dunes_create_light_png_1 = __importDefault(require("@/assets/dunes-create-light.png"));
const Context_1 = require("@/components/Context");
const ThemeProvider_1 = require("@/components/ThemeProvider");
const models_1 = require("@/lib/models");
const projects_1 = require("@/lib/projects");
const create_1 = require("@/lib/projects/create");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const CreateError_1 = require("./CreateError");
const CreateLoading_1 = require("./CreateLoading");
const PromptingCard_1 = require("./PromptingCard");
exports.PromptCreation = (0, mobx_react_lite_1.observer)(({ initialScreen = false }) => {
    const { t } = (0, react_i18next_1.useTranslation)();
    const { theme } = (0, ThemeProvider_1.useTheme)();
    const editorEngine = (0, Context_1.useEditorEngine)();
    const authManager = (0, Context_1.useAuthManager)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const [backgroundImage, setBackgroundImage] = (0, react_1.useState)(dunes_create_light_png_1.default);
    (0, react_1.useEffect)(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                returnToProjects();
            }
        };
        window.addEventListener('keydown', handleEscapeKey);
        return () => window.removeEventListener('keydown', handleEscapeKey);
    }, []);
    const returnToProjects = () => {
        if (projectsManager.create.state === create_1.CreateState.CREATE_LOADING) {
            console.warn('Cannot return to projects while loading');
            return;
        }
        projectsManager.projectsTab = projects_1.ProjectTabs.PROJECTS;
    };
    (0, react_1.useEffect)(() => {
        const determineBackgroundImage = () => {
            if (theme === constants_1.Theme.Dark) {
                return dunes_create_dark_png_1.default;
            }
            else if (theme === constants_1.Theme.Light) {
                return dunes_create_light_png_1.default;
            }
            else if (theme === constants_1.Theme.System) {
                return window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? dunes_create_dark_png_1.default
                    : dunes_create_light_png_1.default;
            }
            return dunes_create_light_png_1.default;
        };
        setBackgroundImage(determineBackgroundImage());
    }, [theme]);
    const renderCard = () => {
        switch (projectsManager.create.state) {
            case create_1.CreateState.PROMPT:
                return <PromptingCard_1.PromptingCard />;
            case create_1.CreateState.CREATE_LOADING:
                return <CreateLoading_1.CreateLoadingCard />;
            case create_1.CreateState.ERROR:
                return <CreateError_1.CreateErrorCard />;
        }
    };
    return (<div className="fixed inset-0">
            <div className="relative w-full h-full flex items-center justify-center" style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
                <div className="absolute inset-0 bg-background/50"/>
                <div className="relative z-10">
                    <div className="h-fit w-fit flex group fixed top-10 right-10 gap-2">
                        <tooltip_1.Tooltip>
                            <tooltip_1.TooltipTrigger asChild>
                                <button_1.Button variant="secondary" className="w-fit h-fit flex flex-col gap-1 text-foreground-secondary hover:text-foreground-active backdrop-blur-md bg-background/30" onClick={() => {
            editorEngine.isSettingsOpen = true;
            editorEngine.settingsTab = models_1.SettingsTabValue.ADVANCED;
        }}>
                                    <icons_1.Icons.Gear className="w-4 h-4 cursor-pointer"/>
                                    <p className="text-microPlus">
                                        {t('projects.create.settings.title')}
                                    </p>
                                </button_1.Button>
                            </tooltip_1.TooltipTrigger>
                            <tooltip_1.TooltipContent side="bottom">
                                <p>{t('projects.create.settings.tooltip')}</p>
                            </tooltip_1.TooltipContent>
                        </tooltip_1.Tooltip>
                        {initialScreen ? (<div className="flex flex-row gap-2">
                                <button_1.Button variant="outline" className={(0, utils_1.cn)('bg-transparent')} onClick={() => (projectsManager.projectsTab = projects_1.ProjectTabs.IMPORT_PROJECT)}>
                                    <p className="text-microPlus">{t('projects.actions.import')}</p>
                                </button_1.Button>
                                <dropdown_menu_1.DropdownMenu>
                                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                                        <button_1.Button variant="outline" size="icon" className={(0, utils_1.cn)('bg-transparent')}>
                                            <icons_1.Icons.Gear className="w-4 h-4"/>
                                        </button_1.Button>
                                    </dropdown_menu_1.DropdownMenuTrigger>
                                    <dropdown_menu_1.DropdownMenuContent align="end">
                                        <dropdown_menu_1.DropdownMenuItem onClick={() => window.open('https://onlook.com/', '_blank')}>
                                            {t('projects.actions.about')}
                                        </dropdown_menu_1.DropdownMenuItem>
                                        <dropdown_menu_1.DropdownMenuItem onClick={() => authManager.signOut()}>
                                            {t('projects.actions.signOut')}
                                        </dropdown_menu_1.DropdownMenuItem>
                                    </dropdown_menu_1.DropdownMenuContent>
                                </dropdown_menu_1.DropdownMenu>
                            </div>) : (<button_1.Button variant="secondary" className={(0, utils_1.cn)('w-fit h-fit flex flex-col gap-1 text-foreground-secondary hover:text-foreground-active backdrop-blur-md bg-background/30', projectsManager.create.state !== create_1.CreateState.PROMPT && 'hidden')} onClick={returnToProjects}>
                                <icons_1.Icons.CrossL className="w-4 h-4 cursor-pointer"/>
                                <p className="text-microPlus">{t('projects.actions.close')}</p>
                            </button_1.Button>)}
                    </div>
                    <div className="flex items-center justify-center p-4">{renderCard()}</div>
                </div>
            </div>
        </div>);
});
exports.default = exports.PromptCreation;
//# sourceMappingURL=index.js.map