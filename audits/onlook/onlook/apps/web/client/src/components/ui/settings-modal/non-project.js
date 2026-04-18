"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonProjectSettingsModal = void 0;
const state_1 = require("@/components/store/state");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const separator_1 = require("@onlook/ui/separator");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("motion/react");
const helpers_1 = require("./helpers");
const preferences_tab_1 = require("./preferences-tab");
const subscription_tab_1 = require("./subscription-tab");
exports.NonProjectSettingsModal = (0, mobx_react_lite_1.observer)(() => {
    const stateManager = (0, state_1.useStateManager)();
    const tabs = [
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
                                            <p className="text-muted-foreground text-smallPlus ml-2.5 mt-2 mb-2">
                                                Global Settings
                                            </p>
                                            {tabs.map((tab) => (<button_1.Button key={tab.label} variant="ghost" className={(0, utils_1.cn)('w-full justify-start px-0 hover:bg-transparent', stateManager.settingsTab === tab.label
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
//# sourceMappingURL=non-project.js.map