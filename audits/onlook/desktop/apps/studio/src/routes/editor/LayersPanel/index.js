"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayersPanel = void 0;
const Context_1 = require("@/components/Context");
const models_1 = require("@/lib/models");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_i18next_1 = require("react-i18next");
const AppsTab_1 = __importDefault(require("./AppsTab"));
const BrandTab_1 = __importDefault(require("./BrandTab"));
const ComponentsTab_1 = __importDefault(require("./ComponentsTab"));
const HelpDropdown_1 = require("./HelpDropdown");
const ImageTab_1 = __importDefault(require("./ImageTab"));
const LayersTab_1 = __importDefault(require("./LayersTab"));
const OpenCodeMini_1 = __importDefault(require("./OpenCodeMini"));
const PageTab_1 = __importDefault(require("./PageTab"));
const WindowsTab_1 = __importDefault(require("./WindowsTab"));
const ZoomControls_1 = __importDefault(require("./ZoomControls"));
exports.LayersPanel = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const { t } = (0, react_i18next_1.useTranslation)();
    const isLocked = editorEngine.isLayersPanelLocked;
    const selectedTab = editorEngine.layersPanelTab;
    const handleMouseEnter = (tab) => {
        if (isLocked) {
            return;
        }
        editorEngine.layersPanelTab = tab;
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
                editorEngine.layersPanelTab = null;
            }
            else {
                // TODO: Since mouse leave won't trigger anymore, we need to listen and check
                //  if the mouse actually left the content panel and then close the content panel
            }
        }
        else {
            // If we're locked, return to the locked tab when mouse leaves
            editorEngine.layersPanelTab = selectedTab;
        }
    };
    const handleClick = (tab) => {
        if (selectedTab === tab && isLocked) {
            editorEngine.isLayersPanelLocked = false;
        }
        else {
            editorEngine.layersPanelTab = tab;
            editorEngine.isLayersPanelLocked = true;
        }
    };
    return (<div className={(0, utils_1.cn)('flex gap-0 h-[calc(100vh-5rem)] ', editorEngine.mode === models_1.EditorMode.PREVIEW ? 'hidden' : 'visible')} onMouseLeave={handleMouseLeave}>
            {/* Left sidebar with tabs */}
            <div className="w-20 bg-background-onlook/60 backdrop-blur-xl flex flex-col items-center py-0.5 gap-2">
                <button className={(0, utils_1.cn)('w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 p-2', selectedTab === models_1.LayersPanelTabValue.LAYERS && isLocked
            ? 'bg-accent text-foreground border-[0.5px] border-foreground/20'
            : 'text-muted-foreground hover:text-foreground')} onClick={() => handleClick(models_1.LayersPanelTabValue.LAYERS)} onMouseEnter={() => handleMouseEnter(models_1.LayersPanelTabValue.LAYERS)}>
                    <icons_1.Icons.Layers className="w-5 h-5"/>
                    <span className="text-xs leading-tight">
                        {t('editor.panels.layers.tabs.layers')}
                    </span>
                </button>

                <button className={(0, utils_1.cn)('w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 p-2', selectedTab === models_1.LayersPanelTabValue.PAGES && isLocked
            ? 'bg-accent text-foreground border-[0.5px] border-foreground/20'
            : 'text-muted-foreground hover:text-foreground')} onClick={() => handleClick(models_1.LayersPanelTabValue.PAGES)} onMouseEnter={() => handleMouseEnter(models_1.LayersPanelTabValue.PAGES)}>
                    <icons_1.Icons.File className="w-5 h-5"/>
                    <span className="text-xs leading-tight">
                        {t('editor.panels.layers.tabs.pages')}
                    </span>
                </button>

                <button className={(0, utils_1.cn)('w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 p-2', selectedTab === models_1.LayersPanelTabValue.IMAGES && isLocked
            ? 'bg-accent text-foreground border-[0.5px] border-foreground/20'
            : 'text-muted-foreground hover:text-foreground')} onClick={() => handleClick(models_1.LayersPanelTabValue.IMAGES)} onMouseEnter={() => handleMouseEnter(models_1.LayersPanelTabValue.IMAGES)}>
                    <icons_1.Icons.Image className="w-5 h-5"/>
                    <span className="text-xs leading-tight">
                        {t('editor.panels.layers.tabs.images')}
                    </span>
                </button>

                <button className={(0, utils_1.cn)('w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 p-2', selectedTab === models_1.LayersPanelTabValue.WINDOWS && isLocked
            ? 'bg-accent text-foreground border-[0.5px] border-foreground/20'
            : 'text-muted-foreground hover:text-foreground')} onClick={() => handleClick(models_1.LayersPanelTabValue.WINDOWS)} onMouseEnter={() => handleMouseEnter(models_1.LayersPanelTabValue.WINDOWS)}>
                    <icons_1.Icons.Desktop className="w-5 h-5"/>
                    <span className="text-xs leading-tight">
                        {t('editor.panels.layers.tabs.windows.name')}
                    </span>
                </button>

                <button className={(0, utils_1.cn)('w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 p-2', selectedTab === models_1.LayersPanelTabValue.BRAND && isLocked
            ? 'bg-accent text-foreground border-[0.5px] border-foreground/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50')} onClick={() => handleClick(models_1.LayersPanelTabValue.BRAND)} onMouseEnter={() => handleMouseEnter(models_1.LayersPanelTabValue.BRAND)}>
                    <icons_1.Icons.Brand className="w-5 h-5"/>
                    <span className="text-xs leading-tight">
                        {t('editor.panels.layers.tabs.brand')}
                    </span>
                </button>

                <button className={(0, utils_1.cn)('w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 p-2 hidden', selectedTab === models_1.LayersPanelTabValue.APPS && isLocked
            ? 'bg-accent text-foreground border-[0.5px] border-foreground/20'
            : 'text-muted-foreground hover:text-foreground')} onClick={() => handleClick(models_1.LayersPanelTabValue.APPS)} onMouseEnter={() => handleMouseEnter(models_1.LayersPanelTabValue.APPS)}>
                    <icons_1.Icons.ViewGrid className="w-5 h-5"/>
                    <span className="text-xs leading-tight">
                        {t('editor.panels.layers.tabs.apps')}
                    </span>
                </button>

                <button className={(0, utils_1.cn)('w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 p-2 hidden', selectedTab === models_1.LayersPanelTabValue.COMPONENTS && isLocked
            ? 'bg-accent text-foreground border-[0.5px] border-foreground/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50')} onClick={() => handleClick(models_1.LayersPanelTabValue.COMPONENTS)} onMouseEnter={() => handleMouseEnter(models_1.LayersPanelTabValue.COMPONENTS)}>
                    <icons_1.Icons.Component className="w-5 h-5"/>
                    <span className="text-xs leading-tight">Elements</span>
                </button>

                <div className="mt-auto flex flex-col gap-0 items-center mb-4">
                    <OpenCodeMini_1.default />
                    <ZoomControls_1.default />
                    <HelpDropdown_1.HelpDropdown />
                </div>
            </div>

            {/* Content panel */}
            {editorEngine.layersPanelTab && (<>
                    <div className="flex-1 w-[280px] bg-background/95 rounded-xl">
                        <div className="border backdrop-blur-xl h-full shadow overflow-auto p-0 rounded-xl">
                            {selectedTab === models_1.LayersPanelTabValue.LAYERS && <LayersTab_1.default />}
                            {selectedTab === models_1.LayersPanelTabValue.COMPONENTS && (<ComponentsTab_1.default components={editorEngine.projectInfo.components}/>)}
                            {selectedTab === models_1.LayersPanelTabValue.PAGES && <PageTab_1.default />}
                            {selectedTab === models_1.LayersPanelTabValue.IMAGES && <ImageTab_1.default />}
                            {selectedTab === models_1.LayersPanelTabValue.WINDOWS && <WindowsTab_1.default />}
                            {selectedTab === models_1.LayersPanelTabValue.BRAND && <BrandTab_1.default />}
                            {selectedTab === models_1.LayersPanelTabValue.APPS && <AppsTab_1.default />}
                        </div>
                    </div>

                    {/* Invisible padding area that maintains hover state */}
                    {!isLocked && <div className="w-24 h-full"/>}
                </>)}
        </div>);
});
//# sourceMappingURL=index.js.map