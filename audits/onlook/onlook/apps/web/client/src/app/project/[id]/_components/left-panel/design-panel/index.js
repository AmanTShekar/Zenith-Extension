"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignPanel = void 0;
const editor_1 = require("@/components/store/editor");
const keys_1 = require("@/i18n/keys");
const models_1 = require("@onlook/models");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const next_intl_1 = require("next-intl");
const branches_tab_1 = require("./branches-tab");
const brand_tab_1 = require("./brand-tab");
const help_button_1 = require("./help-button");
const image_tab_1 = require("./image-tab");
const layers_tab_1 = require("./layers-tab");
const page_tab_1 = require("./page-tab");
const zoom_controls_1 = require("./zoom-controls");
const tabs = [
    {
        value: models_1.LeftPanelTabValue.LAYERS,
        icon: <icons_1.Icons.Layers className="w-5 h-5"/>,
        label: keys_1.transKeys.editor.panels.layers.tabs.layers,
    },
    {
        value: models_1.LeftPanelTabValue.BRAND,
        icon: <icons_1.Icons.Brand className="w-5 h-5"/>,
        label: keys_1.transKeys.editor.panels.layers.tabs.brand,
    },
    {
        value: models_1.LeftPanelTabValue.PAGES,
        icon: <icons_1.Icons.File className="w-5 h-5"/>,
        label: keys_1.transKeys.editor.panels.layers.tabs.pages,
    },
    {
        value: models_1.LeftPanelTabValue.IMAGES,
        icon: <icons_1.Icons.Image className="w-5 h-5"/>,
        label: keys_1.transKeys.editor.panels.layers.tabs.images,
    },
    {
        value: models_1.LeftPanelTabValue.BRANCHES,
        icon: <icons_1.Icons.Branch className="w-5 h-5"/>,
        label: keys_1.transKeys.editor.panels.layers.tabs.branches,
    },
];
exports.DesignPanel = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const t = (0, next_intl_1.useTranslations)();
    const isLocked = editorEngine.state.leftPanelLocked;
    const selectedTab = editorEngine.state.leftPanelTab;
    const handleMouseEnter = (tab) => {
        if (isLocked) {
            return;
        }
        editorEngine.state.leftPanelTab = tab;
    };
    const isMouseInContentPanel = (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const contentPanel = e.currentTarget;
        if (contentPanel) {
            const { left, right, top, bottom } = contentPanel.getBoundingClientRect();
            if (mouseX < left || mouseX > right || mouseY < top || mouseY > bottom) {
                return false;
            }
        }
        return true;
    };
    const handleMouseLeave = (e) => {
        if (!isLocked) {
            // This is to handle things like dropdown where the mouse is still in the content panel
            if (!isMouseInContentPanel(e)) {
                editorEngine.state.leftPanelTab = null;
            }
            else {
                // TODO: Since mouse leave won't trigger anymore, we need to listen and check
                //  if the mouse actually left the content panel and then close the content panel
            }
        }
        else {
            // If we're locked, return to the locked tab when mouse leaves
            editorEngine.state.leftPanelTab = selectedTab;
        }
    };
    const handleClick = (tab) => {
        if (selectedTab === tab && isLocked) {
            editorEngine.state.leftPanelLocked = false;
        }
        else {
            editorEngine.state.leftPanelTab = tab;
            editorEngine.state.leftPanelLocked = true;
        }
    };
    return (<div className="flex h-full overflow-auto" onMouseLeave={handleMouseLeave}>
            {/* Left sidebar with tabs */}
            <div className="w-20 flex flex-col items-center py-0.5 gap-2 bg-background-onlook/60 backdrop-blur-xl">
                {tabs.map((tab) => (<button key={tab.value} className={(0, utils_1.cn)('w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 p-2', selectedTab === tab.value && isLocked
                ? 'bg-accent text-foreground border-[0.5px] border-foreground/20 '
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50', tab.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground')} disabled={tab.disabled} onClick={() => !tab.disabled && handleClick(tab.value)} onMouseEnter={() => !tab.disabled && handleMouseEnter(tab.value)}>
                        {tab.icon}
                        <span className="text-xs leading-tight">{t(tab.label)}</span>
                    </button>))}

                <div className="mt-auto flex flex-col gap-0 items-center mb-4">
                    <zoom_controls_1.ZoomControls />
                    <help_button_1.HelpButton />
                </div>
            </div>

            {/* Content panel */}
            {editorEngine.state.leftPanelTab && (<>
                    <div className="flex-1 w-[280px] bg-background/95 rounded-xl">
                        <div className="border backdrop-blur-xl h-full shadow overflow-auto p-0 rounded-xl">
                            {selectedTab === models_1.LeftPanelTabValue.LAYERS && <layers_tab_1.LayersTab />}
                            {selectedTab === models_1.LeftPanelTabValue.BRAND && <brand_tab_1.BrandTab />}
                            {selectedTab === models_1.LeftPanelTabValue.PAGES && <page_tab_1.PagesTab />}
                            {selectedTab === models_1.LeftPanelTabValue.IMAGES && <image_tab_1.ImagesTab />}
                            {selectedTab === models_1.LeftPanelTabValue.BRANCHES && <branches_tab_1.BranchesTab />}
                        </div>
                    </div>

                    {/* Invisible padding area that maintains hover state */}
                    {!isLocked && <div className="w-24 h-full"/>}
                </>)}
        </div>);
});
//# sourceMappingURL=index.js.map