"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModalWithProjects = void 0;
const editor_1 = require("@/components/store/editor");
const state_1 = require("@/components/store/state");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const separator_1 = require("@onlook/ui/separator");
const tooltip_1 = require("@onlook/ui/tooltip");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const react_2 = require("react");
const domain_1 = __importDefault(require("./domain"));
const helpers_1 = require("./helpers");
const preferences_tab_1 = require("./preferences-tab");
const project_1 = require("./project");
const site_1 = require("./site");
const page_1 = require("./site/page");
const subscription_tab_1 = require("./subscription-tab");
const versions_1 = require("./versions");
function TruncatedLabelWithTooltip({ label }) {
    const [isTruncated, setIsTruncated] = (0, react_2.useState)(false);
    const spanRef = (0, react_2.useRef)(null);
    (0, react_2.useEffect)(() => {
        const el = spanRef.current;
        if (el) {
            setIsTruncated(el.scrollWidth > el.clientWidth);
        }
    }, [label]);
    return isTruncated ? (<tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild>
                <span ref={spanRef} className="truncate">
                    {label}
                </span>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side='right'>
                {label}
            </tooltip_1.TooltipContent>
        </tooltip_1.Tooltip>) : (<span ref={spanRef} className="truncate">{label}</span>);
}
exports.SettingsModalWithProjects = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const stateManager = (0, state_1.useStateManager)();
    const pagesManager = editorEngine.pages;
    const flattenPages = (0, react_2.useMemo)(() => {
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
    const globalTabs = [
        {
            label: helpers_1.SettingsTabValue.PREFERENCES,
            icon: <icons_1.Icons.Person className="mr-2 h-4 w-4"/>,
            component: <preferences_tab_1.PreferencesTab />,
        },
        {
            label: helpers_1.SettingsTabValue.SUBSCRIPTION,
            icon: <icons_1.Icons.CreditCard className="mr-2 h-4 w-4"/>,
            component: <subscription_tab_1.SubscriptionTab />,
        },
    ];
    const projectTabs = [
        {
            label: helpers_1.SettingsTabValue.SITE,
            icon: <icons_1.Icons.File className="mr-2 h-4 w-4"/>,
            component: <site_1.SiteTab />,
        },
        {
            label: helpers_1.SettingsTabValue.DOMAIN,
            icon: <icons_1.Icons.Globe className="mr-2 h-4 w-4"/>,
            component: <domain_1.default />,
        },
        {
            label: helpers_1.SettingsTabValue.PROJECT,
            icon: <icons_1.Icons.Gear className="mr-2 h-4 w-4"/>,
            component: <project_1.ProjectTab />,
        },
        {
            label: helpers_1.SettingsTabValue.VERSIONS,
            icon: <icons_1.Icons.Code className="mr-2 h-4 w-4"/>,
            component: <versions_1.VersionsTab />,
        },
    ];
    const pagesTabs = flattenPages
        .filter((page) => page.path !== '/')
        .map((page) => ({
        label: page.path,
        icon: <icons_1.Icons.File className="mr-2 h-4 min-w-4"/>,
        component: <page_1.PageTab metadata={page.metadata} path={page.path}/>,
    }));
    const tabs = [...globalTabs, ...pagesTabs, ...projectTabs];
    // TODO: use file system like code tab
    (0, react_2.useEffect)(() => {
        if (!stateManager.isSettingsModalOpen) {
            return;
        }
        editorEngine.pages.scanPages();
    }, [stateManager.isSettingsModalOpen]);
    return (<react_1.AnimatePresence>
            {stateManager.isSettingsModalOpen && (<>
                    {/* Backdrop */}
                    <react_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => (stateManager.isSettingsModalOpen = false)}/>

                    {/* Modal */}
                    <react_1.motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <div className="bg-background border rounded-lg shadow-lg max-w-4xl max-h-screen h-[700px] w-[900px] p-0 pointer-events-auto">
                            <div className="flex flex-col h-full overflow-hidden">
                                {/* Top bar - fixed height */}
                                <div className="shrink-0 flex items-center p-5 pb-4 ml-1 select-none">
                                    <h1 className="text-title3">Settings</h1>
                                    <button_1.Button variant="ghost" size="icon" className="ml-auto" onClick={() => (stateManager.isSettingsModalOpen = false)}>
                                        <icons_1.Icons.CrossS className="h-4 w-4"/>
                                    </button_1.Button>
                                </div>
                                <separator_1.Separator orientation="horizontal" className="shrink-0"/>

                                {/* Main content */}
                                <div className="flex flex-1 min-h-0 overflow-hidden">
                                    {/* Left navigation - fixed width */}
                                    <div className="flex flex-col overflow-y-scroll select-none">
                                        <div className="shrink-0 w-48 space-y-1 p-5 text-regularPlus">
                                            <p className="text-muted-foreground text-smallPlus ml-2.5 mt-2 mb-0.5">
                                                Project
                                            </p>
                                            <div className="flex items-center gap-1.5 ml-2.5 mb-3 text-muted-foreground/80">
                                                <icons_1.Icons.Branch className="min-h-3 min-w-3"/>
                                                <span className="text-small truncate max-w-30">
                                                    {editorEngine.branches.activeBranch.name}
                                                </span>
                                            </div>
                                            {projectTabs.map((tab) => (<button_1.Button key={tab.label} variant="ghost" className={(0, utils_1.cn)('w-full justify-start px-0 hover:bg-transparent', stateManager.settingsTab === tab.label
                    ? 'text-foreground-active'
                    : 'text-muted-foreground')} onClick={() => (stateManager.settingsTab = tab.label)}>
                                                    {tab.icon}
                                                    {(0, utility_1.capitalizeFirstLetter)(tab.label.toLowerCase())}
                                                </button_1.Button>))}
                                        </div>
                                        <separator_1.Separator />
                                        {pagesTabs.length > 0 && (<>
                                                <div className="shrink-0 w-48 space-y-1 p-5 text-regularPlus">
                                                    <p className="text-muted-foreground text-smallPlus ml-2.5 mt-2 mb-2">
                                                        Pages Settings
                                                    </p>
                                                    {pagesTabs.map((tab) => (<button_1.Button key={tab.label} variant="ghost" className={(0, utils_1.cn)('w-full justify-start px-0 hover:bg-transparent', 'truncate', stateManager.settingsTab ===
                        tab.label
                        ? 'text-foreground-active'
                        : 'text-muted-foreground')} onClick={() => (stateManager.settingsTab =
                        tab.label)}>
                                                            {tab.icon}
                                                            <TruncatedLabelWithTooltip label={(0, utility_1.capitalizeFirstLetter)(tab.label.toLowerCase())}/>
                                                        </button_1.Button>))}
                                                </div>
                                                <separator_1.Separator />
                                            </>)}
                                        <div className="shrink-0 w-48 space-y-1 p-5 text-regularPlus">
                                            <p className="text-muted-foreground text-smallPlus ml-2.5 mt-2 mb-2">
                                                Global Settings
                                            </p>
                                            {globalTabs.map((tab) => (<button_1.Button key={tab.label} variant="ghost" className={(0, utils_1.cn)('w-full justify-start px-0 hover:bg-transparent', stateManager.settingsTab === tab.label
                    ? 'text-foreground-active'
                    : 'text-muted-foreground')} onClick={() => (stateManager.settingsTab = tab.label)}>
                                                    {tab.icon}
                                                    {(0, utility_1.capitalizeFirstLetter)(tab.label.toLowerCase())}
                                                </button_1.Button>))}
                                        </div>
                                    </div>
                                    <separator_1.Separator orientation="vertical" className="h-full"/>
                                    {/* Right content */}
                                    <div className="flex-1 overflow-y-auto">
                                        {tabs.find((tab) => tab.label === stateManager.settingsTab)?.component}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </react_1.motion.div>
                </>)}
        </react_1.AnimatePresence>);
});
//# sourceMappingURL=with-project.js.map