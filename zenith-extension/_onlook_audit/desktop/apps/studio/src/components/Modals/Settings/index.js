"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModal = void 0;
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const separator_1 = require("@onlook/ui/separator");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const framer_motion_1 = require("framer-motion");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const Advance_1 = __importDefault(require("./Advance"));
const Domain_1 = require("./Domain");
const Preferences_1 = __importDefault(require("./Preferences"));
const Project_1 = __importDefault(require("./Project"));
const Site_1 = require("./Site");
const Page_1 = require("./Site/Page");
const Versions_1 = require("./Versions");
const helpers_1 = require("/common/helpers");
exports.SettingsModal = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const projectsManager = (0, Context_1.useProjectsManager)();
    const project = projectsManager.project;
    const pagesManager = editorEngine.pages;
    (0, react_1.useEffect)(() => {
        if (editorEngine.isSettingsOpen && project) {
            pagesManager.scanPages();
            editorEngine.image.scanImages();
            projectsManager.scanProjectMetadata(project);
        }
    }, [editorEngine.isSettingsOpen]);
    const flattenPages = (0, react_1.useMemo)(() => {
        return pagesManager.tree.reduce((acc, page) => {
            const flattenNode = (node) => {
                if (node.children?.length) {
                    node.children.forEach((child) => flattenNode(child));
                }
                else {
                    acc.push(node);
                }
            };
            flattenNode(page);
            return acc;
        }, []);
    }, [pagesManager.tree]);
    const projectOnlyTabs = [
        {
            label: models_1.SettingsTabValue.SITE,
            icon: <icons_1.Icons.File className="mr-2 h-4 w-4"/>,
            component: <Site_1.SiteTab />,
        },
        {
            label: models_1.SettingsTabValue.DOMAIN,
            icon: <icons_1.Icons.Globe className="mr-2 h-4 w-4"/>,
            component: <Domain_1.DomainTab />,
        },
        {
            label: models_1.SettingsTabValue.PROJECT,
            icon: <icons_1.Icons.Gear className="mr-2 h-4 w-4"/>,
            component: <Project_1.default />,
        },
        {
            label: models_1.SettingsTabValue.VERSIONS,
            icon: <icons_1.Icons.Code className="mr-2 h-4 w-4"/>,
            component: <Versions_1.VersionsTab />,
        },
    ];
    const globalTabs = [
        {
            label: models_1.SettingsTabValue.PREFERENCES,
            icon: <icons_1.Icons.Person className="mr-2 h-4 w-4"/>,
            component: <Preferences_1.default />,
        },
        {
            label: models_1.SettingsTabValue.ADVANCED,
            icon: <icons_1.Icons.MixerVertical className="mr-2 h-4 w-4"/>,
            component: <Advance_1.default />,
        },
    ];
    const pagesTabs = flattenPages.map((page) => ({
        label: page.path === '/' ? 'Home' : page.path,
        icon: <icons_1.Icons.File className="mr-2 h-4 min-w-4"/>,
        component: <Page_1.PageTab metadata={page.metadata} path={page.path}/>,
    }));
    const tabs = project ? [...projectOnlyTabs, ...globalTabs, ...pagesTabs] : [...globalTabs];
    return (<framer_motion_1.AnimatePresence>
            {editorEngine.isSettingsOpen && (<>
                    {/* Backdrop */}
                    <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => (editorEngine.isSettingsOpen = false)}/>

                    {/* Modal */}
                    <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <div className="bg-background border rounded-lg shadow-lg max-w-4xl max-h-screen h-[700px] w-[900px] p-0 pointer-events-auto">
                            <div className="flex flex-col h-full overflow-hidden">
                                {/* Top bar - fixed height */}
                                <div className="shrink-0 flex items-center p-6 pb-4">
                                    <h1 className="text-title3">Settings</h1>
                                    <button_1.Button variant="ghost" size="icon" className="ml-auto" onClick={() => (editorEngine.isSettingsOpen = false)}>
                                        <icons_1.Icons.CrossS className="h-4 w-4"/>
                                    </button_1.Button>
                                </div>
                                <separator_1.Separator orientation="horizontal" className="shrink-0"/>

                                {/* Main content */}
                                <div className="flex flex-1 min-h-0 overflow-hidden">
                                    {/* Left navigation - fixed width */}
                                    <div className="flex flex-col overflow-y-scroll">
                                        <div className="shrink-0 w-48 space-y-2 p-6 text-regularPlus">
                                            <p className="text-muted-foreground text-smallPlus">
                                                Project
                                            </p>
                                            {projectOnlyTabs.map((tab) => (<button_1.Button key={tab.label} variant="ghost" className={(0, utils_1.cn)('w-full justify-start px-0 hover:bg-transparent', editorEngine.settingsTab === tab.label
                    ? 'text-foreground-active'
                    : 'text-muted-foreground')} onClick={() => (editorEngine.settingsTab = tab.label)}>
                                                    {tab.icon}
                                                    {(0, helpers_1.capitalizeFirstLetter)(tab.label.toLowerCase())}
                                                </button_1.Button>))}
                                        </div>
                                        <separator_1.Separator />
                                        <div className="shrink-0 w-48 space-y-2 p-6 text-regularPlus">
                                            <p className="text-muted-foreground text-smallPlus">
                                                Page Settings
                                            </p>
                                            {pagesTabs.map((tab) => (<button_1.Button key={tab.label} variant="ghost" className={(0, utils_1.cn)('w-full justify-start px-0 hover:bg-transparent', 'truncate', editorEngine.settingsTab === tab.label
                    ? 'text-foreground-active'
                    : 'text-muted-foreground')} onClick={() => (editorEngine.settingsTab = tab.label)}>
                                                    {tab.icon}
                                                    <tooltip_1.Tooltip>
                                                        <tooltip_1.TooltipTrigger asChild>
                                                            <span className="truncate">
                                                                {(0, helpers_1.capitalizeFirstLetter)(tab.label.toLowerCase())}
                                                            </span>
                                                        </tooltip_1.TooltipTrigger>
                                                        <tooltip_1.TooltipContent>
                                                            {(0, helpers_1.capitalizeFirstLetter)(tab.label.toLowerCase())}
                                                        </tooltip_1.TooltipContent>
                                                    </tooltip_1.Tooltip>
                                                </button_1.Button>))}
                                        </div>
                                        <separator_1.Separator />
                                        <div className="shrink-0 w-48 space-y-2 p-6 text-regularPlus">
                                            <p className="text-muted-foreground text-smallPlus">
                                                Global Settings
                                            </p>
                                            {globalTabs.map((tab) => (<button_1.Button key={tab.label} variant="ghost" className={(0, utils_1.cn)('w-full justify-start px-0 hover:bg-transparent', editorEngine.settingsTab === tab.label
                    ? 'text-foreground-active'
                    : 'text-muted-foreground')} onClick={() => (editorEngine.settingsTab = tab.label)}>
                                                    {tab.icon}
                                                    {(0, helpers_1.capitalizeFirstLetter)(tab.label.toLowerCase())}
                                                </button_1.Button>))}
                                        </div>
                                    </div>
                                    <separator_1.Separator orientation="vertical" className="h-full"/>
                                    {/* Right content */}
                                    <div className="flex-1 overflow-y-auto">
                                        {tabs.find((tab) => tab.label === editorEngine.settingsTab)?.component}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </framer_motion_1.motion.div>
                </>)}
        </framer_motion_1.AnimatePresence>);
});
//# sourceMappingURL=index.js.map